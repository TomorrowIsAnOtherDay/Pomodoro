# Pomodoro Desk (Tauri + React)

Offline-first Pomodoro timer with task tracking and daily stats. Designed as a macOS desktop app powered by Tauri.

## Development

**Prerequisites:** Node.js, Rust toolchain, and Xcode Command Line Tools.

1. Install dependencies:
   `npm install`
2. Run the web UI (Vite):
   `npm run dev`
3. Run the desktop app (Tauri):
   `npm run tauri dev`

## Build

- Web build: `npm run build`
- Desktop build: `npm run tauri build`

## Notes

- No external services are required; data is stored locally in `localStorage`.
- This repo uses local Tailwind build output (no CDN).
