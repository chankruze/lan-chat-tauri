use lan_chat::peer::{PeerIdentity, PeerMap, PeerNotifier};
use std::sync::Arc;
use tokio::sync::{Mutex, RwLock};

pub struct AppState {
    pub peers: Arc<Mutex<PeerMap>>,
    pub identity: Arc<RwLock<PeerIdentity>>,
    pub notifier: Arc<Mutex<PeerNotifier>>,
}
