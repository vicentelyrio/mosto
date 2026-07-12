mod handlers;

use axum::routing::get;
use axum::Router;

use crate::state::AppState;

pub fn routes() -> Router<AppState> {
    Router::new()
        .route("/api/recipes", get(handlers::list).post(handlers::create))
        .route(
            "/api/recipes/{id}",
            get(handlers::get)
                .put(handlers::update)
                .delete(handlers::delete),
        )
}
