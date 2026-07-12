use tauri::State;

use brewday_core::recipes::{store, Recipe, RecipeInput};

use crate::state::AppState;

// Thin translators around `brewday_core::recipes::store` — identical calls to
// the ones `server/src/recipes/handlers.rs` makes, just returning
// `Result<T, String>` (Tauri's error convention) instead of an HTTP response.

#[tauri::command]
pub async fn recipes_list(state: State<'_, AppState>) -> Result<Vec<Recipe>, String> {
    store::list(&state.pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn recipes_get(state: State<'_, AppState>, id: String) -> Result<Recipe, String> {
    store::get(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "recipe not found".to_string())
}

#[tauri::command]
pub async fn recipes_create(state: State<'_, AppState>, body: RecipeInput) -> Result<Recipe, String> {
    store::create(&state.pool, body).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn recipes_update(
    state: State<'_, AppState>,
    id: String,
    body: RecipeInput,
) -> Result<Recipe, String> {
    store::update(&state.pool, &id, body)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "recipe not found".to_string())
}

#[tauri::command]
pub async fn recipes_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let deleted = store::delete(&state.pool, &id).await.map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("recipe not found".to_string())
    }
}
