use sqlx::SqlitePool;

use super::model::{InventoryCategory, InventoryItemInput};
use super::store;

/// Ported from the design project's `brew-data.jsx` `INVENTORY` object, so a
/// fresh install shows the same sample stock as the mockups.
pub async fn seed_if_empty(pool: &SqlitePool) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM inventory_items")
        .fetch_one(pool)
        .await
        .expect("failed to count inventory items");
    if count > 0 {
        return;
    }

    for input in sample_items() {
        store::create(pool, input)
            .await
            .expect("failed to seed sample inventory item");
    }
    tracing::info!("seeded sample inventory");
}

fn grain(name: &str, amount: f64, expiry: &str, brand: &str, low: f64) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::Grain,
        name: name.to_string(),
        amount,
        unit: "lb".to_string(),
        low_threshold: Some(low),
        expiry: Some(expiry.to_string()),
        brand: Some(brand.to_string()),
        alpha: None,
        form: None,
        attenuation: None,
    }
}

fn hop(
    name: &str,
    amount: f64,
    expiry: &str,
    alpha: f64,
    form: &str,
    low: f64,
) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::Hop,
        name: name.to_string(),
        amount,
        unit: "oz".to_string(),
        low_threshold: Some(low),
        expiry: Some(expiry.to_string()),
        brand: None,
        alpha: Some(alpha),
        form: Some(form.to_string()),
        attenuation: None,
    }
}

fn yeast(name: &str, amount: f64, expiry: &str, form: &str, attenuation: &str) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::Yeast,
        name: name.to_string(),
        amount,
        unit: "pkg".to_string(),
        low_threshold: None,
        expiry: Some(expiry.to_string()),
        brand: None,
        alpha: None,
        form: Some(form.to_string()),
        attenuation: Some(attenuation.to_string()),
    }
}

fn adjunct(name: &str, amount: f64, unit: &str, expiry: &str, brand: &str) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::Adjunct,
        name: name.to_string(),
        amount,
        unit: unit.to_string(),
        low_threshold: None,
        expiry: Some(expiry.to_string()),
        brand: Some(brand.to_string()),
        alpha: None,
        form: None,
        attenuation: None,
    }
}

fn water_chem(
    name: &str,
    amount: f64,
    unit: &str,
    expiry: Option<&str>,
    brand: &str,
) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::WaterChem,
        name: name.to_string(),
        amount,
        unit: unit.to_string(),
        low_threshold: None,
        expiry: expiry.map(|s| s.to_string()),
        brand: Some(brand.to_string()),
        alpha: None,
        form: None,
        attenuation: None,
    }
}

fn packaging(name: &str, amount: f64, unit: &str) -> InventoryItemInput {
    InventoryItemInput {
        category: InventoryCategory::Packaging,
        name: name.to_string(),
        amount,
        unit: unit.to_string(),
        low_threshold: None,
        expiry: None,
        brand: None,
        alpha: None,
        form: None,
        attenuation: None,
    }
}

fn sample_items() -> Vec<InventoryItemInput> {
    vec![
        // Grains
        grain("2-Row Pale Malt", 25.0, "2026-12-01", "Briess", 10.0),
        grain("Maris Otter", 10.0, "2026-10-15", "Crisp", 5.0),
        grain("Crystal 60L", 3.0, "2027-01-01", "Briess", 2.0),
        grain("Munich Malt", 5.0, "2026-11-01", "Weyermann", 2.0),
        grain("Roasted Barley", 1.5, "2026-09-01", "Briess", 1.0),
        grain("Flaked Oats", 4.0, "2026-08-01", "Briess", 2.0),
        grain("Pilsner Malt", 8.0, "2026-12-01", "Weyermann", 5.0),
        grain("Chocolate Malt", 0.75, "2026-09-01", "Briess", 1.0),
        // Hops
        hop("Cascade", 6.0, "2026-06-01", 5.5, "pellet", 2.0),
        hop("Centennial", 3.0, "2026-06-01", 9.5, "pellet", 2.0),
        hop("Fuggle", 2.0, "2026-07-01", 4.5, "pellet", 1.0),
        hop("Hallertau", 4.0, "2026-05-01", 4.0, "pellet", 2.0),
        hop("Saaz", 1.5, "2026-05-01", 3.5, "pellet", 2.0),
        hop("East Kent Goldings", 3.0, "2026-08-01", 5.0, "pellet", 1.0),
        // Yeast
        yeast("Wyeast 1056 American Ale", 1.0, "2026-07-15", "liquid", "73-77%"),
        yeast("US-05 Dry Yeast", 3.0, "2027-01-01", "dry", "73-77%"),
        yeast("Wyeast 3068 Weihenstephan", 0.0, "2026-04-01", "liquid", "73-77%"),
        yeast("Wyeast 3787 Trappist", 1.0, "2026-08-01", "liquid", "74-78%"),
        // Adjuncts
        adjunct("Belgian Clear Candy Sugar", 2.0, "lb", "2028-01-01", "\u{2014}"),
        adjunct("Irish Moss", 50.0, "g", "2027-06-01", "Five Star"),
        adjunct("Whirlfloc Tablets", 20.0, "tablet", "2027-06-01", "Whirlfloc"),
        adjunct("Vanilla Beans", 4.0, "pcs", "2026-12-01", "\u{2014}"),
        // Water chem
        water_chem("Gypsum (CaSO\u{2084})", 200.0, "g", None, "LD Carlson"),
        water_chem("Calcium Chloride (CaCl\u{2082})", 150.0, "g", None, "LD Carlson"),
        water_chem("Lactic Acid 88%", 100.0, "mL", Some("2027-01-01"), "Five Star"),
        water_chem("Phosphoric Acid 10%", 50.0, "mL", Some("2027-01-01"), "Five Star"),
        water_chem("Epsom Salt (MgSO\u{2084})", 100.0, "g", None, "LD Carlson"),
        // Packaging
        packaging("12oz Brown Bottles", 144.0, "pcs"),
        packaging("Bottle Caps", 200.0, "pcs"),
        packaging("5 Gal Ball Lock Kegs", 2.0, "pcs"),
        packaging("CO\u{2082} Cartridges", 5.0, "pcs"),
        packaging("Keg Lube", 1.0, "jar"),
    ]
}
