use sqlx::SqlitePool;

use super::model::{Mash, MashStep, RecipeGrain, RecipeHop, RecipeInput, RecipeYeast, WaterProfile};
use super::store;

/// Ported from the design project's `brew-data.jsx` `RECIPES` array, so a
/// fresh install shows the same sample book as the mockups.
pub async fn seed_if_empty(pool: &SqlitePool) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM recipes")
        .fetch_one(pool)
        .await
        .expect("failed to count recipes");
    if count > 0 {
        return;
    }

    for input in sample_recipes() {
        store::create(pool, input)
            .await
            .expect("failed to seed sample recipe");
    }
    tracing::info!("seeded sample recipe book");
}

#[allow(clippy::too_many_arguments)]
fn grain(
    name: &str,
    type_: &str,
    amount: f64,
    unit: &str,
    pct: f64,
    yield_pct: f64,
    color_lovibond: f64,
) -> RecipeGrain {
    RecipeGrain {
        name: name.to_string(),
        r#type: type_.to_string(),
        amount,
        unit: unit.to_string(),
        pct,
        yield_pct,
        color_lovibond,
    }
}

fn hop(name: &str, amount: f64, unit: &str, time: f64, use_: &str, alpha: f64) -> RecipeHop {
    RecipeHop { name: name.to_string(), amount, unit: unit.to_string(), time, use_: use_.to_string(), alpha }
}

fn yeast(name: &str, attenuation: f64, temp_range: &str, form: &str) -> RecipeYeast {
    RecipeYeast {
        name: name.to_string(),
        attenuation,
        temp_range: temp_range.to_string(),
        form: form.to_string(),
    }
}

fn water(volume: f64, ph: f64, ca: f64, mg: f64, na: f64, so4: f64, cl: f64, hco3: f64) -> WaterProfile {
    WaterProfile { volume, ph, ca, mg, na, so4, cl, hco3 }
}

fn tags(list: &[&str]) -> Vec<String> {
    list.iter().map(|s| s.to_string()).collect()
}

/// A single-step infusion mash — the common case, and all the sample recipes
/// need since the original design only tracked one mash temp/time per recipe.
fn single_infusion_mash(step_temp: f64, step_time: f64) -> Mash {
    Mash {
        name: "Single Infusion".to_string(),
        grain_temp: 68.0,
        notes: String::new(),
        tun_temp: None,
        sparge_temp: None,
        tun_weight: None,
        tun_specific_heat: None,
        steps: vec![MashStep {
            name: "Saccharification".to_string(),
            r#type: "Infusion".to_string(),
            step_temp,
            step_time,
            infuse_amount: None,
            infuse_temp: None,
            decoction_amount: None,
            notes: String::new(),
        }],
    }
}

