use tauri::State;

use mosto_core::equipment::{store, Equipment, EquipmentInput};

use crate::state::AppState;

// Thin translators around `mosto_core::equipment::store` — identical calls to
// the ones `server/src/equipment/handlers.rs` makes, just returning
// `Result<T, String>` (Tauri's error convention) instead of an HTTP response.

#[tauri::command]
pub async fn equipment_list(state: State<'_, AppState>) -> Result<Vec<Equipment>, String> {
    store::list(&state.pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn equipment_get(state: State<'_, AppState>, id: String) -> Result<Equipment, String> {
    store::get(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "equipment not found".to_string())
}

#[tauri::command]
pub async fn equipment_create(
    state: State<'_, AppState>,
    body: EquipmentInput,
) -> Result<Equipment, String> {
    store::create(&state.pool, body).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn equipment_update(
    state: State<'_, AppState>,
    id: String,
    body: EquipmentInput,
) -> Result<Equipment, String> {
    store::update(&state.pool, &id, body)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "equipment not found".to_string())
}

#[tauri::command]
pub async fn equipment_delete(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let deleted = store::delete(&state.pool, &id).await.map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("equipment not found".to_string())
    }
}
