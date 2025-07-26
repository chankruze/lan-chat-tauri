mod app_state;
mod commands;

use app_state::AppState;
use commands::{connect_to_peer, get_current_peers, update_name};
use lan_chat::start_lan_chat;
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::Mutex;

#[tokio::main]
pub async fn run() -> anyhow::Result<()> {
    let runtime = start_lan_chat().await?;
    let peer_events = runtime.peer_event_rx;
    let peers = runtime.peer_map;
    let identity = runtime.identity;

    let app_state = AppState {
        peers: Arc::new(Mutex::new(peers)),
        identity,
        notifier: Arc::new(Mutex::new(runtime.notifier)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(move |app| {
            let app_handle = app.handle().clone();

            tokio::spawn(async move {
                let mut peer_events = peer_events;
                while let Some(event) = peer_events.recv().await {
                    println!("Event: {event:?}");

                    if let Err(err) = app_handle.emit("peer-event", &event) {
                        eprintln!("Failed to emit peer event: {err}");
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connect_to_peer,
            get_current_peers,
            update_name
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");

    Ok(())
}
