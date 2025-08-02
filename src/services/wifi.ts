import { invoke } from "@tauri-apps/api/core";

export const ssid = async () => await invoke<string>("fetch_ssid");
