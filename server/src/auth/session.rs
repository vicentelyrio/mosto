use axum::http::header::HeaderValue;
use rand::rngs::OsRng;
use rand::RngCore;
use sha2::{Digest, Sha256};

pub const COOKIE_NAME: &str = "mosto_session";
pub const SHORT_TTL_HOURS: i64 = 12;

pub fn generate_token() -> String {
    let mut bytes = [0u8; 32];
    OsRng.fill_bytes(&mut bytes);
    hex::encode(bytes)
}

pub fn hash_token(token: &str) -> String {
    hex::encode(Sha256::digest(token.as_bytes()))
}

fn cookie_value(body: String, secure: bool) -> HeaderValue {
    let mut s = body;
    s.push_str("; Path=/; HttpOnly; SameSite=Lax");
    if secure {
        s.push_str("; Secure");
    }
    HeaderValue::from_str(&s).expect("session cookie is valid ascii")
}

pub fn set_cookie(token: &str, max_age: Option<i64>, secure: bool) -> HeaderValue {
    let mut body = format!("{COOKIE_NAME}={token}");
    if let Some(secs) = max_age {
        body.push_str(&format!("; Max-Age={secs}"));
    }
    cookie_value(body, secure)
}

pub fn clear_cookie(secure: bool) -> HeaderValue {
    cookie_value(format!("{COOKIE_NAME}=; Max-Age=0"), secure)
}
