import type { NostrEvent } from "../types/index.js";
import { NOSTR_LINKR_EVENT_KIND, MAX_FUTURE_TOLERANCE, MAX_PAST_TOLERANCE } from "../constants/index.js";
import { hashEvent } from "./hashEvent.js";

/**
 * Validate a signed Nostr event for submission to the NostrLinkr contract.
 * Performs all client-side checks per NIP-XX:
 * - Event kind is 13372
 * - Tags are empty or contain only a valid "r" CAIP-10 discovery entry
 * - Content is a valid lowercase Ethereum address with 0x prefix (42 chars)
 * - Signature length (128 hex chars = 64 bytes)
 * - Timestamp is within tolerance window
 * - Event id matches the computed hash
 *
 * @param event - The signed event to validate
 * @param signerAddress - The expected Ethereum address of the tx sender (optional)
 */
export function validateLinkEvent(
  event: NostrEvent,
  signerAddress?: string,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Kind check
  if (event.kind !== NOSTR_LINKR_EVENT_KIND) {
    errors.push(`Invalid event kind: expected ${NOSTR_LINKR_EVENT_KIND}, got ${event.kind}`);
  }

  // Tags: allow empty or a single "r" tag with CAIP-10 contract reference
  for (const tag of event.tags) {
    if (tag[0] !== "r") {
      errors.push(`Unknown tag: "${tag[0]}". Only the "r" discovery tag is allowed`);
    }
  }
  const rTag = event.tags.find((t) => t[0] === "r");
  if (rTag && !/^eip155:\d+:0x[0-9a-fA-F]{40}$/.test(rTag[1])) {
    errors.push(`Invalid r tag format: expected "eip155:<chainId>:0x<address>", got "${rTag[1]}"`);
  }

  // Content must be 0x-prefixed lowercase hex address (42 chars)
  if (!/^0x[0-9a-f]{40}$/.test(event.content)) {
    errors.push("Content must be a lowercase Ethereum address with 0x prefix (42 chars)");
  }

  // If signer address provided, verify it matches content
  if (signerAddress) {
    const expected = `0x${signerAddress.toLowerCase().replace(/^0x/, "")}`;
    if (event.content !== expected) {
      errors.push(`Content does not match signer address: expected ${expected}, got ${event.content}`);
    }
  }

  // Signature must be 128 hex chars (64 bytes)
  if (!event.sig || !/^[0-9a-f]{128}$/.test(event.sig)) {
    errors.push("Signature must be 128 hex characters (64 bytes)");
  }

  // Pubkey must be 64 hex chars
  if (!/^[0-9a-f]{64}$/.test(event.pubkey)) {
    errors.push("Pubkey must be 64 hex characters (32 bytes)");
  }

  // Timestamp bounds
  const now = Math.floor(Date.now() / 1000);
  if (event.created_at > now + MAX_FUTURE_TOLERANCE) {
    errors.push(`Timestamp too far in the future (max ${MAX_FUTURE_TOLERANCE}s tolerance)`);
  }
  if (event.created_at < now - MAX_PAST_TOLERANCE) {
    errors.push(`Timestamp too far in the past (max ${MAX_PAST_TOLERANCE}s tolerance)`);
  }

  // Event ID must match computed hash
  const computedId = hashEvent(event);
  if (event.id !== computedId) {
    errors.push(`Event ID mismatch: expected ${computedId}, got ${event.id}`);
  }

  return { valid: errors.length === 0, errors };
}
