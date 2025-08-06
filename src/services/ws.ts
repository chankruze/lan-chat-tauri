import { invoke } from "@tauri-apps/api/core";

export async function connectToPeer(addr: string): Promise<void> {
  await invoke("connect_to_peer", { addr });
}

export async function sendMessageToPeer(addr: string, message: string): Promise<void> {
  await invoke("send_message_to_peer", { addr, message });
}

export async function startWebSocketServer(): Promise<void> {
  await invoke("start_ws_server");
}

export async function isWebSocketServerRunning(): Promise<boolean> {
  return await invoke("is_ws_server_running");
}

export async function getWebSocketServerAddress(): Promise<string | null> {
  return await invoke("get_ws_server_address");
}

/**
 * Ensures the WebSocket server is running before attempting to connect to a peer.
 * This is a convenience function that combines server startup and connection.
 */
export async function ensureServerAndConnect(peerAddr: string): Promise<void> {
  // Start server if not already running
  await startWebSocketServer();
  
  // Small delay to ensure server is ready
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Connect to peer
  await connectToPeer(peerAddr);
}
