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

### Self-hosted server (dev)

```sh
cd server
cp .env.example .env
cargo run --bin mosto-server -- hash-password   # generate MOSTO_OWNER_PASSWORD_HASH, paste into .env
cargo run --bin mosto-server
```

Serves the API and the built web app (`web/dist`) on the address configured
in `server/config.toml` (default `127.0.0.1:4100`).

### Desktop app (dev)

Requires the Tauri CLI (`cargo install tauri-cli --version "^2"`).

```sh
cd web && pnpm install && pnpm build
cd ../desktop
cargo tauri dev     # or: cargo tauri build
```

## Self-hosting with Docker (recommended)

The image bundles the server and the built web app. You only need Docker and
a password hash.

1. Generate an owner password hash:

   ```bash
   docker run --rm -it ghcr.io/vicentelyrio/mosto hash-password
   ```

2. Put it in a `.env` file next to `docker-compose.yml`:

   ```
   MOSTO_OWNER_PASSWORD_HASH='<paste the hash>'
   ```

3. Start it:

   ```bash
   docker compose up -d
   ```

The UI is at http://localhost:4100. The database lives in `./data/mosto.db`.
Sign in as `brewer` with the password you hashed.

To override defaults (listen address, `secure_cookies`, `session_ttl_days`),
mount your own config over `/app/config.toml`, or point `CONFIG_PATH` at
another file.

> Set `secure_cookies = true` (the default) once you serve over HTTPS, e.g.
> behind a TLS-terminating reverse proxy. Only set it `false` for local
> plain-HTTP testing.

## Self-hosting with the prebuilt binary

Each tagged release attaches a static Linux binary. Download it, drop a
`config.toml` next to it (see the committed `server/config.toml` for the
shape), set `MOSTO_OWNER_PASSWORD_HASH`, and run `./mosto-server`. Generate a
hash with `./mosto-server hash-password`. Override the config location with
`CONFIG_PATH`.

## Desktop app

Each tagged release attaches installers for macOS (Apple Silicon and Intel),
Windows, and Linux, built by CI from `desktop/`. Download the one for your
platform from the [releases page][releases].

> Builds are currently unsigned/unnotarized — expect a Gatekeeper warning on
> macOS ("right-click → Open" the first time) and a SmartScreen prompt on
> Windows.

[releases]: https://github.com/vicentelyrio/mosto/releases

## Stack

- Rust — Axum, sqlx/SQLite, Tauri
- TypeScript — React, TanStack Router/Query, Mantine

## Releases & CI

- `.github/workflows/ci.yml` runs on push/PR: frontend typecheck + lint +
  build, and backend clippy + tests across the workspace.
- `.github/workflows/release.yml` runs on a `v*` tag: builds and pushes the
  server Docker image to GHCR, attaches a static Linux server binary, and
  builds/attaches desktop installers for macOS, Windows, and Linux.

Cut a release with:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

## License

MIT — see [LICENSE](LICENSE).
