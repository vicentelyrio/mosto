use std::sync::Arc;
use std::time::Duration;

use sqlx::SqlitePool;

use crate::auth::rate_limit::RateLimiter;
use crate::config::{AuthConfig, Config};

const LOGIN_ATTEMPTS_PER_WINDOW: u32 = 10;
const LOGIN_WINDOW: Duration = Duration::from_secs(15 * 60);

#[derive(Clone)]
pub struct AppState {
    pub pool: SqlitePool,
    pub auth: Arc<AuthConfig>,
    pub login_limiter: Arc<RateLimiter>,
}

impl AppState {
    pub async fn new(config: Config) -> Self {
        let auth = config.auth.clone().unwrap_or_else(|| {
            panic!("config is missing the [auth] section; the server won't serve anonymously")
        });

        let pool = mosto_core::db::connect(&config.db_path).await;
        crate::auth::store::seed_owner_if_empty(&pool, &auth).await;
        mosto_core::recipes::seed::seed_if_empty(&pool).await;
        mosto_core::inventory::seed::seed_if_empty(&pool).await;

        AppState {
            pool,
            auth: Arc::new(auth),
            login_limiter: Arc::new(RateLimiter::new(LOGIN_ATTEMPTS_PER_WINDOW, LOGIN_WINDOW)),
        }
    }
}
