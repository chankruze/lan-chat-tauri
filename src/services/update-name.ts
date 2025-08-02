import { invoke } from "@tauri-apps/api/core";

export const updateName = async (newName: string) => {
  if (!newName.trim()) return;

  try {
    await invoke("update_name", { newName });
  } catch (error) {
    console.error("Failed to update name:", error);
  }
}
