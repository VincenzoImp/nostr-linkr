"use client";

import Link from "next/link";
import { CodeBlock } from "@/components/CodeBlock";
import {
  NOSTR_LINKR_EVENT_KIND,
  NOSTR_EVENT_KINDS,
  MAX_FUTURE_TOLERANCE,
  MAX_PAST_TOLERANCE,
  getSupportedChainIds,
  DEPLOYMENTS,
} from "nostr-linkr";

const sections = [
  {
    href: "/lookup",
    title: "Single Lookup",
    description: "Query identity links — Ethereum address to Nostr pubkey, or vice versa. Uses getNostrPubkey(), getEthereumAddress(), getLink().",
    sdk: "getNostrPubkey, getEthereumAddress, getLink, getLinkByPubkey, isLinked",
  },
  {
    href: "/batch",
    title: "Batch Lookup",
    description: "Resolve multiple pubkeys or addresses in a single multicall RPC. Efficient for feeds and lists.",
    sdk: "batchGetEthereumAddresses, batchGetNostrPubkeys",
  },
  {
    href: "/events",
    title: "Event Logs & Watching",
    description: "Query historical LinkrPushed/LinkrPulled events and watch for new ones in real-time.",
    sdk: "getLinkEvents, watchLinkEvents",
  },
  {
    href: "/verify",
    title: "Event Creation & Verification",
    description: "Create, hash, serialize, and validate Nostr linking events. Verify on-chain with BIP-340 Schnorr.",
    sdk: "createLinkEvent, hashEvent, serializeEvent, validateLinkEvent, verifyNostrEventOnChain, getEventHashOnChain",
  },
  {
    href: "/link",
    title: "Identity Linking",
    description: "Full linking flow — create event, sign with Nostr extension, submit on-chain, or remove existing link.",
    sdk: "createAndSignLinkEvent, pushLink, pullLink, simulatePushLink",
  },
  {
    href: "/contract",
    title: "Contract Info",
    description: "Contract status, owner, ABI export, utility functions, and constants.",
    sdk: "isPaused, getOwner, nostrLinkrAbi, pubkeyToBytes32, isValidPubkey, addressToContent",
  },
];

export default function HomePage() {
  const chainIds = getSupportedChainIds();

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="text-center space-y-4 py-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text text-transparent">
          nostr-linkr SDK
        </h1>
        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
          On-chain Ethereum↔Nostr identity bridge with BIP-340 Schnorr verification.
          This example demonstrates every SDK function.
        </p>

        <div className="flex justify-center gap-3 flex-wrap">
          <span className="badge badge-info">Kind {NOSTR_LINKR_EVENT_KIND}</span>
          <span className="badge badge-success">{chainIds.length} chains supported</span>
          <span className="badge badge-warning">±{MAX_FUTURE_TOLERANCE}s / -{MAX_PAST_TOLERANCE}s tolerance</span>
        </div>
      </div>

      {/* SDK Constants Preview */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">SDK Constants</h2>
        <CodeBlock
          code={`import { NOSTR_EVENT_KINDS, DEPLOYMENTS, getSupportedChainIds } from "nostr-linkr";

NOSTR_EVENT_KINDS = ${JSON.stringify(NOSTR_EVENT_KINDS, null, 2)}

Supported chains: ${JSON.stringify(chainIds)}
Deployments: ${JSON.stringify(Object.fromEntries(Object.entries(DEPLOYMENTS).map(([k, v]) => [k, { name: v.chainName, address: v.address.slice(0, 10) + "..." }])), null, 2)}`}
        />
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <Link key={section.href} href={section.href} className="card hover:border-violet-600/50 transition-colors group">
            <h3 className="text-base font-semibold group-hover:text-violet-300 transition-colors mb-2">
              {section.title}
            </h3>
            <p className="text-sm text-zinc-400 mb-3">{section.description}</p>
            <p className="mono text-xs text-violet-400/70">{section.sdk}</p>
          </Link>
        ))}
      </div>

      {/* Quick Start */}
      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
        <CodeBlock
          code={`import { createNostrLinkrClient } from "nostr-linkr";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

const linkr = createNostrLinkrClient({
  chain: baseSepolia,
  publicClient,
});

// Query
const ethAddr = await linkr.getEthereumAddress("3bf0c63f...");
const pubkey = await linkr.getNostrPubkey("0x...");

// Batch
const results = await linkr.batchGetEthereumAddresses(["pk1", "pk2", "pk3"]);`}
        />
      </div>
    </div>
  );
}
