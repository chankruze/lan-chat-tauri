import { StatusBar } from "@/components/status-bar";
import { List } from "./list";
import { usePeers } from "./hooks/use-peers";

export default function PeersIndexPage() {
  const { peers, peersCount } = usePeers();

  return (
    <main className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <List peers={peers} peersCount={peersCount} />
      </div>
      <StatusBar peersCount={peersCount} />
    </main>
  );
}
