mod commands;

use commands::*;
use lan_chat::{
    networking::{discover, start_mdns_service_with_re_advertise},
    peer::{start_health_check, PeerEvent, PeerIdentity, PeerManager},
    utils::init_logger,
    ws::{event::WsEvent, WsManager},
};
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::RwLock;

pub async fn run() -> anyhow::Result<()> {
    init_logger();

    let identity = Arc::new(RwLock::new(PeerIdentity::load_or_generate()));
    let (peer_event_tx, mut peer_event_rx) = tokio::sync::mpsc::channel(32);
    let peer_manager = Arc::new(PeerManager::new(peer_event_tx));

    let peer_id = identity.read().await.peer_id.clone();

    // Create mDNS re-advertise channel
    let (advertise_tx, advertise_rx) = tokio::sync::mpsc::channel(32);

    // Ws
    let (ws_event_tx, mut ws_event_rx) = tokio::sync::mpsc::channel(32);
    let ws_manager = Arc::new(WsManager::new(ws_event_tx));

    // Spawn mDNS advertiser
    tokio::spawn(start_mdns_service_with_re_advertise(
        identity.clone(),
        advertise_rx,
    ));

    // Start services
    tokio::spawn(start_health_check(peer_manager.clone()));
    tokio::spawn(discover(peer_manager.clone(), peer_id));

    tauri::Builder::default()
        .manage(identity)
        .manage(advertise_tx)
        .manage(peer_manager)
        .manage(ws_manager)
        .setup(|app| {
            let handle = app.handle().clone();
            let handle_for_ws = handle.clone();

            tokio::spawn(async move {
                while let Some(event) = peer_event_rx.recv().await {
                    let event_type = match &event {
                        PeerEvent::Joined { .. } => "peer-connected",
                        PeerEvent::Left { .. } => "peer-disconnected",
                        PeerEvent::Updated { .. } => "peer-updated",
                        PeerEvent::Reconnected { .. } => "peer-reconnected",
                    };

                    println!("Emitting event: {event:?}");

                    handle.clone().emit(event_type, event.clone()).unwrap();
                }
            });

            tokio::spawn(async move {
                while let Some(event) = ws_event_rx.recv().await {
                    let event_type = match event {
                        WsEvent::Connected { .. } => "ws-connected",
                        WsEvent::Disconnected { .. } => "ws-disconnected",
                        WsEvent::MessageReceived { .. } => "ws-message",
                    };
                    let _ = handle_for_ws.clone().emit(event_type, event);
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            connect_to_peer,
            get_current_peers,
            update_name,
            start_ws_server,
            is_ws_server_running,
            get_ws_server_address,
            send_message_to_peer
        ])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");

    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub async fn mobile_entry() {
    if let Err(err) = run().await {
        eprintln!("Mobile app failed: {err}");
    }
}
