#!/usr/bin/env bash
set -euo pipefail

APP_NAME="Pomodoro Desk.app"
BUILD_APP_PATH="src-tauri/target/release/bundle/macos/${APP_NAME}"
DEFAULT_DEST="/Applications"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This installer only supports macOS."
  exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "npm is required. Install Node.js first."
  exit 1
fi

if ! command -v cargo >/dev/null 2>&1; then
  echo "Rust toolchain is required. Install Rust first (https://rustup.rs)."
  exit 1
fi

DEST_DIR="${DEST_DIR:-$DEFAULT_DEST}"
if [[ ! -w "$DEST_DIR" ]]; then
  DEST_DIR="$HOME/Applications"
  mkdir -p "$DEST_DIR"
fi

echo "Installing dependencies..."
npm install

echo "Building macOS app..."
npm run tauri build

if [[ ! -d "$BUILD_APP_PATH" ]]; then
  echo "Build output not found at: $BUILD_APP_PATH"
  exit 1
fi

DEST_APP_PATH="${DEST_DIR}/${APP_NAME}"
if [[ -d "$DEST_APP_PATH" ]]; then
  echo "Removing existing app at ${DEST_APP_PATH}"
  rm -rf "$DEST_APP_PATH"
fi

echo "Copying app to ${DEST_DIR}"
ditto "$BUILD_APP_PATH" "$DEST_APP_PATH"

if command -v xattr >/dev/null 2>&1; then
  xattr -dr com.apple.quarantine "$DEST_APP_PATH" || true
fi

echo "Installed: $DEST_APP_PATH"
