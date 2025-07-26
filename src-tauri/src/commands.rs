use crate::app_state::AppState;
use lan_chat::peer::PeerInfo;
use tauri::{command, State};

#[command]
pub async fn connect_to_peer(peer_addr: String) -> Result<(), String> {
    // TODO: implement peer connection using lan_chat::ws::connect or similar
    println!("Connecting to peer: {peer_addr}");
    Ok(())
}

#[command]
pub async fn get_current_peers(state: State<'_, AppState>) -> Result<Vec<PeerInfo>, String> {
    let peers_arc = state.peers.lock().await;
    let peers_map = peers_arc.read().await;

    let peer_list = peers_map
        .iter()
        .map(|(id, peer)| PeerInfo {
            id: id.clone(),
            metadata: peer.metadata.clone(),
        })
        .collect();

    Ok(peer_list)
}

#[tauri::command]
pub async fn update_name(
    new_name: String,
    state: tauri::State<'_, AppState>,
) -> Result<(), String> {
    if new_name.trim().is_empty() {
        return Err("Name cannot be empty".to_string());
    }

    let mut identity = state.identity.write().await;

    if new_name.trim() == identity.peer_name() {
        return Ok(());
    }

    identity.update_peer_name(new_name.trim());
    drop(identity);

    let notifier = state.notifier.lock().await;
    notifier.advertise();
    drop(notifier);

    Ok(())
}
