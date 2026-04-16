# Contributing to guardian-js

Thank you for your interest in contributing. This document explains how to participate in the project.

---

## Language policy

Issues, pull requests, and discussions are accepted in **English or Brazilian Portuguese**. Both are first-class languages in this project. Documentation source is in English; the pt-BR translation is maintained alongside it.

---

## Before you contribute

Read [SCOPE.md](SCOPE.md) carefully. Contributions that fall outside the defined scope will not be merged, regardless of quality. If you are unsure whether your idea fits the scope, open a Discussion first.

---

## How to contribute

### Reporting bugs

Open an issue using the bug report template. Include the package name and version, a minimal reproduction case, and the observed versus expected behavior.

### Proposing features

Open a Discussion under the Ideas category before opening a pull request for new functionality. This avoids wasted effort on proposals that conflict with the project scope or roadmap.

### Submitting pull requests

1. Fork the repository and create a branch from `main`.
2. Follow the code style enforced by the project's ESLint and Prettier configuration.
3. Write or update tests for all changed behavior.
4. Update documentation if your change affects the public API.
5. Keep pull requests focused — one concern per PR.
6. Fill out the pull request template completely.

---

## Code standards

**TypeScript** — strict mode is enabled. No use of `any` without explicit justification in a comment.

**Comments** — only when strictly necessary. Comments explain why, not what. All comments in English.

**Tests** — all public API surface must have unit tests. Adapters must have integration tests with mocked external services.

**No side effects** — functions must not produce side effects outside their return value. No global state mutations, no implicit I/O.

---

## Security

If you discover a security vulnerability, do not open a public issue. Follow the process described in [SECURITY.md](SECURITY.md).

---

## Code of Conduct

All contributors are expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
