// Tauri v2 desktop shell for Apohara Inti. The actual UI lives in
// `../src/` and is bundled by Vite into `../dist/` for production.
// This shell just opens the native window pointed at that bundle.

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    apohara_inti_desktop_lib::run();
}
