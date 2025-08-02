import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { PeerEvent, PeerInfo } from "@/types/peer";
import { fetchCurrentPeers } from "../services/fetch-peers";

export const usePeers = () => {
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});

  const handleEvent = (event: PeerEvent) => {
    setPeers((prev) => {
      const updated = { ...prev };
      const { type, peer } = event;

      switch (type) {
        case "Joined":
        case "Updated":
        case "Reconnected":
          updated[peer.id] = peer;
          break;
        case "Left":
          delete updated[peer.id];
          break;
      }

      return updated;
    });
  };

  useEffect(() => {
    const eventTypes = [
      "peer-connected",
      "peer-updated",
      "peer-reconnected",
      "peer-disconnected",
    ];

    const unlistenFns: Promise<() => void>[] = eventTypes.map((eventName) =>
      listen(eventName, (event: { payload: PeerEvent }) =>
        handleEvent(event.payload),
      ),
    );

    fetchCurrentPeers().then(setPeers);

    return () => {
      unlistenFns.forEach((unlisten) => {
        unlisten.then((fn) => fn());
      });
    };
  }, []);

  return {
    peers,
    peersCount: Object.keys(peers).length,
    getPeer: (id: string) => peers[id],
  };
};
