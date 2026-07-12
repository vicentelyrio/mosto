use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::Json;
use brewday_core::recipes::{store, Recipe, RecipeInput};

use crate::state::AppState;

type ApiError = (StatusCode, String);

fn internal(e: impl std::fmt::Display) -> ApiError {
    tracing::error!("recipes error: {e}");
    (StatusCode::INTERNAL_SERVER_ERROR, "internal error".to_string())
}

pub async fn list(State(state): State<AppState>) -> Result<Json<Vec<Recipe>>, ApiError> {
    let recipes = store::list(&state.pool).await.map_err(internal)?;
    Ok(Json(recipes))
}

pub async fn get(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<Json<Recipe>, ApiError> {
    store::get(&state.pool, &id)
        .await
        .map_err(internal)?
        .map(Json)
        .ok_or((StatusCode::NOT_FOUND, "recipe not found".to_string()))
}

pub async fn create(
    State(state): State<AppState>,
    Json(body): Json<RecipeInput>,
) -> Result<Json<Recipe>, ApiError> {
    let recipe = store::create(&state.pool, body).await.map_err(internal)?;
    Ok(Json(recipe))
}

pub async fn update(
    State(state): State<AppState>,
    Path(id): Path<String>,
    Json(body): Json<RecipeInput>,
) -> Result<Json<Recipe>, ApiError> {
    store::update(&state.pool, &id, body)
        .await
        .map_err(internal)?
        .map(Json)
        .ok_or((StatusCode::NOT_FOUND, "recipe not found".to_string()))
}

pub async fn delete(
    State(state): State<AppState>,
    Path(id): Path<String>,
) -> Result<StatusCode, ApiError> {
    let deleted = store::delete(&state.pool, &id).await.map_err(internal)?;
    Ok(if deleted {
        StatusCode::NO_CONTENT
    } else {
        StatusCode::NOT_FOUND
    })
}
