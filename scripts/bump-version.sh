#!/usr/bin/env bash
# Bumps the version in the Cargo workspace and web/package.json together,
# then regenerates Cargo.lock. desktop/tauri.conf.json has no "version" field
# of its own, so it inherits from the Cargo workspace automatically.
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <version>" >&2
  exit 1
fi

new_version="$1"
if [[ ! "$new_version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
  echo "Version must be semver, e.g. 1.2.3" >&2
  exit 1
fi

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

sed -i.bak -E "s/^version = \"[0-9]+\.[0-9]+\.[0-9]+\"\$/version = \"${new_version}\"/" "$root/Cargo.toml"
rm -f "$root/Cargo.toml.bak"

sed -i.bak -E "s/\"version\": \"[0-9]+\.[0-9]+\.[0-9]+\"/\"version\": \"${new_version}\"/" "$root/web/package.json"
rm -f "$root/web/package.json.bak"

(cd "$root" && cargo check --workspace --quiet)

echo "Bumped to ${new_version} in Cargo.toml, web/package.json, and Cargo.lock."
echo "Review the diff, then commit and tag: git tag v${new_version}"
