use sqlx::sqlite::SqliteRow;
use sqlx::{Row, Sqlite, SqlitePool, Transaction};
use uuid::Uuid;

use super::model::{
    Mash, MashStep, Recipe, RecipeGrain, RecipeHop, RecipeInput, RecipeYeast, StyleGuide,
    WaterProfile,
};
use crate::util::now;

fn row_to_recipe(row: &SqliteRow) -> Recipe {
    Recipe {
        id: row.get("id"),
        name: row.get("name"),
        style: row.get("style"),
        bjcp_code: row.get("bjcp_code"),
        batch_size: row.get("batch_size"),
        og: row.get("og"),
        fg: row.get("fg"),
        abv: row.get("abv"),
        ibu: row.get("ibu"),
        srm: row.get("srm"),
        efficiency: row.get("efficiency"),
        boil_time: row.get("boil_time"),
        notes: row.get("notes"),
        last_brewed: row.get("last_brewed"),
        created_at: row.get("created_at"),
        tags: Vec::new(),
        grains: Vec::new(),
        hops: Vec::new(),
        yeasts: Vec::new(),
        water: None,
        mash: None,
        style_guide: None,
    }
}

async fn hydrate(pool: &SqlitePool, mut recipe: Recipe) -> Result<Recipe, sqlx::Error> {
    let tag_rows = sqlx::query("SELECT tag FROM recipe_tags WHERE recipe_id = ?")
        .bind(&recipe.id)
        .fetch_all(pool)
        .await?;
    recipe.tags = tag_rows.iter().map(|r| r.get::<String, _>("tag")).collect();

    let grain_rows = sqlx::query(
        "SELECT name, type, amount, unit, pct, yield_pct, color_lovibond \
         FROM recipe_grains WHERE recipe_id = ? ORDER BY sort_order",
    )
    .bind(&recipe.id)
    .fetch_all(pool)
    .await?;
    recipe.grains = grain_rows
        .iter()
        .map(|r| RecipeGrain {
            name: r.get("name"),
            r#type: r.get("type"),
            amount: r.get("amount"),
            unit: r.get("unit"),
            pct: r.get("pct"),
            yield_pct: r.get("yield_pct"),
            color_lovibond: r.get("color_lovibond"),
        })
        .collect();

    let hop_rows = sqlx::query(
        "SELECT name, amount, unit, time, use, alpha FROM recipe_hops WHERE recipe_id = ? ORDER BY sort_order",
    )
    .bind(&recipe.id)
    .fetch_all(pool)
    .await?;
    recipe.hops = hop_rows
        .iter()
        .map(|r| RecipeHop {
            name: r.get("name"),
            amount: r.get("amount"),
            unit: r.get("unit"),
            time: r.get("time"),
            use_: r.get("use"),
            alpha: r.get("alpha"),
        })
        .collect();

    let yeast_rows = sqlx::query(
        "SELECT name, attenuation, temp_range, form FROM recipe_yeasts WHERE recipe_id = ? ORDER BY sort_order",
    )
    .bind(&recipe.id)
    .fetch_all(pool)
    .await?;
    recipe.yeasts = yeast_rows
        .iter()
        .map(|r| RecipeYeast {
            name: r.get("name"),
            attenuation: r.get("attenuation"),
            temp_range: r.get("temp_range"),
            form: r.get("form"),
        })
        .collect();

    recipe.water = sqlx::query(
        "SELECT volume, ph, ca, mg, na, so4, cl, hco3 FROM recipe_water_profile WHERE recipe_id = ?",
    )
    .bind(&recipe.id)
    .fetch_optional(pool)
    .await?
    .map(|r| WaterProfile {
        volume: r.get("volume"),
        ph: r.get("ph"),
        ca: r.get("ca"),
        mg: r.get("mg"),
        na: r.get("na"),
        so4: r.get("so4"),
        cl: r.get("cl"),
        hco3: r.get("hco3"),
    });

    let mash_row = sqlx::query(
        "SELECT name, grain_temp, notes, tun_temp, sparge_temp, tun_weight, tun_specific_heat \
         FROM recipe_mash WHERE recipe_id = ?",
    )
    .bind(&recipe.id)
    .fetch_optional(pool)
    .await?;
    if let Some(m) = mash_row {
        let step_rows = sqlx::query(
            "SELECT name, type, step_temp, step_time, infuse_amount, infuse_temp, decoction_amount, notes \
             FROM recipe_mash_steps WHERE recipe_id = ? ORDER BY sort_order",
        )
        .bind(&recipe.id)
        .fetch_all(pool)
        .await?;
        let steps = step_rows
            .iter()
            .map(|r| MashStep {
                name: r.get("name"),
                r#type: r.get("type"),
                step_temp: r.get("step_temp"),
                step_time: r.get("step_time"),
                infuse_amount: r.get("infuse_amount"),
                infuse_temp: r.get("infuse_temp"),
                decoction_amount: r.get("decoction_amount"),
                notes: r.get("notes"),
            })
            .collect();
        recipe.mash = Some(Mash {
            name: m.get("name"),
            grain_temp: m.get("grain_temp"),
            notes: m.get("notes"),
            tun_temp: m.get("tun_temp"),
            sparge_temp: m.get("sparge_temp"),
            tun_weight: m.get("tun_weight"),
            tun_specific_heat: m.get("tun_specific_heat"),
            steps,
        });
    }

    recipe.style_guide = sqlx::query(
        "SELECT name, category, category_number, style_letter, style_guide, type, \
         og_min, og_max, fg_min, fg_max, ibu_min, ibu_max, color_min, color_max, \
         carb_min, carb_max, abv_min, abv_max, notes, profile, ingredients, examples \
         FROM recipe_style_guide WHERE recipe_id = ?",
    )
    .bind(&recipe.id)
    .fetch_optional(pool)
    .await?
    .map(|r| StyleGuide {
        name: r.get("name"),
        category: r.get("category"),
        category_number: r.get("category_number"),
        style_letter: r.get("style_letter"),
        style_guide: r.get("style_guide"),
        r#type: r.get("type"),
        og_min: r.get("og_min"),
        og_max: r.get("og_max"),
        fg_min: r.get("fg_min"),
        fg_max: r.get("fg_max"),
        ibu_min: r.get("ibu_min"),
        ibu_max: r.get("ibu_max"),
        color_min: r.get("color_min"),
        color_max: r.get("color_max"),
        carb_min: r.get("carb_min"),
        carb_max: r.get("carb_max"),
        abv_min: r.get("abv_min"),
        abv_max: r.get("abv_max"),
        notes: r.get("notes"),
        profile: r.get("profile"),
        ingredients: r.get("ingredients"),
        examples: r.get("examples"),
    });

    Ok(recipe)
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Recipe>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM recipes ORDER BY created_at DESC")
        .fetch_all(pool)
        .await?;
    let mut recipes = Vec::with_capacity(rows.len());
    for row in &rows {
        recipes.push(hydrate(pool, row_to_recipe(row)).await?);
    }
    Ok(recipes)
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Option<Recipe>, sqlx::Error> {
    let row = sqlx::query("SELECT * FROM recipes WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    match row {
        Some(row) => Ok(Some(hydrate(pool, row_to_recipe(&row)).await?)),
        None => Ok(None),
    }
}

// Simplest correct approach for a homebrew-scale recipe book: replace all
// child rows on every write rather than diffing. Recipes have a handful of
// grains/hops/yeasts/mash steps, so this is cheap and keeps `write_children`
// as the one place that has to agree with `hydrate` about shape.
async fn write_children(
    tx: &mut Transaction<'_, Sqlite>,
    recipe_id: &str,
    input: &RecipeInput,
) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM recipe_tags WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_grains WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_hops WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_yeasts WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_water_profile WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_mash_steps WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_mash WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;
    sqlx::query("DELETE FROM recipe_style_guide WHERE recipe_id = ?")
        .bind(recipe_id)
        .execute(&mut **tx)
        .await?;

    for tag in &input.tags {
        sqlx::query("INSERT INTO recipe_tags (recipe_id, tag) VALUES (?, ?)")
            .bind(recipe_id)
            .bind(tag)
            .execute(&mut **tx)
            .await?;
    }
    for (i, g) in input.grains.iter().enumerate() {
        sqlx::query(
            "INSERT INTO recipe_grains (id, recipe_id, name, type, amount, unit, pct, yield_pct, color_lovibond, sort_order) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(recipe_id)
        .bind(&g.name)
        .bind(&g.r#type)
        .bind(g.amount)
        .bind(&g.unit)
        .bind(g.pct)
        .bind(g.yield_pct)
        .bind(g.color_lovibond)
        .bind(i as i64)
        .execute(&mut **tx)
        .await?;
    }
    for (i, h) in input.hops.iter().enumerate() {
        sqlx::query(
            "INSERT INTO recipe_hops (id, recipe_id, name, amount, unit, time, use, alpha, sort_order) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(recipe_id)
        .bind(&h.name)
        .bind(h.amount)
        .bind(&h.unit)
        .bind(h.time)
        .bind(&h.use_)
        .bind(h.alpha)
        .bind(i as i64)
        .execute(&mut **tx)
        .await?;
    }
    for (i, y) in input.yeasts.iter().enumerate() {
        sqlx::query(
            "INSERT INTO recipe_yeasts (id, recipe_id, name, attenuation, temp_range, form, sort_order) \
             VALUES (?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(Uuid::new_v4().to_string())
        .bind(recipe_id)
        .bind(&y.name)
        .bind(y.attenuation)
        .bind(&y.temp_range)
        .bind(&y.form)
        .bind(i as i64)
        .execute(&mut **tx)
        .await?;
    }
    if let Some(w) = &input.water {
        sqlx::query(
            "INSERT INTO recipe_water_profile (recipe_id, volume, ph, ca, mg, na, so4, cl, hco3) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(recipe_id)
        .bind(w.volume)
        .bind(w.ph)
        .bind(w.ca)
        .bind(w.mg)
        .bind(w.na)
        .bind(w.so4)
        .bind(w.cl)
        .bind(w.hco3)
        .execute(&mut **tx)
        .await?;
    }
    if let Some(m) = &input.mash {
        sqlx::query(
            "INSERT INTO recipe_mash (recipe_id, name, grain_temp, notes, tun_temp, sparge_temp, tun_weight, tun_specific_heat) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(recipe_id)
        .bind(&m.name)
        .bind(m.grain_temp)
        .bind(&m.notes)
        .bind(m.tun_temp)
        .bind(m.sparge_temp)
        .bind(m.tun_weight)
        .bind(m.tun_specific_heat)
        .execute(&mut **tx)
        .await?;

        for (i, s) in m.steps.iter().enumerate() {
            sqlx::query(
                "INSERT INTO recipe_mash_steps (id, recipe_id, name, type, step_temp, step_time, infuse_amount, infuse_temp, decoction_amount, notes, sort_order) \
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(Uuid::new_v4().to_string())
            .bind(recipe_id)
            .bind(&s.name)
            .bind(&s.r#type)
            .bind(s.step_temp)
            .bind(s.step_time)
            .bind(s.infuse_amount)
            .bind(s.infuse_temp)
            .bind(s.decoction_amount)
            .bind(&s.notes)
            .bind(i as i64)
            .execute(&mut **tx)
            .await?;
        }
    }
    if let Some(sg) = &input.style_guide {
        sqlx::query(
            "INSERT INTO recipe_style_guide (recipe_id, name, category, category_number, style_letter, style_guide, type, \
             og_min, og_max, fg_min, fg_max, ibu_min, ibu_max, color_min, color_max, \
             carb_min, carb_max, abv_min, abv_max, notes, profile, ingredients, examples) \
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        )
        .bind(recipe_id)
        .bind(&sg.name)
        .bind(&sg.category)
        .bind(&sg.category_number)
        .bind(&sg.style_letter)
        .bind(&sg.style_guide)
        .bind(&sg.r#type)
        .bind(sg.og_min)
        .bind(sg.og_max)
        .bind(sg.fg_min)
        .bind(sg.fg_max)
        .bind(sg.ibu_min)
        .bind(sg.ibu_max)
        .bind(sg.color_min)
        .bind(sg.color_max)
        .bind(sg.carb_min)
        .bind(sg.carb_max)
        .bind(sg.abv_min)
        .bind(sg.abv_max)
        .bind(&sg.notes)
        .bind(&sg.profile)
        .bind(&sg.ingredients)
        .bind(&sg.examples)
        .execute(&mut **tx)
        .await?;
    }
    Ok(())
}

pub async fn create(pool: &SqlitePool, input: RecipeInput) -> Result<Recipe, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let ts = now();
    let mut tx = pool.begin().await?;

    sqlx::query(
        "INSERT INTO recipes (id, name, style, bjcp_code, batch_size, og, fg, abv, ibu, srm, \
         efficiency, boil_time, notes, last_brewed, created_at) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.style)
    .bind(&input.bjcp_code)
    .bind(input.batch_size)
    .bind(input.og)
    .bind(input.fg)
    .bind(input.abv)
    .bind(input.ibu)
    .bind(input.srm)
    .bind(input.efficiency)
    .bind(input.boil_time)
    .bind(&input.notes)
    .bind(&input.last_brewed)
    .bind(ts)
    .execute(&mut *tx)
    .await?;

    write_children(&mut tx, &id, &input).await?;
    tx.commit().await?;

    Ok(get(pool, &id).await?.expect("just-inserted recipe missing"))
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    input: RecipeInput,
) -> Result<Option<Recipe>, sqlx::Error> {
    let mut tx = pool.begin().await?;

    let res = sqlx::query(
        "UPDATE recipes SET name = ?, style = ?, bjcp_code = ?, batch_size = ?, og = ?, fg = ?, \
         abv = ?, ibu = ?, srm = ?, efficiency = ?, boil_time = ?, \
         notes = ?, last_brewed = ? WHERE id = ?",
    )
    .bind(&input.name)
    .bind(&input.style)
    .bind(&input.bjcp_code)
    .bind(input.batch_size)
    .bind(input.og)
    .bind(input.fg)
    .bind(input.abv)
    .bind(input.ibu)
    .bind(input.srm)
    .bind(input.efficiency)
    .bind(input.boil_time)
    .bind(&input.notes)
    .bind(&input.last_brewed)
    .bind(id)
    .execute(&mut *tx)
    .await?;

    if res.rows_affected() == 0 {
        tx.rollback().await?;
        return Ok(None);
    }

    write_children(&mut tx, id, &input).await?;
    tx.commit().await?;

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<bool, sqlx::Error> {
    let res = sqlx::query("DELETE FROM recipes WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected() > 0)
}
