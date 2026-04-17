# Project Scope — guardian-js

This document defines the boundaries of guardian-js. It exists to prevent scope creep, guide contribution decisions, and set clear expectations for integrators.

---

## In scope

### Age verification

Providing a standardized interface for integrating with external age verification providers. This includes:

- A common `AgeVerificationProvider` interface that third-party adapters implement
- Built-in adapters for publicly available identity verification services
- Result types that encode verification outcome, age group classification, and the method used
- Flow utilities that help platforms implement compliant redirect/callback patterns without exposing sensitive data to the library itself
- Age group classification aligned with ECA Digital categories: `child` (under 12), `adolescent` (12–17), `adult` (18+)

### Content classification

Providing a standardized interface for classifying content as appropriate or inappropriate for specific age groups. This includes:

- A common `ContentClassificationProvider` interface that third-party adapters implement
- Built-in adapters for publicly available content moderation services
- Local classification via ONNX Runtime for platforms that cannot use external APIs
- Result types that encode risk level, content categories, and confidence scores
- Classification categories aligned with ECA Digital requirements

### Shared infrastructure

- Zod schemas for all inputs and outputs, enabling runtime validation
- TypeScript types exported for consumer use
- Framework-agnostic core with optional NestJS integration helpers

---

## Out of scope

The following will never be part of guardian-js, regardless of demand:

**Data storage** — the library does not persist any data. It has no database dependency and no concept of a user session or verification history.

**Identity data handling** — sensitive identity data (documents, biometric data, CPF, government IDs) must never pass through guardian-js. Adapters are designed so that data flows directly between the user's client and the identity provider.

**Government reporting** — guardian-js does not implement any interface for reporting to ANPD, law enforcement, or any other authority. Platforms that have reporting obligations must implement those separately.

**Final access control decisions** — the library returns structured results with a recommendation. The decision to grant or deny access is always made by the platform, never by guardian-js.

**Facial recognition and biometric analysis** — image-based age estimation is explicitly excluded. The ANPD guidelines note that biometric methods require robust justification and should only be used when less invasive alternatives are insufficient. This library does not provide that capability.

**Legal compliance certification** — using guardian-js does not certify or guarantee compliance with ECA Digital, LGPD, GDPR, or any other regulation.

---

## Design constraints

These constraints apply to all contributions:

**Stateless** — no module in guardian-js may maintain state between calls. Every function must be a pure transformation of its inputs.

**No implicit logging** — no module may log data that could identify a user. Debug logging, if implemented, must be opt-in and must never include personal data.

**Adapter isolation** — external service calls must always go through the adapter interface. No module may call an external service directly.

**Explicit over implicit** — configuration must be explicit. No environment variable reading, no auto-detection of providers.

---

## Versioning and stability

guardian-js follows Semantic Versioning (semver). Until version 1.0.0, minor version bumps may include breaking changes. All breaking changes will be documented in CHANGELOG.md.

The `@guardian-js/core` package defines the shared interfaces and types. Adapter packages depend on core. Integration packages (e.g., NestJS helpers) depend on core and optionally on specific adapter packages.
