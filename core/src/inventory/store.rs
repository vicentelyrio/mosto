use sqlx::sqlite::SqliteRow;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use super::model::{InventoryCategory, InventoryItem, InventoryItemInput};
use crate::util::now;

fn row_to_item(row: &SqliteRow) -> InventoryItem {
    InventoryItem {
        id: row.get("id"),
        category: InventoryCategory::from_str(&row.get::<String, _>("category")),
        name: row.get("name"),
        amount: row.get("amount"),
        unit: row.get("unit"),
        low_threshold: row.get("low_threshold"),
        expiry: row.get("expiry"),
        brand: row.get("brand"),
        alpha: row.get("alpha"),
        form: row.get("form"),
        attenuation: row.get("attenuation"),
        created_at: row.get("created_at"),
    }
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<InventoryItem>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM inventory_items ORDER BY created_at ASC")
        .fetch_all(pool)
        .await?;
    Ok(rows.iter().map(row_to_item).collect())
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Option<InventoryItem>, sqlx::Error> {
    let row = sqlx::query("SELECT * FROM inventory_items WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    Ok(row.as_ref().map(row_to_item))
}

pub async fn create(
    pool: &SqlitePool,
    input: InventoryItemInput,
) -> Result<InventoryItem, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let ts = now();

    sqlx::query(
        "INSERT INTO inventory_items \
         (id, category, name, amount, unit, low_threshold, expiry, brand, alpha, form, attenuation, created_at) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(input.category.as_str())
    .bind(&input.name)
    .bind(input.amount)
    .bind(&input.unit)
    .bind(input.low_threshold)
    .bind(&input.expiry)
    .bind(&input.brand)
    .bind(input.alpha)
    .bind(&input.form)
    .bind(&input.attenuation)
    .bind(ts)
    .execute(pool)
    .await?;

    Ok(get(pool, &id).await?.expect("just-inserted item missing"))
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    input: InventoryItemInput,
) -> Result<Option<InventoryItem>, sqlx::Error> {
    let res = sqlx::query(
        "UPDATE inventory_items SET category = ?, name = ?, amount = ?, unit = ?, \
         low_threshold = ?, expiry = ?, brand = ?, alpha = ?, form = ?, attenuation = ? \
         WHERE id = ?",
    )
    .bind(input.category.as_str())
    .bind(&input.name)
    .bind(input.amount)
    .bind(&input.unit)
    .bind(input.low_threshold)
    .bind(&input.expiry)
    .bind(&input.brand)
    .bind(input.alpha)
    .bind(&input.form)
    .bind(&input.attenuation)
    .bind(id)
    .execute(pool)
    .await?;

    if res.rows_affected() == 0 {
        return Ok(None);
    }

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<bool, sqlx::Error> {
    let res = sqlx::query("DELETE FROM inventory_items WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected() > 0)
}
