# @nostr-linkr/contracts

Smart contract for the **NostrLinkr** identity bridge — on-chain verification that cryptographically links Ethereum addresses (ECDSA) with Nostr public keys (Schnorr/BIP-340).

## What It Does

NostrLinkr creates a **bidirectional, on-chain mapping** between Ethereum addresses and Nostr public keys. The linking process involves full **BIP-340 Schnorr signature verification** performed entirely on-chain, ensuring that only the true owner of a Nostr key can claim a link.

## Contract Features

- **BIP-340 Schnorr Verification**: Full on-chain verification using the MODEXP precompile (0x05)
- **NIP-01 Compliant**: Event hash computed internally from canonical serialization
- **Bidirectional Mapping**: Look up Ethereum address by Nostr pubkey, or vice versa
- **Fully Permissionless**: No owner, no pause — once deployed, the contract is autonomous
- **Timestamp Bounds**: 10-minute future tolerance, 24-hour past tolerance
- **Conflict Resolution**: Automatically cleans up old links when re-linking
- **Generic Cryptographic Primitive**: Does not validate event kind or tags — semantic rules live in the NIP

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
- pushLinkr input validation (sig length, timestamp bounds)
- pullLinkr behavior
- getEventHash consistency and public visibility

## Contract API

### Write Functions

| Function | Description |
|----------|-------------|
| `pushLinkr(pubkey, createdAt, kind, tags, sig)` | Create identity link (content derived from `msg.sender`) |
| `pullLinkr()` | Remove caller's link |

### Read Functions

| Function | Description |
|----------|-------------|
| `addressPubkey(address)` | Get Nostr pubkey for an Ethereum address |
| `pubkeyAddress(bytes32)` | Get Ethereum address for a Nostr pubkey |
| `getEventHash(pubkey, createdAt, kind, tags, content)` | Compute NIP-01 event hash on-chain (`public pure`) |

### Events

| Event | Description |
|-------|-------------|
| `LinkrPushed(address, bytes32)` | Emitted when a link is created |
| `LinkrPulled(address, bytes32)` | Emitted when a link is removed |

## Linking Flow

1. User's Nostr extension signs a **kind:13372** event with content = `0x`-prefixed lowercase Ethereum address
2. Ethereum wallet calls `pushLinkr(pubkey, createdAt, kind, tags, sig)`
3. Contract derives `content` from `msg.sender` and computes the **NIP-01 SHA-256 hash** internally
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
