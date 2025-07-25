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
