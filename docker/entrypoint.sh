#!/bin/sh
set -e

mkdir -p /data

exec mosto-server "$@"
