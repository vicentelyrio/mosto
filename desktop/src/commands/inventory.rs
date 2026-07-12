use tauri::State;

use mosto_core::inventory::{store, InventoryItem, InventoryItemInput};

use crate::state::AppState;

// Thin translators around `mosto_core::inventory::store` — identical calls to
// the ones `server/src/inventory/handlers.rs` makes, just returning
// `Result<T, String>` (Tauri's error convention) instead of an HTTP response.

#[tauri::command]
pub async fn inventory_list(state: State<'_, AppState>) -> Result<Vec<InventoryItem>, String> {
    store::list(&state.pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn inventory_get(state: State<'_, AppState>, id: String) -> Result<InventoryItem, String> {
    store::get(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "inventory item not found".to_string())
}

#[tauri::command]
pub async fn inventory_create(
    state: State<'_, AppState>,
    body: InventoryItemInput,
) -> Result<InventoryItem, String> {
    store::create(&state.pool, body).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn inventory_update(
    state: State<'_, AppState>,
    id: String,
    body: InventoryItemInput,
) -> Result<InventoryItem, String> {
    store::update(&state.pool, &id, body)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "inventory item not found".to_string())
}

#[tauri::command]
pub async fn inventory_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let deleted = store::delete(&state.pool, &id).await.map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("inventory item not found".to_string())
    }
}
