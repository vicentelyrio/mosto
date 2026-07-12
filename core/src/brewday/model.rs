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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrewSession {
    pub id: String,
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

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScheduleEvent {
    pub id: String,
    pub session_id: String,
    pub date: String,
    pub title: String,
    pub subtitle: String,
}
