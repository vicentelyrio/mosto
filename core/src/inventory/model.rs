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
}
