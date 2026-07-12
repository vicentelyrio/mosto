mod auth;
mod config;
mod inventory;
mod recipes;
mod spa;
mod state;

use std::net::SocketAddr;

use axum::middleware;
use tower_http::trace::TraceLayer;

use state::AppState;

#[tokio::main]
async fn main() {
    // In dev, `cargo run` (or `cargo run -p mosto-server`) can be invoked
    // from the workspace root, not this crate's own directory — unlike a
    // deployed binary, which always sits next to its config.toml and .env.
    // So debug builds resolve both against this crate's manifest dir; release
    // builds stay cwd-relative, matching a self-hosted install.
    if cfg!(debug_assertions) {
        dotenvy::from_path(manifest_path(".env")).ok();
    } else {
        dotenvy::dotenv().ok();
    }

    if std::env::args().nth(1).as_deref() == Some("hash-password") {
        hash_password();
        return;
    }

    tracing_subscriber::fmt::init();

    let config_path = std::env::var("CONFIG_PATH").unwrap_or_else(|_| {
        if cfg!(debug_assertions) {
            manifest_path("config.toml").to_string_lossy().into_owned()
        } else {
            "config.toml".to_string()
        }
    });
    let config = config::Config::load(&config_path);
    let listen = config.listen.clone();
    let state = AppState::new(config).await;

    let protected = recipes::routes()
        .merge(inventory::routes())
        .merge(auth::authed_routes())
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            auth::require_auth,
        ));

    let app = auth::public_routes()
        .merge(protected)
        .fallback(spa::handler)
        .layer(TraceLayer::new_for_http())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind(&listen).await.unwrap();
    tracing::info!("listening on http://{}", listen);
    axum::serve(
        listener,
        app.into_make_service_with_connect_info::<SocketAddr>(),
    )
    .await
    .unwrap();
}

fn manifest_path(name: &str) -> std::path::PathBuf {
    std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join(name)
}

fn hash_password() {
    use std::io::{self, Write};

    eprint!("Password: ");
    io::stderr().flush().expect("flush");

    let mut pw = String::new();
    io::stdin().read_line(&mut pw).expect("read password");
    let pw = pw.trim_end_matches(['\n', '\r']);

    if pw.len() < 8 {
        eprintln!("password must be at least 8 characters");
        std::process::exit(1);
    }

    println!("{}", auth::password::hash(pw).expect("hash password"));
}
