import { createPublicClient, http, type Chain } from "viem";
import { baseSepolia } from "viem/chains";
import { createNostrLinkrClient } from "nostr-linkr";

/**
 * Default chain for the example app.
 * Change this to target a different network.
 */
export const targetChain: Chain = baseSepolia;

/**
 * Public client for read operations.
 */
export const publicClient = createPublicClient({
  chain: targetChain,
  transport: http(),
});

/**
 * NostrLinkr client instance for the example app.
 * Uses the known deployment for the target chain.
 */
export const linkrClient = createNostrLinkrClient({
  chain: targetChain,
  publicClient,
});
