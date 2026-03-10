"use client";

import { useState, useEffect, useRef } from "react";
import { linkrClient } from "@/lib/client";
import { CodeBlock } from "@/components/CodeBlock";
import type { Address, Hash } from "viem";
import type { LinkrEventLog } from "nostr-linkr";

export default function EventsPage() {
  const [historicalEvents, setHistoricalEvents] = useState<LinkrEventLog[]>([]);
  const [liveEvents, setLiveEvents] = useState<LinkrEventLog[]>([]);
  const [watching, setWatching] = useState(false);
  const [filterAddress, setFilterAddress] = useState("");
  const [filterPubkey, setFilterPubkey] = useState("");
  const [fromBlock, setFromBlock] = useState("0");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unwatchRef = useRef<(() => void) | null>(null);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: Parameters<typeof linkrClient.getLinkEvents>[0] = {
        fromBlock: BigInt(fromBlock || "0"),
        toBlock: "latest",
      };
      if (filterAddress) filter.address = filterAddress as Address;
      if (filterPubkey) filter.pubkey = filterPubkey as Hash;

      const events = await linkrClient.getLinkEvents(filter);
      setHistoricalEvents(events);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  const toggleWatch = () => {
    if (watching && unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
      setWatching(false);
      return;
    }

    const filter: { address?: Address; pubkey?: Hash } = {};
    if (filterAddress) filter.address = filterAddress as Address;
    if (filterPubkey) filter.pubkey = filterPubkey as Hash;

    const unwatch = linkrClient.watchLinkEvents((log) => {
      setLiveEvents((prev) => [log, ...prev]);
    }, filter);

    unwatchRef.current = unwatch;
    setWatching(true);
  };

  useEffect(() => {
    return () => {
      if (unwatchRef.current) unwatchRef.current();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Event Logs & Watching</h1>
        <p className="text-zinc-400">
          Query historical <code>LinkrPushed</code> / <code>LinkrPulled</code> events and watch for new ones in real-time.
        </p>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input" placeholder="Filter by address (0x...)" value={filterAddress} onChange={(e) => setFilterAddress(e.target.value)} />
          <input className="input" placeholder="Filter by pubkey (0x...)" value={filterPubkey} onChange={(e) => setFilterPubkey(e.target.value)} />
          <input className="input" placeholder="From block (default: 0)" value={fromBlock} onChange={(e) => setFromBlock(e.target.value)} />
        </div>
        <div className="flex gap-3">
          <button className="btn btn-primary" onClick={fetchEvents} disabled={loading}>
            {loading ? "Fetching..." : "Fetch Historical Events"}
          </button>
          <button className={`btn ${watching ? "btn-danger" : "btn-secondary"}`} onClick={toggleWatch}>
            {watching ? "Stop Watching" : "Start Watching Live"}
          </button>
        </div>
      </div>

      {/* Live Events */}
      {watching && (
        <div className="card space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <h2 className="text-lg font-semibold">Live Events</h2>
            <span className="badge badge-success">{liveEvents.length} received</span>
          </div>
          {liveEvents.length === 0 ? (
            <p className="text-zinc-500 text-sm">Waiting for events...</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {liveEvents.map((event, i) => (
                <EventRow key={i} event={event} />
              ))}
            </div>
          )}
          <CodeBlock code={`const unwatch = linkr.watchLinkEvents((log) => {
  console.log(log.eventName, log.address, log.pubkey);
});

// Stop watching
unwatch();`} />
        </div>
      )}

      {/* Historical Events */}
      <div className="card space-y-3">
        <h2 className="text-lg font-semibold">Historical Events ({historicalEvents.length})</h2>
        {historicalEvents.length === 0 ? (
          <p className="text-zinc-500 text-sm">No events found. Click &quot;Fetch Historical Events&quot; to query.</p>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {historicalEvents.map((event, i) => (
              <EventRow key={i} event={event} />
            ))}
          </div>
        )}
        <CodeBlock code={`const events = await linkr.getLinkEvents({
  fromBlock: 0n,
  toBlock: "latest",
  address: "0x...",  // optional
  pubkey: "0x...",   // optional
});`} />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
    </div>
  );
}

function EventRow({ event }: { event: LinkrEventLog }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 text-sm">
      <span className={`badge ${event.eventName === "LinkrPushed" ? "badge-success" : "badge-error"}`}>
        {event.eventName === "LinkrPushed" ? "Pushed" : "Pulled"}
      </span>
      <span className="mono text-zinc-400">{event.address.slice(0, 8)}...{event.address.slice(-4)}</span>
      <span className="text-zinc-600">↔</span>
      <span className="mono text-violet-400">{String(event.pubkey).slice(0, 10)}...{String(event.pubkey).slice(-4)}</span>
      <span className="text-zinc-600 ml-auto">Block {String(event.blockNumber)}</span>
    </div>
  );
}
