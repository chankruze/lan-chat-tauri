use lan_chat::{
    peer::{PeerIdentity, PeerInfo, PeerManager},
    ws::{start_websocket_server, WsManager},
};
use std::{net::SocketAddr, sync::Arc};
use tauri::{command, State};
use tokio::sync::{mpsc::Sender, RwLock};

#[command]
pub async fn start_ws_server(ws_manager: State<'_, Arc<WsManager>>) -> Result<(), String> {
    let addr: SocketAddr = "0.0.0.0:6767".parse().unwrap();
    let ws_manager = ws_manager.inner().clone();

    tokio::spawn(async move {
        if let Err(e) = start_websocket_server(addr, ws_manager).await {
            eprintln!("Failed to start WebSocket server: {e}");
        } else {
            println!("WebSocket server started on {addr}");
        }
    });

    Ok(())
}

#[command]
pub async fn connect_to_peer(
    addr: String,
    ws_manager: State<'_, Arc<WsManager>>,
) -> Result<(), String> {
    ws_manager.connect(addr).await.map_err(|e| e.to_string())
}

#[command]
pub async fn send_message_to_peer(
    addr: String,
    message: String,
    ws_manager: State<'_, Arc<WsManager>>,
) -> Result<(), String> {
    ws_manager
        .send_message(&addr, message)
        .await
        .map_err(|e| e.to_string())
}

#[command]
pub async fn get_current_peers(
    peer_manager: State<'_, Arc<PeerManager>>,
) -> Result<Vec<PeerInfo>, String> {
    Ok(peer_manager.get_all_peers().await)
}

#[command]
pub async fn update_name(
    new_name: String,
    identity: State<'_, Arc<RwLock<PeerIdentity>>>,
    advertise_tx: State<'_, Sender<()>>,
) -> Result<(), String> {
    let trimmed = new_name.trim();
    if trimmed.is_empty() {
        return Err("Name cannot be empty".to_string());
    }

    let mut identity_guard = identity.write().await;

    if trimmed == identity_guard.peer_name() {
        return Ok(());
    }

    identity_guard.update_peer_name(trimmed);

    if advertise_tx.send(()).await.is_err() {
        return Err("Failed to trigger re-advertisement".to_string());
    }

    Ok(())
}
