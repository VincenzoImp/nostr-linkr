# @nostr-linkr/contracts

Smart contract for the **NostrLinkr** identity bridge — on-chain verification that cryptographically links Ethereum addresses (ECDSA) with Nostr public keys (Schnorr/BIP-340).

## What It Does

NostrLinkr creates a **bidirectional, on-chain mapping** between Ethereum addresses and Nostr public keys. The linking process involves full **BIP-340 Schnorr signature verification** performed entirely on-chain, ensuring that only the true owner of a Nostr key can claim a link.

## Contract Features

- **BIP-340 Schnorr Verification**: Full on-chain verification using the MODEXP precompile (0x05)
- **NIP-01 Compliant**: Event serialization matches the Nostr protocol specification exactly
- **Bidirectional Mapping**: Look up Ethereum address by Nostr pubkey, or vice versa
- **Fully Permissionless**: No owner, no pause — once deployed, the contract is autonomous
- **Timestamp Bounds**: 5-minute future tolerance, 1-hour past tolerance
- **Conflict Resolution**: Automatically cleans up old links when re-linking

## Deploy on Any EVM Chain

### Prerequisites

- Node.js >= 18
- Yarn or npm

### Setup

```bash
# Install dependencies
yarn install

# Copy environment variables
cp .env.example .env
# Edit .env with your private key and API keys
```

### Local Development

```bash
# Start a local Hardhat node
yarn node

# Deploy to local node (in another terminal)
yarn deploy:local
```

### Deploy to Testnet/Mainnet

```bash
# Base Sepolia (recommended for testing)
yarn deploy:base-sepolia

# Ethereum Sepolia
yarn deploy:sepolia

# Base Mainnet
yarn deploy:base

# Ethereum Mainnet
yarn deploy:mainnet
```

### Verify on Etherscan

```bash
npx hardhat verify --network baseSepolia <CONTRACT_ADDRESS>
```

## Run Tests

```bash
yarn test
```

Runs 15 tests covering:
- Deployment state
- pushLinkr input validation (sig length, kind, timestamp, tags, content)
- pullLinkr behavior
- verifyNostrEvent hash verification
- getEventHash consistency

## Contract API

### Write Functions

| Function | Description |
|----------|-------------|
| `pushLinkr(id, pubkey, createdAt, kind, tags, content, sig)` | Create identity link |
| `pullLinkr()` | Remove caller's link |

### Read Functions

| Function | Description |
|----------|-------------|
| `addressPubkey(address)` | Get Nostr pubkey for an Ethereum address |
| `pubkeyAddress(bytes32)` | Get Ethereum address for a Nostr pubkey |
| `verifyNostrEvent(...)` | Verify a Nostr event on-chain |
| `getEventHash(...)` | Compute NIP-01 event hash on-chain |

### Events

| Event | Description |
|-------|-------------|
| `LinkrPushed(address, bytes32)` | Emitted when a link is created |
| `LinkrPulled(address, bytes32)` | Emitted when a link is removed |

## Linking Flow

1. User's Nostr extension signs a **kind:27235** event with content = Ethereum address (no `0x`)
2. Signed event submitted to `pushLinkr()` with all NIP-01 parameters
3. Contract computes **SHA-256 hash** of the canonical NIP-01 serialization
4. **BIP-340 Schnorr signature** verified on-chain using secp256k1 curve math
5. Bidirectional mapping `address <-> pubkey` stored on-chain

## Supported Networks

The contract can be deployed on **any EVM-compatible chain** that supports the MODEXP precompile at address `0x05` (all major chains do).

Pre-configured networks:
- Ethereum (mainnet, Sepolia)
- Base (mainnet, Sepolia)
- Arbitrum (mainnet, Sepolia)
- Optimism (mainnet, Sepolia)
- Polygon (mainnet, Amoy)

Add more in `hardhat.config.ts`.

## License

MIT
