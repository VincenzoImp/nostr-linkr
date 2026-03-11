# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/VincenzoImp/nostr-linkr/releases/tag/v0.1.0
