use sqlx::SqlitePool;

use super::model::{Condition, EquipmentInput};
use super::store;

/// Ported from the design project's `brew-data.jsx` `EQUIPMENT` array, so a
/// fresh install shows the same sample kit as the mockups.
pub async fn seed_if_empty(pool: &SqlitePool) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM equipment")
        .fetch_one(pool)
        .await
        .expect("failed to count equipment");
    if count > 0 {
        return;
    }

    for input in sample_equipment() {
        store::create(pool, input)
            .await
            .expect("failed to seed sample equipment");
    }
    tracing::info!("seeded sample equipment");
}

fn item(
    name: &str,
    type_: &str,
    capacity: &str,
    material: &str,
    condition: Condition,
    notes: &str,
) -> EquipmentInput {
    EquipmentInput {
        name: name.to_string(),
        r#type: type_.to_string(),
        capacity: capacity.to_string(),
        material: material.to_string(),
        condition,
        notes: notes.to_string(),
    }
}

fn sample_equipment() -> Vec<EquipmentInput> {
    vec![
        item(
            "10 Gal Mash Tun",
            "Mash Tun",
            "10 gal",
            "Stainless Steel",
            Condition::Good,
            "False bottom, ball valve",
        ),
        item(
            "15 Gal Boil Kettle",
            "Kettle",
            "15 gal",
            "Stainless Steel",
            Condition::Good,
            "Thermometer, sight glass",
        ),
        item(
            "Plate Chiller (40-plate)",
            "Chiller",
            "\u{2014}",
            "Stainless Steel",
            Condition::Good,
            "Cools 5 gal in ~10 min",
        ),
        item(
            "6.5 Gal Bucket Fermentor",
            "Fermentor",
            "6.5 gal",
            "HDPE",
            Condition::Fair,
            "Replace airlock soon",
        ),
        item(
            "5 Gal Glass Carboy",
            "Fermentor",
            "5 gal",
            "Glass",
            Condition::Good,
            "Secondary / lagering",
        ),
        item(
            "Digital Refractometer",
            "Instrument",
            "0-32 Brix",
            "\u{2014}",
            Condition::Good,
            "ATC, calibrated",
        ),
        item(
            "Grain Mill (2-roller)",
            "Mill",
            "\u{2014}",
            "Stainless Steel",
            Condition::Good,
            "Adjustable gap",
        ),
        item(
            "March Pump",
            "Pump",
            "\u{2014}",
            "Stainless Steel",
            Condition::Good,
            "Magnetic drive, food grade",
        ),
    ]
}
