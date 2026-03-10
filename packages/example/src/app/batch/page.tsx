"use client";

import { useState } from "react";
import { linkrClient } from "@/lib/client";
import { ResultDisplay } from "@/components/ResultDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import type { Address } from "viem";
import type { BatchLookupResult } from "nostr-linkr";

export default function BatchPage() {
  const [pubkeysInput, setPubkeysInput] = useState("");
  const [addressesInput, setAddressesInput] = useState("");
  const [pubkeyResults, setPubkeyResults] = useState<BatchLookupResult | null>(null);
  const [addressResults, setAddressResults] = useState<BatchLookupResult | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const batchLookupPubkeys = async () => {
    setLoading("pubkeys");
    setError(null);
    try {
      const pubkeys = pubkeysInput.split("\n").map((s) => s.trim()).filter(Boolean);
      const results = await linkrClient.batchGetEthereumAddresses(pubkeys);
      setPubkeyResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch lookup failed");
    } finally {
      setLoading(null);
    }
  };

  const batchLookupAddresses = async () => {
    setLoading("addresses");
    setError(null);
    try {
      const addresses = addressesInput.split("\n").map((s) => s.trim()).filter(Boolean) as Address[];
      const results = await linkrClient.batchGetNostrPubkeys(addresses);
      setAddressResults(results);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Batch lookup failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Batch Lookup</h1>
        <p className="text-zinc-400">
          Resolve multiple identities in a single multicall RPC using{" "}
          <code>batchGetEthereumAddresses()</code> and <code>batchGetNostrPubkeys()</code>.
        </p>
      </div>

      {/* Batch by Pubkeys */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Batch: Pubkeys → Addresses</h2>
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder={"One pubkey per line:\n3bf0c63fcb93463407af97a5e5ee64fa883d107ef9e558472c4eb9aaaefa459d\n1234567890abcdef..."}
          value={pubkeysInput}
          onChange={(e) => setPubkeysInput(e.target.value)}
        />
        <button className="btn btn-primary" onClick={batchLookupPubkeys} disabled={loading === "pubkeys"}>
          {loading === "pubkeys" ? "Resolving..." : "Batch Resolve"}
        </button>
        {pubkeyResults && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              {pubkeyResults.results.size} resolved, {pubkeyResults.errors.size} errors
            </p>
            {Array.from(pubkeyResults.results.entries()).map(([key, value]) => (
              <ResultDisplay key={key} label={`${key.slice(0, 16)}...`} value={value as string | null} mono />
            ))}
          </div>
        )}
        <CodeBlock code={`const results = await linkr.batchGetEthereumAddresses([
  "3bf0c63f...",
  "1a2b3c4d...",
  "deadbeef...",
]);

// results.results: Map<pubkey, Address | null>
// results.errors: Map<pubkey, Error>`} />
      </div>

      {/* Batch by Addresses */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Batch: Addresses → Pubkeys</h2>
        <textarea
          className="input min-h-[120px] resize-y"
          placeholder={"One address per line:\n0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266\n0x70997970C51812dc3A010C7d01b50e0d17dc79C8"}
          value={addressesInput}
          onChange={(e) => setAddressesInput(e.target.value)}
        />
        <button className="btn btn-primary" onClick={batchLookupAddresses} disabled={loading === "addresses"}>
          {loading === "addresses" ? "Resolving..." : "Batch Resolve"}
        </button>
        {addressResults && (
          <div className="space-y-2">
            <p className="text-sm text-zinc-400">
              {addressResults.results.size} resolved, {addressResults.errors.size} errors
            </p>
            {Array.from(addressResults.results.entries()).map(([key, value]) => (
              <ResultDisplay key={key} label={`${key.slice(0, 10)}...${key.slice(-4)}`} value={value as string | null} mono />
            ))}
          </div>
        )}
        <CodeBlock code={`const results = await linkr.batchGetNostrPubkeys([
  "0xf39Fd6e5...",
  "0x70997970...",
]);

// results.results: Map<address, pubkey | null>
// results.errors: Map<address, Error>`} />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
