use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::Json;
use mosto_core::brewday::{
    store, BrewSession, BrewSessionInput, GravityReading, GravityReadingInput, SessionStatus,
};
use serde::Deserialize;

use crate::state::AppState;

type ApiError = (StatusCode, String);

fn internal(e: impl std::fmt::Display) -> ApiError {
    tracing::error!("brewday error: {e}");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error".to_string())
}

pub async fn list_sessions(
    State(state): State<AppState>,
) -> Result<Json<Vec<BrewSession>>, ApiError> {
    let sessions = store::list_sessions(&state.pool).await.map_err(internal)?;
    Ok(Json(sessions))
}

pub async fn get_session(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<BrewSession>, ApiError> {
    store::get_session(&state.pool, &id)
        .await
        .map_err(internal)?
        .map(Json)
        .ok_or((StatusCode::NOT_FOUND, "session not found".to_string()))
}

pub async fn create_session(
    State(state): State<AppState>,
    Json(body): Json<BrewSessionInput>,
) -> Result<Json<BrewSession>, ApiError> {
    let session = store::create_session(&state.pool, body)
        .await
        .map_err(internal)?;
    Ok(Json(session))
}

#[derive(Deserialize)]
pub struct StatusBody {
    status: SessionStatus,
}

pub async fn update_session_status(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<StatusBody>,
) -> Result<Json<BrewSession>, ApiError> {
    store::update_session_status(&state.pool, &id, body.status)
        .await
        .map_err(internal)?
        .map(Json)
        .ok_or((StatusCode::NOT_FOUND, "session not found".to_string()))
}

pub async fn delete_session(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let deleted = store::delete_session(&state.pool, &id)
        .await
        .map_err(internal)?;
    Ok(if deleted {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    })
}

pub async fn list_completed_steps(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<i64>>, ApiError> {
    let steps = store::completed_steps(&state.pool, &id)
        .await
        .map_err(internal)?;
    Ok(Json(steps))
}

#[derive(Deserialize)]
pub struct StepBody {
    completed: bool,
}

pub async fn set_step_completed(
    State(state): State<AppState>,
    Path((id, step_id)): Path<(String, i64)>,
    Json(body): Json<StepBody>,
) -> Result<StatusCode, ApiError> {
    store::set_step_completed(&state.pool, &id, step_id, body.completed)
        .await
        .map_err(internal)?;
    Ok(StatusCode::NO_CONTENT)
}

pub async fn list_gravity_readings(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Vec<GravityReading>>, ApiError> {
    let readings = store::list_gravity_readings(&state.pool, &id)
        .await
        .map_err(internal)?;
    Ok(Json(readings))
}

pub async fn add_gravity_reading(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<GravityReadingInput>,
) -> Result<Json<GravityReading>, ApiError> {
    let reading = store::add_gravity_reading(&state.pool, &id, body)
        .await
        .map_err(internal)?;
    Ok(Json(reading))
}

pub async fn delete_gravity_reading(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let deleted = store::delete_gravity_reading(&state.pool, &id)
        .await
        .map_err(internal)?;
    Ok(if deleted {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    })
}
