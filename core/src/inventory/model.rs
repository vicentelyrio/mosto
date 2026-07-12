use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InventoryCategory {
    Grain,
    Hop,
    Yeast,
    Adjunct,
    WaterChem,
    Packaging,
}

impl InventoryCategory {
    /// Matches the `inventory_items.category` CHECK constraint values.
    pub fn as_str(self) -> &'static str {
        match self {
            InventoryCategory::Grain => "grain",
            InventoryCategory::Hop => "hop",
            InventoryCategory::Yeast => "yeast",
            InventoryCategory::Adjunct => "adjunct",
            InventoryCategory::WaterChem => "water_chem",
            InventoryCategory::Packaging => "packaging",
        }
    }

    pub fn from_str(s: &str) -> Self {
        match s {
            "grain" => InventoryCategory::Grain,
            "hop" => InventoryCategory::Hop,
            "yeast" => InventoryCategory::Yeast,
            "adjunct" => InventoryCategory::Adjunct,
            "water_chem" => InventoryCategory::WaterChem,
            "packaging" => InventoryCategory::Packaging,
            other => panic!("unknown inventory category: {other}"),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InventoryItem {
    pub id: String,
    pub category: InventoryCategory,
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub low_threshold: Option<f64>,
    pub expiry: Option<String>,
    // Category-specific, so only ever some of these are populated.
    pub brand: Option<String>,
    pub alpha: Option<f64>,
    pub form: Option<String>,
    pub attenuation: Option<String>,
    pub created_at: i64,
}

/// Create/update payload — same shape as `InventoryItem` minus the
/// server-assigned `id` and `created_at`.
#[derive(Debug, Clone, Deserialize)]
pub struct InventoryItemInput {
    pub category: InventoryCategory,
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub low_threshold: Option<f64>,
    pub expiry: Option<String>,
    pub brand: Option<String>,
    pub alpha: Option<f64>,
    pub form: Option<String>,
    pub attenuation: Option<String>,
}
