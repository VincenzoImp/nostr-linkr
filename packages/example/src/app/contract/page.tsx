"use client";

import { useState } from "react";
import { linkrClient } from "@/lib/client";
import { ResultDisplay } from "@/components/ResultDisplay";
import { CodeBlock } from "@/components/CodeBlock";
import {
  nostrLinkrAbi,
  DEPLOYMENTS,
  getSupportedChainIds,
  NOSTR_LINKR_EVENT_KIND,
  MAX_FUTURE_TOLERANCE,
  MAX_PAST_TOLERANCE,
  NostrLinkrError,
  NostrLinkrErrorCode,
  NoWalletClientError,
} from "nostr-linkr";

export default function ContractPage() {
  const [paused, setPaused] = useState<string | null>(null);
  const [owner, setOwner] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchContractInfo = async () => {
    setLoading("info");
    setError(null);
    try {
      const [isPaused, contractOwner] = await Promise.all([
        linkrClient.isPaused(),
        linkrClient.getOwner(),
      ]);
      setPaused(String(isPaused));
      setOwner(contractOwner);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to query contract");
    } finally {
      setLoading(null);
    }
  };

  // Test error classes
  const testErrors = () => {
    const errors: string[] = [];

    try {
      throw new NostrLinkrError("Test error", NostrLinkrErrorCode.NO_DEPLOYMENT);
    } catch (e) {
      if (e instanceof NostrLinkrError) {
        errors.push(`NostrLinkrError: code=${e.code}, message="${e.message}"`);
      }
    }

    try {
      throw new NoWalletClientError();
    } catch (e) {
      if (e instanceof NoWalletClientError) {
        errors.push(`NoWalletClientError: code=${e.code}, message="${e.message}"`);
      }
    }

    setError(null);
    setOwner(errors.join("\n"));
  };

  const chainIds = getSupportedChainIds();
  const abiSummary = nostrLinkrAbi
    .filter((item) => item.type === "function" && "name" in item)
    .map((item) => ("name" in item ? item.name : ""))
    .join(", ");

  const eventSummary = nostrLinkrAbi
    .filter((item) => item.type === "event" && "name" in item)
    .map((item) => ("name" in item ? item.name : ""))
    .join(", ");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-2">Contract Info</h1>
        <p className="text-zinc-400">
          Contract status, ABI, deployments, constants, and error handling.
        </p>
      </div>

      {/* Contract Status */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Contract Status</h2>
        <button className="btn btn-primary" onClick={fetchContractInfo} disabled={loading === "info"}>
          {loading === "info" ? "Querying..." : "Fetch Contract Info"}
        </button>
        <ResultDisplay label="Contract Address" value={linkrClient.contractAddress} mono />
        <ResultDisplay label="Chain" value={`${linkrClient.chain.name} (id: ${linkrClient.chain.id})`} />
        {paused !== null && <ResultDisplay label="isPaused()" value={paused} />}
        {owner !== null && <ResultDisplay label="getOwner()" value={owner} mono />}
        <CodeBlock code={`const paused = await linkr.isPaused();
const owner = await linkr.getOwner();
console.log(linkr.contractAddress, linkr.chain.name);`} />
      </div>

      {/* ABI */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Contract ABI</h2>
        <ResultDisplay label="Functions" value={abiSummary} />
        <ResultDisplay label="Events" value={eventSummary} />
        <ResultDisplay label="ABI entries" value={String(nostrLinkrAbi.length)} />
        <CodeBlock code={`import { nostrLinkrAbi } from "nostr-linkr/abi";

// Use with viem directly
const result = await publicClient.readContract({
  address: "0x...",
  abi: nostrLinkrAbi,
  functionName: "addressPubkey",
  args: ["0x..."],
});`} />
      </div>

      {/* Deployments */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Known Deployments</h2>
        <ResultDisplay label="Supported Chain IDs" value={JSON.stringify(chainIds)} />
        {Object.entries(DEPLOYMENTS).map(([chainId, info]) => (
          <ResultDisplay
            key={chainId}
            label={`${info.chainName} (${chainId})`}
            value={info.address}
            mono
          />
        ))}
        <CodeBlock code={`import { DEPLOYMENTS, getDeployment, getSupportedChainIds } from "nostr-linkr";

const deployment = getDeployment(84532);
// { address, chainId, chainName, blockExplorerUrl }

const chainIds = getSupportedChainIds();
// [31337, 84532]`} />
      </div>

      {/* Constants */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Constants</h2>
        <ResultDisplay label="NOSTR_LINKR_EVENT_KIND" value={String(NOSTR_LINKR_EVENT_KIND)} />
        <ResultDisplay label="MAX_FUTURE_TOLERANCE" value={`${MAX_FUTURE_TOLERANCE} seconds (${MAX_FUTURE_TOLERANCE / 60} min)`} />
        <ResultDisplay label="MAX_PAST_TOLERANCE" value={`${MAX_PAST_TOLERANCE} seconds (${MAX_PAST_TOLERANCE / 60} min)`} />
        <CodeBlock code={`import {
  NOSTR_LINKR_EVENT_KIND,  // 27235
  MAX_FUTURE_TOLERANCE,     // 300
  MAX_PAST_TOLERANCE,       // 3600
  NOSTR_EVENT_KINDS,        // { METADATA: 0, TEXT_NOTE: 1, REACTION: 7, LINKR: 27235 }
} from "nostr-linkr";`} />
      </div>

      {/* Error Handling */}
      <div className="card space-y-4">
        <h2 className="text-lg font-semibold">Error Handling</h2>
        <button className="btn btn-secondary" onClick={testErrors}>Test Error Classes</button>
        <CodeBlock code={`import {
  NostrLinkrError,
  NostrLinkrErrorCode,
  NoWalletClientError,
  ValidationError,
  ContractRevertError,
} from "nostr-linkr";

try {
  await linkr.pushLink(signedEvent);
} catch (e) {
  if (e instanceof NoWalletClientError) {
    // Handle: no walletClient configured
  }
  if (e instanceof NostrLinkrError) {
    switch (e.code) {
      case NostrLinkrErrorCode.CONTRACT_PAUSED:
        // Handle: contract is paused
        break;
      case NostrLinkrErrorCode.INVALID_PUBKEY:
        // Handle: invalid pubkey format
        break;
    }
  }
}`} />
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">{error}</div>}
    </div>
  );
}
