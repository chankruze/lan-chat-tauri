import { RiCircleFill as OnlineIcon } from "@remixicon/react";

export const StatusBar = ({ peersCount }: { peersCount: number }) => {
  return (
    <div className="text-xs py-2 px-4 flex items-center justify-between bg-green-600 text-white">
      <p>
        {peersCount === 0
          ? "No peers online"
          : `${peersCount} Peer${peersCount > 1 ? "s" : ""} online`}
      </p>
      <div className="flex items-center gap-1">
        <OnlineIcon className="inline-block w-3 h-3" />
        <p>Online</p>
      </div>
    </div>
  );
};
