"use client";

import { useState } from "react";
import { linkrClient } from "@/lib/client";
import { ResultDisplay } from "@/components/ResultDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import { isValidPubkey } from "nostr-linkr";
import type { Address } from "viem";
import type { IdentityLink } from "nostr-linkr";

export default function LookupPage() {
  const [pubkeyInput, setPubkeyInput] = useState("");
  const [addressInput, setAddressInput] = useState("");
  const [pubkeyResult, setPubkeyResult] = useState<string | null>(null);
  const [addressResult, setAddressResult] = useState<string | null>(null);
  const [linkResult, setLinkResult] = useState<IdentityLink | null>(null);
  const [isLinkedResult, setIsLinkedResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const lookupByPubkey = async () => {
    if (!isValidPubkey(pubkeyInput)) {
      setError("Invalid pubkey: must be 64 lowercase hex characters");
      return;
    }
    setLoading("pubkey");
    setError(null);
    try {
      const addr = await linkrClient.getEthereumAddress(pubkeyInput);
      setAddressResult(addr);

      const link = await linkrClient.getLinkByPubkey(pubkeyInput);
      setLinkResult(link);

      const linked = await linkrClient.isLinkedByPubkey(pubkeyInput);
      setIsLinkedResult(linked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(null);
    }
  };

  const lookupByAddress = async () => {
    setLoading("address");
    setError(null);
    try {
      const pk = await linkrClient.getNostrPubkey(addressInput as Address);
      setPubkeyResult(pk);

      const link = await linkrClient.getLink(addressInput as Address);
      setLinkResult(link);

      const linked = await linkrClient.isLinked(addressInput as Address);
      setIsLinkedResult(linked);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Single Lookup</h1>
        <p className="text-zinc-400">Query identity links using <code>getEthereumAddress()</code>, <code>getNostrPubkey()</code>, <code>getLink()</code>, and <code>isLinked()</code>.</p>
      </div>

      {/* Lookup by Pubkey */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Lookup by Nostr Pubkey</h2>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="64-char hex Nostr pubkey..."
            value={pubkeyInput}
            onChange={(e) => setPubkeyInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={lookupByPubkey} disabled={loading === "pubkey"}>
            {loading === "pubkey" ? "Querying..." : "Lookup"}
          </button>
        </div>
        {addressResult !== undefined && addressResult !== null && (
          <ResultDisplay label="Ethereum Address" value={addressResult} mono />
        )}
        <CodeBlock code={`const addr = await linkr.getEthereumAddress("${pubkeyInput || "3bf0c63f..."}");`} />
      </div>

      {/* Lookup by Address */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Lookup by Ethereum Address</h2>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="0x..."
            value={addressInput}
            onChange={(e) => setAddressInput(e.target.value)}
          />
          <button className="btn btn-primary" onClick={lookupByAddress} disabled={loading === "address"}>
            {loading === "address" ? "Querying..." : "Lookup"}
          </button>
        </div>
        {pubkeyResult !== undefined && pubkeyResult !== null && (
          <ResultDisplay label="Nostr Pubkey" value={pubkeyResult} mono />
        )}
        <CodeBlock code={`const pubkey = await linkr.getNostrPubkey("${addressInput || "0x..."}");`} />
      </div>

      {/* Full Link Info */}
      {linkResult && (
        <div className="card space-y-3">
          <h2 className="text-lg font-semibold">Full Identity Link</h2>
          <ResultDisplay label="Ethereum Address" value={linkResult.ethereumAddress} mono />
          <ResultDisplay label="Nostr Pubkey" value={linkResult.nostrPubkey || null} mono />
          <ResultDisplay label="Linked" value={linkResult.linked ? "Yes" : "No"} />
          {isLinkedResult !== null && (
            <ResultDisplay label="isLinked() / isLinkedByPubkey()" value={isLinkedResult ? "true" : "false"} />
          )}
          <CodeBlock code={`const link = await linkr.getLink("0x...");
// { ethereumAddress, nostrPubkey, linked }

const linked = await linkr.isLinked("0x...");
// boolean`} />
        </div>
      )}

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
