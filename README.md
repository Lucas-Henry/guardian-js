# guardian-js

> Privacy-first, stateless toolkit for age verification and content classification — built for compliance with Brazil's Digital ECA (Law 15,211/2025) and beyond.

[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![Status](https://img.shields.io/badge/status-pre--alpha-orange.svg)]()
[![Languages](https://img.shields.io/badge/lang-TypeScript-blue.svg)]()

---

## What is guardian-js?

**guardian-js** is an open-source TypeScript toolkit that helps digital platforms implement age verification and content classification in a standardized, privacy-preserving way.

It is **not** a data storage service. It is **not** a government reporting system. It is a composable library that provides the plumbing — your platform owns the decisions and the compliance obligations.

The library was created in direct response to Brazil's **ECA Digital (Lei 15.211/2025)**, the first Latin American law to impose enforceable age assurance requirements on digital platforms, which came into effect on **March 17, 2026**. However, the design is intentionally jurisdiction-agnostic and can be adapted to EU DSA requirements, UK Age Appropriate Design Code, and similar frameworks.

---

## Core principles

**Stateless by design** — guardian-js processes inputs and returns outputs. It never stores personal data, never logs user identifiers, and never communicates with external services on your behalf without explicit configuration.

**You own the compliance** — the library returns structured results. What your platform does with those results — blocking access, triggering a parental consent flow, logging for audit purposes — is entirely your responsibility. guardian-js is a tool, not a compliance service.

**Adapter-based** — every external dependency (identity providers, content moderation APIs, ML runtimes) is behind an adapter interface. You choose your providers. You can swap them without changing your integration code.

**Minimal data surface** — age verification flows are designed so that sensitive identity data travels directly between the user and the identity provider, never passing through guardian-js.

---

## Packages

This repository is a monorepo. Packages are published independently under the `@guardian-js` scope.

| Package | Description | Status |
|---|---|---|
| `@guardian-js/age-verification` | Standardized age verification flows with pluggable provider adapters | Planned |
| `@guardian-js/content-classification` | Content risk classification with pluggable backend adapters | Planned |
| `@guardian-js/core` | Shared types, result schemas, and utilities | Planned |

---

## What guardian-js does NOT do

This is explicit and intentional:

- Does not store any personal data
- Does not store verification results linked to user identifiers
- Does not communicate with government agencies or law enforcement
- Does not make final access control decisions
- Does not replace legal counsel or guarantee regulatory compliance
- Does not perform facial recognition or biometric analysis

---

## Disclaimer

guardian-js is a software library provided as-is under the Apache 2.0 license. It is not a legal compliance service. Using this library does not guarantee that your platform complies with any law or regulation. You are responsible for understanding your legal obligations and implementing appropriate controls. Always consult qualified legal counsel for compliance decisions.

---

## Documentation

- [pt-BR — Documentação em Português](README.pt-BR.md)
- [Project Scope](SCOPE.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
