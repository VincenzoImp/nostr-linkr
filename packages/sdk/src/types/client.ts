import type { Address, Chain, PublicClient, WalletClient, Transport } from "viem";

/** Configuration for creating a NostrLinkrClient. */
export interface NostrLinkrClientConfig {
  /** The chain to connect to. */
  chain: Chain;
  /** Contract address override (uses known deployment if omitted). */
  contractAddress?: Address;
  /** A viem PublicClient for reads. */
  publicClient: PublicClient<Transport, Chain>;
  /** An optional viem WalletClient for writes. */
  walletClient?: WalletClient<Transport, Chain>;
}

/** Deployment record for a known chain. */
export interface DeploymentInfo {
  address: Address;
  chainId: number;
  chainName: string;
  /** True if this deployment is on a testnet. Do not use for production. */
  testnet: boolean;
  blockExplorerUrl?: string;
  deployedAtBlock?: bigint;
}
