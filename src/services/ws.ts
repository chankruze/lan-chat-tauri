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
