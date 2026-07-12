use mosto_core::util::now;
use sqlx::sqlite::SqliteRow;
use sqlx::{Row, SqlitePool};
use uuid::Uuid;

use super::model::User;
use crate::config::AuthConfig;

fn row_to_user(row: &SqliteRow) -> User {
    User {
        id: row.get("id"),
        username: row.get("username"),
        password_hash: row.get("password_hash"),
        created_at: row.get("created_at"),
    }
}

pub async fn find_by_username(pool: &SqlitePool, username: &str) -> Result<Option<User>, sqlx::Error> {
    let row = sqlx::query("SELECT * FROM users WHERE username = ? COLLATE NOCASE")
        .bind(username)
        .fetch_optional(pool)
        .await?;
    Ok(row.as_ref().map(row_to_user))
}

pub async fn create_session(
    pool: &SqlitePool,
    token_hash: &str,
    user_id: &str,
    ttl_secs: i64,
) -> Result<(), sqlx::Error> {
    let ts = now();
    sqlx::query(
        "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
    )
    .bind(token_hash)
    .bind(user_id)
    .bind(ts)
    .bind(ts + ttl_secs)
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn session_user(pool: &SqlitePool, token_hash: &str) -> Result<Option<User>, sqlx::Error> {
    let row = sqlx::query(
        "SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id \
         WHERE s.token_hash = ? AND s.expires_at > ?",
    )
    .bind(token_hash)
    .bind(now())
    .fetch_optional(pool)
    .await?;
    Ok(row.as_ref().map(row_to_user))
}

pub async fn delete_session(pool: &SqlitePool, token_hash: &str) -> Result<(), sqlx::Error> {
    sqlx::query("DELETE FROM sessions WHERE token_hash = ?")
        .bind(token_hash)
        .execute(pool)
        .await?;
    Ok(())
}

pub async fn sweep_expired_sessions(pool: &SqlitePool) -> Result<u64, sqlx::Error> {
    let res = sqlx::query("DELETE FROM sessions WHERE expires_at <= ?")
        .bind(now())
        .execute(pool)
        .await?;
    Ok(res.rows_affected())
}

/// Panics on a missing owner hash so a fresh deploy can't boot with no way in.
pub async fn seed_owner_if_empty(pool: &SqlitePool, cfg: &AuthConfig) {
    let count: i64 = sqlx::query_scalar("SELECT COUNT(*) FROM users")
        .fetch_one(pool)
        .await
        .expect("failed to count users");
    if count > 0 {
        return;
    }

    let hash = cfg.resolved_owner_hash();
    if hash.is_empty() {
        panic!(
            "no users exist and [auth].owner_password_hash is empty; \
             generate one with `cargo run --bin mosto-server -- hash-password`"
        );
    }

    let ts = now();
    sqlx::query("INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)")
        .bind(Uuid::new_v4().to_string())
        .bind(&cfg.owner_username)
        .bind(&hash)
        .bind(ts)
        .execute(pool)
        .await
        .expect("failed to seed owner account");

    tracing::info!("seeded owner account '{}'", cfg.owner_username);
}
