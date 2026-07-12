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
                let db_path = dir.join("brewday.db");

                let pool = brewday_core::db::connect(&db_path).await;
                brewday_core::recipes::seed::seed_if_empty(&pool).await;

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
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
