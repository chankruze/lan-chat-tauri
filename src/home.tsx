import { useEffect, useState } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import {
  RiAppleFill as AppleIcon,
  RiAndroidFill as AndroidIcon,
  RiUbuntuFill as LinuxIcon,
  RiWindowsFill as WindowsIcon,
  RiCircleFill as OnlineIcon,
} from "@remixicon/react";

type PeerMetadata = {
  addr: string;
  name: string;
  instance: string;
  version: string;
  platform: string;
};

type PeerInfo = {
  id: string;
  metadata?: PeerMetadata;
};

type PeerEvent = {
  type: "Joined" | "Left" | "Updated" | "Reconnected";
  id: string;
  timestamp: string;
  source: string;
  peer: PeerInfo;
};

const platformIcon = (platform?: string) => {
  switch ((platform || "").toLowerCase().replace(/\s/g, "")) {
    case "windows":
      return <WindowsIcon className="w-4 h-4 text-blue-600" />;
    case "macos":
      return <AppleIcon className="w-4 h-4 text-neutral-800" />;
    case "linux":
      return <LinuxIcon className="w-4 h-4 text-orange-600" />;
    case "android":
      return <AndroidIcon className="w-4 h-4 text-green-600" />;
    default:
      return <span className="text-xs">❓</span>;
  }
};

const Home = () => {
  const [peers, setPeers] = useState<Record<string, PeerInfo>>({});
  const [newName, setNewName] = useState("");

  const handleNameUpdate = async () => {
    if (!newName.trim()) return;
    await invoke("update_name", { newName });
    setNewName("");
  };

  const handleEvent = (event: PeerEvent) => {
    setPeers((prevPeers) => {
      const updatedPeers = { ...prevPeers };
      const { type, peer } = event;

      switch (type) {
        case "Joined":
        case "Updated":
        case "Reconnected":
          updatedPeers[peer.id] = peer;
          break;
        case "Left":
          delete updatedPeers[peer.id];
          break;
      }

      return updatedPeers;
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
      listen(eventName, (event: { payload: PeerEvent }) => {
        handleEvent(event.payload);
      }),
    );

    // Initial fetch
    invoke<PeerInfo[]>("get_current_peers").then((peersList) => {
      setPeers(() => {
        const initialPeers: Record<string, PeerInfo> = {};
        peersList.forEach((peer) => {
          initialPeers[peer.id] = peer;
        });
        return initialPeers;
      });
    });

    return () => {
      unlistenFns.forEach((unlisten) => {
        unlisten.then((fn) => fn());
      });
    };
  }, []);

  const peersCount = Object.keys(peers).length;

  return (
    <main className="h-screen bg-blue- flex flex-col">
      <div className="relative flex-1">
        {Object.values(peers).map((peer, index, all) => {
          const angle = (360 / all.length) * index;
          const radius = 200;
          const x = radius * Math.cos((angle * Math.PI) / 180);
          const y = radius * Math.sin((angle * Math.PI) / 180);

          return (
            <div
              key={peer.id}
              className="absolute w-52 p-3 rounded-lg bg-neutral-50 border border-neutral-100 shadow-lg text-sm"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-neutral-800 truncate">
                  {peer.metadata?.name || "Unknown"}
                </span>
                {platformIcon(peer.metadata?.platform)}
              </div>
              <div className="text-neutral-500 space-y-1">
                <div className="text-neutral-400 text-xs">
                  {peer.metadata?.instance}
                </div>
                <div className="truncate text-xs">{peer.metadata?.addr}</div>
                <div className="truncate text-right text-xs text-neutral-400">
                  v{peer.metadata?.version}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-neutral-100 px-4 py-2 flex items-center gap-2 border-t border-neutral-300">
        <input
          type="text"
          className="flex-1 px-2 py-1 rounded border text-sm"
          value={newName}
          placeholder="Enter new name"
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          onClick={handleNameUpdate}
          className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Update Name
        </button>
      </div>
      <div className="text-xs py-2 px-4 flex items-center justify-between bg-green-600 text-white">
        <p>
          {peersCount === 0
            ? "No peers connected"
            : `${peersCount} peer${peersCount > 1 ? "s" : ""} connected`}
        </p>
        <div className="flex items-center gap-1">
          <OnlineIcon className="inline-block w-3 h-3" />
          <p>Online</p>
        </div>
      </div>
    </main>
  );
};

export default Home;

// invoke<PeerInfo[]>("get_current_peers").then((peersList) => {
//   setPeers((prev) => {
//     const newPeers = { ...prev };
//     peersList.forEach((peer) => {
//       newPeers[peer.id] = peer;
//     });
//     return newPeers;
//   });
// });
