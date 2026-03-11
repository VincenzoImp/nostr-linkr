import type { Address } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

/**
 * Format an Ethereum address as lowercase with 0x prefix (contract content format).
 */
export function addressToContent(address: string): string {
  const hex = address.toLowerCase().replace(/^0x/, "");
  return `0x${hex}`;
}

/**
 * Check if a content string is a valid Ethereum address (0x prefix + 40 lowercase hex chars).
 */
export function isValidAddressContent(content: string): boolean {
  return /^0x[0-9a-f]{40}$/.test(content);
}

/**
 * Check if an address is the zero address (no link).
 */
export function isZeroAddress(address: Address): boolean {
  return address === ZERO_ADDRESS;
}
