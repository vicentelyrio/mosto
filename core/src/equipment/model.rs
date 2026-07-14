use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum Condition {
    Good,
    Fair,
    Poor,
}

impl Condition {
    /// Matches the `equipment.condition` CHECK constraint values.
    pub fn as_str(self) -> &'static str {
        match self {
            Condition::Good => "good",
            Condition::Fair => "fair",
            Condition::Poor => "poor",
        }
    }

    pub fn from_code(s: &str) -> Self {
        match s {
            "good" => Condition::Good,
            "fair" => Condition::Fair,
            "poor" => Condition::Poor,
            other => panic!("unknown equipment condition: {other}"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Equipment {
    pub id: String,
    pub name: String,
    pub r#type: String,
    pub capacity: String,
    pub material: String,
    pub condition: Condition,
    pub notes: String,
    pub created_at: i64,
}

/// Create/update payload — same shape as `Equipment` minus the
/// server-assigned `id` and `created_at`.
#[derive(Debug, Clone, Deserialize)]
pub struct EquipmentInput {
    pub name: String,
    pub r#type: String,
    pub capacity: String,
    pub material: String,
    pub condition: Condition,
    pub notes: String,
}
