use serde::Serialize;

// Self-hosted mode is single-owner only — no roles, no registration. Anyone
// who can authenticate is the owner.
#[derive(Debug, Clone, Serialize)]
pub struct User {
    pub id: String,
    pub username: String,
    #[serde(skip_serializing)]
    pub password_hash: String,
    pub created_at: i64,
}
