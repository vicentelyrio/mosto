use std::net::SocketAddr;

use axum::extract::{ConnectInfo, State};
use axum::http::{header, StatusCode};
use axum::response::{IntoResponse, Json, Response};
use axum_extra::extract::CookieJar;
use serde::Deserialize;

use super::model::User;
use super::{password, session, store, CurrentUser};
use crate::state::AppState;

type ApiError = (StatusCode, String);

const MAX_PASSWORD: usize = 128;

fn internal(e: impl std::fmt::Display) -> ApiError {
    tracing::error!("auth error: {e}");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error".to_string())
}

async fn verify_off_runtime(password: String, phc: String) -> Result<bool, ApiError> {
    tokio::task::spawn_blocking(move || password::verify(&password, &phc))
        .await
        .map_err(internal)
}

#[derive(Deserialize)]
pub struct LoginReq {
    username: String,
    password: String,
    #[serde(default)]
    remember: bool,
}

pub async fn login(
    State(state): State<AppState>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    Json(req): Json<LoginReq>,
) -> Result<Response, ApiError> {
    let ip = addr.ip();
    if !state.login_limiter.check(ip) {
        return Err((
            StatusCode::TOO_MANY_REQUESTS,
            "too many sign-in attempts; try again later".to_string(),
        ));
    }
    if req.password.len() > MAX_PASSWORD {
        return Err((
            StatusCode::BAD_REQUEST,
            "password must be at most 128 characters".to_string(),
        ));
    }

    let username = req.username.trim();
    let user = store::find_by_username(&state.pool, username)
        .await
        .map_err(internal)?;

    let phc = user
        .as_ref()
        .map(|u| u.password_hash.clone())
        .unwrap_or_else(|| password::DUMMY_HASH.clone());
    let verified = verify_off_runtime(req.password, phc).await?;

    let user = match user {
        Some(u) if verified => u,
        _ => {
            state.login_limiter.record(ip);
            return Err((StatusCode::UNAUTHORIZED, "invalid credentials".to_string()));
        }
    };

    let ttl_secs = if req.remember {
        state.auth.session_ttl_days * 86_400
    } else {
        session::SHORT_TTL_HOURS * 3_600
    };

    let token = session::generate_token();
    store::create_session(&state.pool, &session::hash_token(&token), &user.id, ttl_secs)
        .await
        .map_err(internal)?;
    state.login_limiter.clear(ip);

    if let Err(e) = store::sweep_expired_sessions(&state.pool).await {
        tracing::warn!("session sweep failed: {e}");
    }

    let persistent_cookie_secs = req.remember.then_some(ttl_secs);
    let mut resp = Json(user).into_response();
    resp.headers_mut().insert(
        header::SET_COOKIE,
        session::set_cookie(&token, persistent_cookie_secs, state.auth.secure_cookies),
    );
    Ok(resp)
}

pub async fn logout(State(state): State<AppState>, jar: CookieJar) -> Result<Response, ApiError> {
    if let Some(cookie) = jar.get(session::COOKIE_NAME) {
        store::delete_session(&state.pool, &session::hash_token(cookie.value()))
            .await
            .map_err(internal)?;
    }

    let mut resp = StatusCode::NO_CONTENT.into_response();
    resp.headers_mut().insert(
        header::SET_COOKIE,
        session::clear_cookie(state.auth.secure_cookies),
    );
    Ok(resp)
}

pub async fn me(CurrentUser(user): CurrentUser) -> Json<User> {
    Json(user)
}
