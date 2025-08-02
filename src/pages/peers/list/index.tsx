import { PeerInfo } from "@/types/peer";
import { Card } from "./card";
import { RiRouterFill } from "@remixicon/react";

interface ListProps {
  peers: Record<string, PeerInfo>;
  peersCount: number;
}

export const List = ({ peers, peersCount }: ListProps) => {
  if (peersCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <RiRouterFill className="w-16 h-16 text-neutral-200" />
        <p className="text-neutral-600 font-medium">No peers online</p>
        <p className="text-xs text-neutral-400 mt-2">
          Peers will appear here when they connect.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 p-[5vw] xl:p-4">
      {Object.values(peers).map((peer) => (
        <Card key={peer.id} peerInfo={peers[peer.id]} />
      ))}
    </div>
  );
};
