#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod state;

use tauri::Manager;

use state::AppState;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let handle = app.handle().clone();
            tauri::async_runtime::block_on(async move {
                let dir = handle
                    .path()
                    .app_data_dir()
                    .expect("resolve app data dir");
                std::fs::create_dir_all(&dir).expect("create app data dir");
                let db_path = dir.join("mosto.db");

                let pool = mosto_core::db::connect(&db_path).await;
                mosto_core::recipes::seed::seed_if_empty(&pool).await;
                mosto_core::inventory::seed::seed_if_empty(&pool).await;
                mosto_core::equipment::seed::seed_if_empty(&pool).await;

                handle.manage(AppState { pool });
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::recipes::recipes_list,
            commands::recipes::recipes_get,
            commands::recipes::recipes_create,
            commands::recipes::recipes_update,
            commands::recipes::recipes_delete,
            commands::inventory::inventory_list,
            commands::inventory::inventory_get,
            commands::inventory::inventory_create,
            commands::inventory::inventory_update,
            commands::inventory::inventory_delete,
            commands::equipment::equipment_list,
            commands::equipment::equipment_get,
            commands::equipment::equipment_create,
            commands::equipment::equipment_update,
            commands::equipment::equipment_delete,
            commands::brewday::brewday_list_sessions,
            commands::brewday::brewday_get_session,
            commands::brewday::brewday_create_session,
            commands::brewday::brewday_update_session_status,
            commands::brewday::brewday_delete_session,
            commands::brewday::brewday_list_completed_steps,
            commands::brewday::brewday_set_step_completed,
            commands::brewday::brewday_list_gravity_readings,
            commands::brewday::brewday_add_gravity_reading,
            commands::brewday::brewday_delete_gravity_reading,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
