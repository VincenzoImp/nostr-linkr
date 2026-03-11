# nostr-linkr

[![npm version](https://img.shields.io/npm/v/nostr-linkr)](https://www.npmjs.com/package/nostr-linkr)
[![CI](https://github.com/VincenzoImp/nostr-linkr/actions/workflows/ci.yml/badge.svg)](https://github.com/VincenzoImp/nostr-linkr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue)](https://www.typescriptlang.org/)

The first **on-chain identity bridge** that cryptographically links Ethereum addresses (ECDSA) with Nostr public keys (Schnorr/BIP-340). Full BIP-340 Schnorr signature verification performed entirely on-chain.

## Deployments

| Chain | Address | Explorer |
|-------|---------|----------|
| Base Sepolia | `0xbC379bEFBAA269AfC2a1891438A7b8737E79A476` | [BaseScan](https://sepolia.basescan.org/address/0xbC379bEFBAA269AfC2a1891438A7b8737E79A476) |

## Packages

| Package | Description | Path |
|---------|-------------|------|
| [`nostr-linkr`](https://www.npmjs.com/package/nostr-linkr) | TypeScript SDK — framework-agnostic, viem-based | `packages/sdk` |
| `@nostr-linkr/contracts` | Solidity smart contract with BIP-340 verification | `packages/contracts` |
| `@nostr-linkr/example` | Next.js example app demonstrating every SDK function | `packages/example` |

## Quick Start

```bash
# Install all dependencies
yarn install

# Build the SDK
yarn workspace nostr-linkr build

# Run all tests (68 tests: 53 SDK + 15 contract)
yarn test
```

### Local Development

```bash
# Terminal 1: Start local blockchain
yarn workspace @nostr-linkr/contracts node

# Terminal 2: Deploy contract
yarn workspace @nostr-linkr/contracts deploy:local

# Terminal 3: Start example app
yarn workspace @nostr-linkr/example dev
```

Open http://localhost:3000 to explore the SDK interactively.

## SDK Usage

```bash
npm install nostr-linkr viem
```

```typescript
import { createNostrLinkrClient, createAndSignLinkEvent } from "nostr-linkr";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { baseSepolia } from "viem/chains";

// Create client
const linkr = createNostrLinkrClient({
  chain: baseSepolia,
  publicClient: createPublicClient({ chain: baseSepolia, transport: http() }),
  walletClient: createWalletClient({ chain: baseSepolia, transport: custom(window.ethereum!) }),
});

// Query
const ethAddr = await linkr.getEthereumAddress("3bf0c63f...");
const pubkey = await linkr.getNostrPubkey("0x...");

// Batch (single multicall RPC)
const results = await linkr.batchGetEthereumAddresses(["pk1", "pk2", "pk3"]);

// Link identities
const signed = await createAndSignLinkEvent(window.nostr!, walletAddress);
const txHash = await linkr.pushLink(signed);

// Unlink
await linkr.pullLink();

// Watch for new links
const unwatch = linkr.watchLinkEvents((log) => {
  console.log(`${log.eventName}: ${log.address} <-> ${log.pubkey}`);
});
```

See the full [SDK documentation](packages/sdk/README.md) for the complete API reference.

## Deploy the Contract

Anyone can deploy NostrLinkr on any EVM chain:

```bash
cd packages/contracts
cp .env.example .env
# Edit .env with your private key

yarn deploy:base-sepolia  # or any supported network
```

See [packages/contracts/README.md](packages/contracts/README.md) for the full deployment guide.

## How It Works

1. A Nostr browser extension signs a **kind:27235** event containing the Ethereum address
2. The signed event is submitted to the **NostrLinkr** smart contract
3. The contract verifies the **SHA-256 event hash** matches NIP-01 serialization
4. **BIP-340 Schnorr signature** is verified on-chain using the MODEXP precompile
5. A **bidirectional mapping** (address ↔ pubkey) is stored on-chain

## Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│                  │     │                  │     │                  │
│   Nostr Client   │────▶│   nostr-linkr    │────▶│   NostrLinkr     │
│   (any client)   │     │   SDK (viem)     │     │   Contract       │
│                  │     │                  │     │   (any EVM)      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
       NIP-07                TypeScript              Solidity
    browser ext.           npm package             BIP-340 on-chain
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Security

For vulnerability reports, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE)
