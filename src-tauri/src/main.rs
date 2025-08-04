// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(not(mobile))]
fn main() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all() // Enables I/O, timers, etc.
        .build()
        .expect("Failed to build Tokio runtime");

    rt.block_on(async {
        lanchat_lib::run().await.expect("Failed to start app");
    });
}
