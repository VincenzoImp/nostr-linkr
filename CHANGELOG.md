# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2026-03-11

### Changed

- **Breaking:** `pushLinkr` contract interface simplified — removed `id` (bytes32) and `content` (string) parameters; both are now derived internally from `msg.sender`
- **Breaking:** Event content format changed from bare hex to `0x`-prefixed lowercase address (e.g. `0xf39fd6...` instead of `f39fd6...`)
- **Breaking:** Event kind changed from `27235` to `13372` (replaceable event range, avoids conflict with NIP-98)
- **Breaking:** `["chain", "eip155:..."]` and `["contract", "0x..."]` tags replaced by a single `["r", "eip155:<chainId>:<contractAddress>"]` tag using CAIP-10 format (single-character key for relay indexing)
- Timestamp tolerances updated: future tolerance 300 s → 600 s, past tolerance 3600 s → 86400 s
- `getEventHash` changed from `external pure` to `public pure` in the contract
- `DeploymentInfo` now includes a required `testnet: boolean` field for programmatic testnet detection

### Added

- `NIP-XX.md` — draft NIP for on-chain EVM identity linking (kind 13372)
- Optional `["r", "eip155:<chainId>:<contractAddress>"]` discovery tag in link events for relay indexability
- `testnet: true` flag on all known deployments in `DEPLOYMENTS` constant

### Fixed

- Contract no longer validates event kind or tags, making it a generic cryptographic primitive; semantic validation stays in the SDK and NIP

### Deployment

- New Base Sepolia deployment: `0xf311342bce77086D7C28e5Ba4544c02c5bbE3443` (replaces `0xbC379bEFBAA269AfC2a1891438A7b8737E79A476`)

## [0.1.0] - 2026-03-11

### Added

- `NostrLinkr` smart contract with full on-chain BIP-340 Schnorr signature verification
- `createNostrLinkrClient()` factory with read/write operations
- Nostr event creation, hashing, validation, and signing (`nostr-linkr/event`)
- Batch queries via viem multicall (`batchGetEthereumAddresses`, `batchGetNostrPubkeys`)
- Real-time event watching (`watchLinkEvents`)
- Sub-path exports: `nostr-linkr/abi`, `nostr-linkr/event`, `nostr-linkr/constants`, `nostr-linkr/utils`
- Dual ESM/CJS builds with full TypeScript declarations
- Base Sepolia deployment (`0xbC379bEFBAA269AfC2a1891438A7b8737E79A476`)
- Next.js example app demonstrating all SDK functions
- 68 tests (53 SDK + 15 contract)

[0.2.0]: https://github.com/VincenzoImp/nostr-linkr/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/VincenzoImp/nostr-linkr/releases/tag/v0.1.0
