import type { UnsignedNostrEvent } from "../types/index.js";
import { NOSTR_LINKR_EVENT_KIND } from "../constants/index.js";

/**
 * Create an unsigned Nostr linking event for the given Ethereum address and pubkey.
 *
 * @param ethereumAddress - The Ethereum address to embed (with or without 0x prefix)
 * @param nostrPubkey - The signer's Nostr pubkey (64-char hex)
 * @param timestamp - Optional Unix timestamp in seconds; defaults to current time
 * @param options - Optional discovery tag: CAIP-10 contract reference (eip155:<chainId>:<contractAddress>)
 */
export function createLinkEvent(
  ethereumAddress: string,
  nostrPubkey: string,
  timestamp?: number,
  options?: { contractRef?: string },
): UnsignedNostrEvent {
  const content = `0x${ethereumAddress.toLowerCase().replace(/^0x/, "")}`;

  const tags: string[][] = [];
  if (options?.contractRef) tags.push(["r", options.contractRef]);

  return {
    pubkey: nostrPubkey,
    created_at: timestamp ?? Math.floor(Date.now() / 1000),
    kind: NOSTR_LINKR_EVENT_KIND,
    tags,
    content,
  };
}
