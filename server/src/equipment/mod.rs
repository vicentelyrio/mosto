mod handlers;

use axum::routing::get;
use axum::Router;

use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/equipment", get(handlers::list).post(handlers::create))
        .route(
            "/api/equipment/{id}",
            get(handlers::get)
                .put(handlers::update)
                .delete(handlers::delete),
        )
}
