import type { Address } from "viem";
import type { DeploymentInfo } from "../types/index.js";

/** Known NostrLinkr contract deployments indexed by chainId. */
export const DEPLOYMENTS: Record<number, DeploymentInfo> = {
  31337: {
    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3" as Address,
    chainId: 31337,
    chainName: "Hardhat",
    testnet: true,
  },
  84532: {
    address: "0xf311342bce77086D7C28e5Ba4544c02c5bbE3443" as Address,
    chainId: 84532,
    chainName: "Base Sepolia",
    testnet: true,
    blockExplorerUrl: "https://sepolia.basescan.org",
  },
};

/** Get deployment info for a chain, or undefined if not deployed. */
export function getDeployment(chainId: number): DeploymentInfo | undefined {
  return DEPLOYMENTS[chainId];
}

/** Get all supported chain IDs. */
export function getSupportedChainIds(): number[] {
  return Object.keys(DEPLOYMENTS).map(Number);
}
