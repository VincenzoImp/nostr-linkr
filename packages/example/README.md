# @nostr-linkr/example

Example Next.js app that demonstrates **every function** of the `nostr-linkr` SDK.

## Pages

| Page | SDK Functions Demonstrated |
|------|--------------------------|
| **/** (Home) | Constants, deployments, SDK overview |
| **/lookup** | `getEthereumAddress`, `getNostrPubkey`, `getLink`, `getLinkByPubkey`, `isLinked`, `isLinkedByPubkey` |
| **/batch** | `batchGetEthereumAddresses`, `batchGetNostrPubkeys` |
| **/events** | `getLinkEvents`, `watchLinkEvents` |
| **/verify** | `createLinkEvent`, `hashEvent`, `serializeEvent`, `hashAndPrepare`, `validateLinkEvent`, `getEventHashOnChain`, utility functions |
| **/link** | `createAndSignLinkEvent`, `pushLink`, `pullLink`, `simulatePushLink` |
| **/contract** | `nostrLinkrAbi`, `DEPLOYMENTS`, constants, error classes |

## Setup

```bash
# From monorepo root
yarn install

# Build the SDK first
yarn workspace nostr-linkr build

# Start the contracts (local hardhat node)
yarn workspace @nostr-linkr/contracts node
# In another terminal:
yarn workspace @nostr-linkr/contracts deploy:local

# Start the example app
yarn workspace @nostr-linkr/example dev
```

Open http://localhost:3000

## Requirements

- Local Hardhat node running with NostrLinkr deployed (for contract queries)
- MetaMask or similar wallet (for linking page)
- Alby or nos2x Nostr extension (for signing linking events)

## License

MIT
