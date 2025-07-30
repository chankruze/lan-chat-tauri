mod commands;

use commands::*;
use lan_chat::{
    networking::{discover, start_mdns_service_with_re_advertise},
    peer::{start_health_check, PeerEvent, PeerIdentity, PeerManager},
};
use std::sync::Arc;
use tauri::Emitter;
use tokio::sync::RwLock;

#[tokio::main]
pub async fn run() -> anyhow::Result<()> {
    let identity = Arc::new(RwLock::new(PeerIdentity::load_or_generate()));
    let (event_tx, mut event_rx) = tokio::sync::mpsc::channel(32);
    let peer_manager = PeerManager::new(event_tx);
    let peer_manager = Arc::new(peer_manager);

    let peer_id = identity.read().await.peer_id.clone();

    // Create mDNS re-advertise channel
    let (advertise_tx, advertise_rx) = tokio::sync::mpsc::unbounded_channel();

    // Spawn mDNS advertiser
    tokio::spawn(start_mdns_service_with_re_advertise(
        identity.clone(),
        advertise_rx,
    ));

    // Start services
    tokio::spawn(start_health_check(peer_manager.clone()));
    tokio::spawn(discover(peer_manager.clone(), peer_id));

    tauri::Builder::default()
        .manage(identity.clone())
        .manage(advertise_tx.clone())
        .manage(peer_manager)
        .setup(|app| {
            let handle = app.handle().clone();

            tokio::spawn(async move {
                while let Some(event) = event_rx.recv().await {
                    let event_type = match &event {
                        PeerEvent::Joined { .. } => "peer-connected",
                        PeerEvent::Left { .. } => "peer-disconnected",
                        PeerEvent::Updated { .. } => "peer-updated",
                        PeerEvent::Reconnected { .. } => "peer-reconnected",
                    };

                    println!("Emitting event: {event:?}");

                    handle.emit(event_type, event.clone()).unwrap();
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
