# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in the SDK or smart contract, **please do not open a public issue**.

Instead, report it privately via [GitHub Security Advisories](https://github.com/VincenzoImp/nostr-linkr/security/advisories/new).

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

You will receive an acknowledgment within 48 hours.

## Scope

| Component | Severity | Notes |
|-----------|----------|-------|
| `NostrLinkr.sol` | Critical | On-chain funds and identity mappings |
| `nostr-linkr` SDK | High | Client-side event construction and validation |
| Example app | Low | Demonstration only, not production |

## Smart Contract Audits

The NostrLinkr contract has not yet been formally audited. Use at your own risk on mainnet deployments.

## Supported Versions

| Version | Supported |
|---------|-----------|
| 0.1.x | Yes |
