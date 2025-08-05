import { useState } from "react";
import { PeerInfo } from "@/types/peer";
import { platformIcon } from "@/utils/platform-icons";
import { Actions } from "./actions";

interface PeerCardProps {
  peerInfo: PeerInfo;
}

export const Card = ({ peerInfo }: PeerCardProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="w-full h-full p-3 space-y-1 hover:bg-blue-50 hover:border-blue-200 transition-all cursor-pointer rounded-lg bg-white border border-neutral-200 text-sm"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="font-semibold text-neutral-800 line-clamp-1 flex-1">
            {peerInfo.metadata?.name || "Unknown Peer"}
          </p>
          {platformIcon(peerInfo.metadata?.platform)}
        </div>
        <div className="text-neutral-500 space-y-1">
          <div className="text-neutral-400 text-xs line-clamp-2">
            {peerInfo.metadata?.instance}
          </div>
          <div className="truncate text-xs">{peerInfo.metadata?.addr}</div>
          <div className="truncate text-right text-xs text-neutral-400">
            v{peerInfo.metadata?.version}
          </div>
        </div>
      </div>
      <Actions peerInfo={peerInfo} open={open} onClose={() => setOpen(false)} />
    </>
  );
};
