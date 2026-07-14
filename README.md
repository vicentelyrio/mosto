# Mosto

A self-hosted homebrewing companion: recipes, inventory, equipment, and
guided brew-day tracking, backed by a Rust/SQLite core shared by a web
server and a Tauri desktop app.

## Features

- **Recipes** — create, edit, and clone all-grain recipes; import/export
  BeerXML; computed OG/FG/ABV/IBU/SRM
- **Brew day** — guided step-by-step brewing flow with per-step timers,
  overtime alerts, a batch progress timeline, gravity log, yeast pitch
  calculator, and hop addition schedule
- **Inventory** — track grains, hops, yeast, adjuncts, water chemistry, and
  packaging supplies, with low-stock alerts
- **Equipment** — track brewing equipment (mash tuns, kettles, chillers,
  fermentors, etc.)
- **Conversions** — brewing unit and gravity conversion calculators
- **Dashboard** — overview of active brews, recent recipes, and low stock
- Single-user (owner) authentication

## Project layout

- `core/` — shared Rust domain logic and SQLite access (`mosto-core`)
- `server/` — Axum HTTP server exposing the REST API and serving the web
  app (`mosto-server`)
- `desktop/` — Tauri desktop app wrapping the same core logic as native
  commands (`mosto-desktop`)
- `web/` — React + TypeScript frontend, shared by the server and desktop
  builds
- `migrations/` — SQLite schema migrations (applied automatically on
  startup)

## Running

### Web frontend only (dev)

```sh
cd web
pnpm install
pnpm dev
```

### Self-hosted server

```sh
cd server
cp .env.example .env
cargo run --bin mosto-server -- hash-password   # generate MOSTO_OWNER_PASSWORD_HASH, paste into .env
cargo run --bin mosto-server
```

Serves the API and the built web app (`web/dist`) on the address configured
in `server/config.toml` (default `127.0.0.1:4100`).

### Desktop app

Requires the Tauri CLI (`cargo install tauri-cli --version "^2"`).

```sh
cd web && pnpm install && pnpm build
cd ../desktop
cargo tauri dev     # or: cargo tauri build
```

## Stack

- Rust — Axum, sqlx/SQLite, Tauri
- TypeScript — React, TanStack Router/Query, Mantine

## License

MIT — see [LICENSE](LICENSE).
