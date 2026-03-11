# Contributing to nostr-linkr

Thanks for your interest in contributing!

## Development Setup

```bash
# Clone and install
git clone https://github.com/VincenzoImp/nostr-linkr.git
cd nostr-linkr
yarn install

# Build the SDK
yarn workspace nostr-linkr build

# Run all tests
yarn test
```

## Monorepo Structure

| Package | Path | Description |
|---------|------|-------------|
| `nostr-linkr` | `packages/sdk` | TypeScript SDK (published on npm) |
| `@nostr-linkr/contracts` | `packages/contracts` | Solidity smart contract |
| `@nostr-linkr/example` | `packages/example` | Next.js example app |

## Running Tests

```bash
# SDK tests (vitest)
yarn test:sdk

# Contract tests (hardhat)
yarn test:contracts

# All tests
yarn test
```

## Local Development with Example App

```bash
# Terminal 1 — local blockchain
yarn workspace @nostr-linkr/contracts node

# Terminal 2 — deploy contract
yarn workspace @nostr-linkr/contracts deploy:local

# Terminal 3 — example app at http://localhost:3000
yarn workspace @nostr-linkr/example dev
```

## Pull Request Process

1. Fork the repo and create a branch from `main`
2. Make your changes
3. Add or update tests as needed
4. Run `yarn test` and `yarn typecheck` to verify
5. Open a PR with a clear description

## Smart Contract Changes

The NostrLinkr contract is already deployed on multiple chains. If you're proposing contract changes:

- Ensure full backward compatibility or document breaking changes
- Add corresponding test cases
- Update the SDK if the ABI changes
- Run gas reports: `REPORT_GAS=true yarn test:contracts`

## Reporting Bugs

Use the [bug report template](https://github.com/VincenzoImp/nostr-linkr/issues/new?template=bug_report.yml).

## Security

For security vulnerabilities, see [SECURITY.md](SECURITY.md).
