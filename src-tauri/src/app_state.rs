use lan_chat::peer::PeerMap;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct AppState {
    pub peers: Arc<Mutex<PeerMap>>,
}
