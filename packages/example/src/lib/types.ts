import type { NostrSigner } from "nostr-linkr";
import type { EIP1193Provider } from "viem";

/**
 * Extend the global Window interface to include the NIP-07 signer and EIP-1193 provider.
 */
declare global {
  interface Window {
    nostr?: NostrSigner;
    ethereum?: EIP1193Provider;
  }
}
