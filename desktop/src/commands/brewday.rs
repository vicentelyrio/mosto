use serde::Deserialize;
use tauri::State;

use mosto_core::brewday::{
    store, BrewSession, BrewSessionInput, GravityReading, GravityReadingInput, SessionStatus,
};

use crate::state::AppState;

#[derive(Deserialize)]
pub struct StatusUpdate {
    status: SessionStatus,
}

#[derive(Deserialize)]
pub struct StepUpdate {
    completed: bool,
}

// Thin translators around `mosto_core::brewday::store` — identical calls to
// the ones `server/src/brewday/handlers.rs` makes, just returning
// `Result<T, String>` (Tauri's error convention) instead of an HTTP response.

#[tauri::command]
pub async fn brewday_list_sessions(state: State<'_, AppState>) -> Result<Vec<BrewSession>, String> {
    store::list_sessions(&state.pool).await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_get_session(
    state: State<'_, AppState>,
    id: String,
) -> Result<BrewSession, String> {
    store::get_session(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "session not found".to_string())
}

#[tauri::command]
pub async fn brewday_create_session(
    state: State<'_, AppState>,
    body: BrewSessionInput,
) -> Result<BrewSession, String> {
    store::create_session(&state.pool, body)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_update_session_status(
    state: State<'_, AppState>,
    id: String,
    body: StatusUpdate,
) -> Result<BrewSession, String> {
    store::update_session_status(&state.pool, &id, body.status)
        .await
        .map_err(|e| e.to_string())?
        .ok_or_else(|| "session not found".to_string())
}

#[tauri::command]
pub async fn brewday_delete_session(state: State<'_, AppState>, id: String) -> Result<(), String> {
    let deleted = store::delete_session(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("session not found".to_string())
    }
}

#[tauri::command]
pub async fn brewday_list_completed_steps(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<i64>, String> {
    store::completed_steps(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_set_step_completed(
    state: State<'_, AppState>,
    id: String,
    step_id: i64,
    body: StepUpdate,
) -> Result<(), String> {
    store::set_step_completed(&state.pool, &id, step_id, body.completed)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_list_gravity_readings(
    state: State<'_, AppState>,
    id: String,
) -> Result<Vec<GravityReading>, String> {
    store::list_gravity_readings(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_add_gravity_reading(
    state: State<'_, AppState>,
    id: String,
    body: GravityReadingInput,
) -> Result<GravityReading, String> {
    store::add_gravity_reading(&state.pool, &id, body)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn brewday_delete_gravity_reading(
    state: State<'_, AppState>,
    id: String,
) -> Result<(), String> {
    let deleted = store::delete_gravity_reading(&state.pool, &id)
        .await
        .map_err(|e| e.to_string())?;
    if deleted {
        Ok(())
    } else {
        Err("gravity reading not found".to_string())
    }
}
