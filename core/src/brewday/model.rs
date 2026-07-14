use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum SessionStatus {
    Planning,
    Brewing,
    Fermenting,
    Conditioning,
    Packaged,
    Archived,
}

impl SessionStatus {
    /// Matches the `brew_sessions.status` CHECK constraint values.
    pub fn as_str(self) -> &'static str {
        match self {
            SessionStatus::Planning => "planning",
            SessionStatus::Brewing => "brewing",
            SessionStatus::Fermenting => "fermenting",
            SessionStatus::Conditioning => "conditioning",
            SessionStatus::Packaged => "packaged",
            SessionStatus::Archived => "archived",
        }
    }

    pub fn from_code(s: &str) -> Self {
        match s {
            "planning" => SessionStatus::Planning,
            "brewing" => SessionStatus::Brewing,
            "fermenting" => SessionStatus::Fermenting,
            "conditioning" => SessionStatus::Conditioning,
            "packaged" => SessionStatus::Packaged,
            "archived" => SessionStatus::Archived,
            other => panic!("unknown brew session status: {other}"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewSession {
    pub id: String,
    pub recipe_id: String,
    pub status: SessionStatus,
    pub started_at: Option<i64>,
}

/// Create payload — same shape as `BrewSession` minus the server-assigned `id`.
#[derive(Debug, Clone, Deserialize)]
pub struct BrewSessionInput {
    pub recipe_id: String,
    pub status: SessionStatus,
    pub started_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GravityReading {
    pub id: String,
    pub session_id: String,
    pub date: String,
    pub sg: f64,
    pub temp: Option<f64>,
    pub note: String,
}

/// Create payload — same shape as `GravityReading` minus the server-assigned
/// `id` and `session_id` (which comes from the URL path).
#[derive(Debug, Clone, Deserialize)]
pub struct GravityReadingInput {
    pub date: String,
    pub sg: f64,
    pub temp: Option<f64>,
    pub note: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleEvent {
    pub id: String,
    pub session_id: String,
    pub date: String,
    pub title: String,
    pub subtitle: String,
}
