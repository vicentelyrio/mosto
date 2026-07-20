#!/usr/bin/env bash
# Fails if the Cargo workspace version and web/package.json version have drifted apart.
# Optionally pass a git tag (e.g. v1.2.3) as $1 to also assert it matches that version.
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

if [[ $# -ge 1 ]]; then
  tag="$1"
  expected="v${cargo_version}"
  if [[ "$tag" != "$expected" ]]; then
    echo "Tag mismatch: pushed tag=$tag, expected=$expected" >&2
    echo "Run scripts/bump-version.sh <version>, commit, then tag $expected." >&2
    exit 1
  fi
  echo "Tag matches version: $tag"
fi
