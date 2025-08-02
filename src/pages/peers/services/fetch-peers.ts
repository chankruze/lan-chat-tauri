import { invoke } from "@tauri-apps/api/core";
import type { PeerInfo } from "@/types/peer";

export async function fetchCurrentPeers(): Promise<Record<string, PeerInfo>> {
  const peersList = await invoke<PeerInfo[]>("get_current_peers");
  return peersList.reduce<Record<string, PeerInfo>>((acc, peer) => {
    acc[peer.id] = peer;
    return acc;
  }, {});
}
