export type PeerMetadata = {
  addr: string;
  name: string;
  instance: string;
  version: string;
  platform: string;
};

export type PeerInfo = {
  id: string;
  metadata?: PeerMetadata;
};

export type PeerEvent = {
  type: "Joined" | "Left" | "Updated" | "Reconnected";
  id: string;
  timestamp: string;
  source: string;
  peer: PeerInfo;
};
