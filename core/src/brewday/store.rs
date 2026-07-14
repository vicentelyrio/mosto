use sqlx::sqlite::SqliteRow;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use super::model::{
    BrewSession, BrewSessionInput, GravityReading, GravityReadingInput, SessionStatus,
};

fn row_to_session(row: &SqliteRow) -> BrewSession {
    BrewSession {
        id: row.get("id"),
        recipe_id: row.get("recipe_id"),
        status: SessionStatus::from_code(&row.get::<String, _>("status")),
        started_at: row.get("started_at"),
    }
}

fn row_to_gravity_reading(row: &SqliteRow) -> GravityReading {
    GravityReading {
        id: row.get("id"),
        session_id: row.get("session_id"),
        date: row.get("reading_date"),
        sg: row.get("sg"),
        temp: row.get("temp"),
        note: row.get("note"),
    }
}

pub async fn list_sessions(pool: &SqlitePool) -> Result<Vec<BrewSession>, sqlx::Error> {
    let rows = sqlx::query("SELECT * FROM brew_sessions ORDER BY rowid ASC")
        .fetch_all(pool)
        .await?;
    Ok(rows.iter().map(row_to_session).collect())
}

pub async fn get_session(pool: &SqlitePool, id: &str) -> Result<Option<BrewSession>, sqlx::Error> {
    let row = sqlx::query("SELECT * FROM brew_sessions WHERE id = ?")
        .bind(id)
        .fetch_optional(pool)
        .await?;
    Ok(row.as_ref().map(row_to_session))
}

pub async fn create_session(
    pool: &SqlitePool,
    input: BrewSessionInput,
) -> Result<BrewSession, sqlx::Error> {
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO brew_sessions (id, recipe_id, status, started_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(&input.recipe_id)
    .bind(input.status.as_str())
    .bind(input.started_at)
    .execute(pool)
    .await?;

    Ok(get_session(pool, &id)
        .await?
        .expect("just-inserted session missing"))
}

pub async fn update_session_status(
    pool: &SqlitePool,
    id: &str,
    status: SessionStatus,
) -> Result<Option<BrewSession>, sqlx::Error> {
    let res = sqlx::query("UPDATE brew_sessions SET status = ? WHERE id = ?")
        .bind(status.as_str())
        .bind(id)
        .execute(pool)
        .await?;

    if res.rows_affected() == 0 {
        return Ok(None);
    }

    get_session(pool, id).await
}

pub async fn delete_session(pool: &SqlitePool, id: &str) -> Result<bool, sqlx::Error> {
    let res = sqlx::query("DELETE FROM brew_sessions WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected() > 0)
}

pub async fn completed_steps(pool: &SqlitePool, session_id: &str) -> Result<Vec<i64>, sqlx::Error> {
    let rows = sqlx::query(
        "SELECT step_id FROM brew_step_completions WHERE session_id = ? ORDER BY step_id ASC",
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;
    Ok(rows.iter().map(|r| r.get("step_id")).collect())
}

pub async fn set_step_completed(
    pool: &SqlitePool,
    session_id: &str,
    step_id: i64,
    completed: bool,
) -> Result<(), sqlx::Error> {
    if completed {
        sqlx::query(
            "INSERT OR IGNORE INTO brew_step_completions (session_id, step_id, completed_at) \
             VALUES (?, ?, ?)",
        )
        .bind(session_id)
        .bind(step_id)
        .bind(crate::util::now())
        .execute(pool)
        .await?;
    } else {
        sqlx::query(
            "DELETE FROM brew_step_completions WHERE session_id = ? AND step_id = ?",
        )
        .bind(session_id)
        .bind(step_id)
        .execute(pool)
        .await?;
    }
    Ok(())
}

pub async fn list_gravity_readings(
    pool: &SqlitePool,
    session_id: &str,
) -> Result<Vec<GravityReading>, sqlx::Error> {
    let rows = sqlx::query(
        "SELECT * FROM gravity_readings WHERE session_id = ? ORDER BY rowid ASC",
    )
    .bind(session_id)
    .fetch_all(pool)
    .await?;
    Ok(rows.iter().map(row_to_gravity_reading).collect())
}

pub async fn add_gravity_reading(
    pool: &SqlitePool,
    session_id: &str,
    input: GravityReadingInput,
) -> Result<GravityReading, sqlx::Error> {
    let id = Uuid::new_v4().to_string();

    sqlx::query(
        "INSERT INTO gravity_readings (id, session_id, reading_date, sg, temp, note) \
         VALUES (?, ?, ?, ?, ?, ?)",
    )
    .bind(&id)
    .bind(session_id)
    .bind(&input.date)
    .bind(input.sg)
    .bind(input.temp)
    .bind(&input.note)
    .execute(pool)
    .await?;

    let row = sqlx::query("SELECT * FROM gravity_readings WHERE id = ?")
        .bind(&id)
        .fetch_one(pool)
        .await?;
    Ok(row_to_gravity_reading(&row))
}

pub async fn delete_gravity_reading(pool: &SqlitePool, id: &str) -> Result<bool, sqlx::Error> {
    let res = sqlx::query("DELETE FROM gravity_readings WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(res.rows_affected() > 0)
}