fn sample_recipes() -> Vec<RecipeInput> {
    vec![
        RecipeInput {
            name: "Cascade IPA".into(),
            style: "American IPA".into(),
            bjcp_code: "21A".into(),
            batch_size: 5.0,
            og: 1.065,
            fg: 1.012,
            abv: 6.9,
            ibu: 65.0,
            srm: 8.0,
            efficiency: 75.0,
            boil_time: 60.0,
            notes: "Classic West Coast IPA. Citrusy, piney, clean bitterness. Dry hop 3-4 days at room temp.".into(),
            last_brewed: Some("2026-03-15".into()),
            tags: tags(&["hoppy", "citrus", "west coast"]),
            grains: vec![
                grain("2-Row Pale Malt", "Grain", 10.5, "lb", 85.0, 80.0, 2.0),
                grain("Crystal 60L", "Grain", 1.0, "lb", 8.0, 74.0, 60.0),
                grain("Munich Malt", "Grain", 0.5, "lb", 4.0, 78.0, 9.0),
                grain("Cara-Pils", "Grain", 0.4, "lb", 3.0, 72.0, 1.5),
            ],
            hops: vec![
                hop("Cascade", 1.0, "oz", 60.0, "Boil", 5.5),
                hop("Cascade", 0.5, "oz", 15.0, "Boil", 5.5),
                hop("Centennial", 0.5, "oz", 10.0, "Boil", 9.5),
                hop("Cascade", 1.0, "oz", 0.0, "Boil", 5.5),
                hop("Cascade", 1.5, "oz", 0.0, "Dry Hop", 5.5),
            ],
            yeasts: vec![yeast("Wyeast 1056 American Ale", 75.0, "60-72\u{b0}F", "liquid")],
            water: Some(water(7.5, 5.4, 75.0, 5.0, 15.0, 150.0, 50.0, 0.0)),
            mash: Some(single_infusion_mash(152.0, 60.0)),
        },
        RecipeInput {
            name: "Oatmeal Stout".into(),
            style: "Oatmeal Stout".into(),
            bjcp_code: "15B".into(),
            batch_size: 5.0,
            og: 1.058,
            fg: 1.014,
            abv: 5.8,
            ibu: 32.0,
            srm: 35.0,
            efficiency: 72.0,
            boil_time: 60.0,
            notes: "Silky, smooth stout. Coffee, chocolate, slight roast. Oats add body and mouthfeel.".into(),
            last_brewed: Some("2026-01-20".into()),
            tags: tags(&["dark", "roasty", "smooth"]),
            grains: vec![
                grain("Maris Otter", "Grain", 9.0, "lb", 76.0, 81.0, 3.0),
                grain("Flaked Oats", "Grain", 1.5, "lb", 13.0, 70.0, 1.0),
                grain("Roasted Barley", "Grain", 0.75, "lb", 6.0, 55.0, 300.0),
                grain("Chocolate Malt", "Grain", 0.5, "lb", 4.0, 65.0, 350.0),
            ],
            hops: vec![
                hop("Fuggle", 1.5, "oz", 60.0, "Boil", 4.5),
                hop("East Kent Goldings", 0.5, "oz", 15.0, "Boil", 5.0),
            ],
            yeasts: vec![yeast("Wyeast 1084 Irish Ale", 72.0, "62-72\u{b0}F", "liquid")],
            water: Some(water(7.0, 5.3, 100.0, 10.0, 20.0, 50.0, 100.0, 100.0)),
            mash: Some(single_infusion_mash(154.0, 60.0)),
        },
        RecipeInput {
            name: "Hefeweizen".into(),
            style: "Weizen".into(),
            bjcp_code: "10A".into(),
            batch_size: 5.0,
            og: 1.048,
            fg: 1.010,
            abv: 5.0,
            ibu: 14.0,
            srm: 4.0,
            efficiency: 80.0,
            boil_time: 60.0,
            notes: "Traditional Bavarian wheat beer. Ferment cooler for more clove character.".into(),
            last_brewed: Some("2026-02-10".into()),
            tags: tags(&["wheat", "bavarian", "fruity"]),
            grains: vec![
                grain("White Wheat Malt", "Grain", 6.0, "lb", 60.0, 80.0, 2.0),
                grain("Pilsner Malt", "Grain", 4.0, "lb", 40.0, 80.0, 1.5),
            ],
            hops: vec![hop("Hallertau", 1.0, "oz", 60.0, "Boil", 4.0)],
            yeasts: vec![yeast("Wyeast 3068 Weihenstephan", 74.0, "64-70\u{b0}F", "liquid")],
            water: Some(water(6.5, 5.4, 50.0, 5.0, 10.0, 30.0, 30.0, 50.0)),
            mash: Some(single_infusion_mash(150.0, 45.0)),
        },
        RecipeInput {
            name: "Belgian Tripel".into(),
            style: "Belgian Tripel".into(),
            bjcp_code: "26C".into(),
            batch_size: 5.0,
            og: 1.082,
            fg: 1.010,
            abv: 9.4,
            ibu: 38.0,
            srm: 5.0,
            efficiency: 78.0,
            boil_time: 90.0,
            notes: "High gravity Belgian golden. Spicy, fruity, effervescent. Condition cold for 4+ weeks.".into(),
            last_brewed: Some("2025-12-05".into()),
            tags: tags(&["belgian", "strong", "golden"]),
            grains: vec![
                grain("Belgian Pilsner Malt", "Grain", 12.0, "lb", 88.0, 80.0, 1.5),
                grain("Belgian Clear Candy Sugar", "Sugar", 1.5, "lb", 12.0, 100.0, 1.0),
            ],
            hops: vec![
                hop("Saaz", 1.5, "oz", 60.0, "Boil", 3.5),
                hop("Styrian Goldings", 0.5, "oz", 15.0, "Boil", 5.5),
            ],
            yeasts: vec![yeast("Wyeast 3787 Trappist High Gravity", 78.0, "65-78\u{b0}F", "liquid")],
            water: Some(water(8.0, 5.2, 60.0, 5.0, 10.0, 40.0, 40.0, 30.0)),
            mash: Some(single_infusion_mash(148.0, 75.0)),
        },
    ]
}
