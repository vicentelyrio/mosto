#!/usr/bin/env bash
# Fails if the Cargo workspace version and web/package.json version have drifted apart.
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cargo_version="$(grep -m1 '^version = ' "$root/Cargo.toml" | sed -E 's/version = "([^"]+)"/\1/')"
web_version="$(grep -m1 '"version":' "$root/web/package.json" | sed -E 's/.*"version": *"([^"]+)".*/\1/')"

if [[ "$cargo_version" != "$web_version" ]]; then
  echo "Version mismatch: Cargo workspace=$cargo_version, web/package.json=$web_version" >&2
  echo "Run scripts/bump-version.sh <version> to sync them." >&2
  exit 1
fi

echo "Versions in sync: $cargo_version"
