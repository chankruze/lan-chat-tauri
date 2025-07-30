use lan_chat::peer::{PeerIdentity, PeerInfo, PeerManager};
use std::sync::Arc;
use tauri::{command, State};
use tokio::sync::{mpsc::UnboundedSender, RwLock};

#[command]
pub async fn connect_to_peer(peer_addr: String) -> Result<(), String> {
    // TODO: implement peer connection using lan_chat::ws::connect or similar
    println!("Connecting to peer: {peer_addr}");
    Ok(())
}

#[tauri::command]
pub async fn get_current_peers(
    peer_manager: State<'_, Arc<PeerManager>>,
) -> Result<Vec<PeerInfo>, String> {
    Ok(peer_manager.get_all_peers().await)
}

#[tauri::command]
pub async fn update_name(
    new_name: String,
    identity: State<'_, Arc<RwLock<PeerIdentity>>>,
    advertise_tx: State<'_, UnboundedSender<()>>,
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

    // Send re-advertise signal
    if advertise_tx.send(()).is_err() {
        return Err("Failed to trigger re-advertisement".to_string());
    }

    Ok(())
}
