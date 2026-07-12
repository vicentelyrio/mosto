use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Recipe {
    pub id: String,
    pub name: String,
    pub style: String,
    pub bjcp_code: String,
    pub batch_size: f64,
    pub og: f64,
    pub fg: f64,
    pub abv: f64,
    pub ibu: f64,
    pub srm: f64,
    pub efficiency: f64,
    pub boil_time: f64,
    pub notes: String,
    pub last_brewed: Option<String>,
    pub created_at: i64,
    pub tags: Vec<String>,
    pub grains: Vec<RecipeGrain>,
    pub hops: Vec<RecipeHop>,
    pub yeasts: Vec<RecipeYeast>,
    pub water: Option<WaterProfile>,
    pub mash: Option<Mash>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeGrain {
    pub name: String,
    /// BeerXML fermentable type: Grain | Sugar | Extract | Dry Extract | Adjunct.
    pub r#type: String,
    pub amount: f64,
    pub unit: String,
    pub pct: f64,
    /// Extract potential (0-100) — BeerXML's required `yield`.
    pub yield_pct: f64,
    /// Color rating in °Lovibond — BeerXML's required `color`.
    pub color_lovibond: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeHop {
    pub name: String,
    pub amount: f64,
    pub unit: String,
    pub time: f64,
    /// BeerXML use: Boil | Dry Hop | Mash | First Wort | Aroma. A
    /// flameout/whirlpool addition is `Boil` with `time: 0` — there is no
    /// separate "Flameout" value, matching real BeerXML files.
    #[serde(rename = "use")]
    pub use_: String,
    pub alpha: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeYeast {
    pub name: String,
    pub attenuation: f64,
    pub temp_range: String,
    /// BeerXML form: Liquid | Dry | Slant | Culture.
    pub form: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WaterProfile {
    pub volume: f64,
    pub ph: f64,
    pub ca: f64,
    pub mg: f64,
    pub na: f64,
    pub so4: f64,
    pub cl: f64,
    pub hco3: f64,
}

/// A single mash step. BeerXML's `type` is Infusion | Temperature | Decoction.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MashStep {
    pub name: String,
    pub r#type: String,
    pub step_temp: f64,
    pub step_time: f64,
    pub infuse_amount: Option<f64>,
    pub infuse_temp: Option<f64>,
    pub decoction_amount: Option<f64>,
    pub notes: String,
}

/// A named mash profile — 1:1 with the recipe, owning an ordered list of steps.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Mash {
    pub name: String,
    pub grain_temp: f64,
    pub notes: String,
    pub tun_temp: Option<f64>,
    pub sparge_temp: Option<f64>,
    pub tun_weight: Option<f64>,
    pub tun_specific_heat: Option<f64>,
    pub steps: Vec<MashStep>,
}

/// Create/update payload — same shape as `Recipe` minus the server-assigned
/// `id` and `created_at`.
#[derive(Debug, Clone, Deserialize)]
pub struct RecipeInput {
    pub name: String,
    pub style: String,
    pub bjcp_code: String,
    pub batch_size: f64,
    pub og: f64,
    pub fg: f64,
    pub abv: f64,
    pub ibu: f64,
    pub srm: f64,
    pub efficiency: f64,
    pub boil_time: f64,
    pub notes: String,
    pub last_brewed: Option<String>,
    pub tags: Vec<String>,
    pub grains: Vec<RecipeGrain>,
    pub hops: Vec<RecipeHop>,
    pub yeasts: Vec<RecipeYeast>,
    pub water: Option<WaterProfile>,
    pub mash: Option<Mash>,
}
