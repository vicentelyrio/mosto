use std::path::Path;
use std::time::Duration;

use sqlx::sqlite::{SqliteConnectOptions, SqliteJournalMode, SqlitePoolOptions};
use sqlx::SqlitePool;

// WAL + a busy timeout so the server and (if it's ever pointed at the same
// file) a concurrent tool don't trip over brief write contention.
pub async fn connect(db_path: &Path) -> SqlitePool {
    let options = SqliteConnectOptions::new()
        .filename(db_path)
        .create_if_missing(true)
        .journal_mode(SqliteJournalMode::Wal)
        .busy_timeout(Duration::from_secs(5));

    let pool = SqlitePoolOptions::new()
        .max_connections(5)
        .connect_with(options)
        .await
        .unwrap_or_else(|e| panic!("failed to open db {}: {e}", db_path.display()));

    // Path is relative to this crate's Cargo.toml, so it resolves to the
    // workspace-root `migrations/` shared by both the server and desktop shells.
    sqlx::migrate!("../migrations")
        .run(&pool)
        .await
        .unwrap_or_else(|e| panic!("migrations failed: {e}"));

    pool
}
