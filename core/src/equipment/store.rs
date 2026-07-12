use sqlx::sqlite::SqliteRow;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use super::model::{Condition, Equipment, EquipmentInput};
use crate::util::now;

fn row_to_equipment(row: &SqliteRow) -> Equipment {
    Equipment {
        id: row.get("id"),
        name: row.get("name"),
        r#type: row.get("type"),
        capacity: row.get("capacity"),
        material: row.get("material"),
        condition: Condition::from_str(&row.get::<String, _>("condition")),
        notes: row.get("notes"),
        created_at: row.get("created_at"),
    }
}

pub async fn list(pool: &SqlitePool) -> Result<Vec<Equipment>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM equipment ORDER BY created_at ASC")
        .fetch_all(pool)
        .await?;
    Ok(rows.iter().map(row_to_equipment).collect())
}

pub async fn get(pool: &SqlitePool, id: &str) -> Result<Option<Equipment>, sqlx::Error> {
    let row = sqlx::query("SELECT * FROM equipment WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    Ok(row.as_ref().map(row_to_equipment))
}

pub async fn create(pool: &SqlitePool, input: EquipmentInput) -> Result<Equipment, sqlx::Error> {
    let id = Uuid::new_v4().to_string();
    let ts = now();

    sqlx::query(
        "INSERT INTO equipment (id, name, type, capacity, material, condition, notes, created_at) \
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&input.name)
    .bind(&input.r#type)
    .bind(&input.capacity)
    .bind(&input.material)
    .bind(input.condition.as_str())
    .bind(&input.notes)
    .bind(ts)
    .execute(pool)
    .await?;

    Ok(get(pool, &id).await?.expect("just-inserted equipment missing"))
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    input: EquipmentInput,
) -> Result<Option<Equipment>, sqlx::Error> {
    let res = sqlx::query(
        "UPDATE equipment SET name = ?, type = ?, capacity = ?, material = ?, \
         condition = ?, notes = ? WHERE id = ?",
    )
    .bind(&input.name)
    .bind(&input.r#type)
    .bind(&input.capacity)
    .bind(&input.material)
    .bind(input.condition.as_str())
    .bind(&input.notes)
    .bind(id)
    .execute(pool)
    .await?;

    if res.rows_affected() == 0 {
        return Ok(None);
    }

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> Result<bool, sqlx::Error> {
    let res = sqlx::query("DELETE FROM equipment WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected() > 0)
}
