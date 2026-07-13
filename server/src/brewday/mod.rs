mod handlers;

use axum::routing::{get, put};
use axum::Router;

use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route(
            "/api/brewday/sessions",
            get(handlers::list_sessions).post(handlers::create_session),
        )
        .route(
            "/api/brewday/sessions/{id}",
            get(handlers::get_session).delete(handlers::delete_session),
        )
        .route(
            "/api/brewday/sessions/{id}/status",
            put(handlers::update_session_status),
        )
        .route(
            "/api/brewday/sessions/{id}/steps",
            get(handlers::list_completed_steps),
        )
        .route(
            "/api/brewday/sessions/{id}/steps/{step_id}",
            put(handlers::set_step_completed),
        )
        .route(
            "/api/brewday/sessions/{id}/gravity",
            get(handlers::list_gravity_readings).post(handlers::add_gravity_reading),
        )
        .route(
            "/api/brewday/gravity/{id}",
            axum::routing::delete(handlers::delete_gravity_reading),
        )
}
