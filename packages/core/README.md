# @guardian-js/core

Shared types, result schemas, and utilities for the guardian-js toolkit.

This package is the foundation of the `@guardian-js` ecosystem. It exports the `Result<T>` type, error utilities, and all shared interfaces used by the other packages.

## Installation

```bash
pnpm add @guardian-js/core zod
```

## Usage

```typescript
import { ok, err, guardianError } from '@guardian-js/core';
import type { Result, AgeVerificationProvider, ContentClassificationProvider } from '@guardian-js/core';
```

## Part of guardian-js

This package is part of the [guardian-js](https://github.com/Lucas-Henry/guardian-js) monorepo — a privacy-first, stateless toolkit for age verification and content classification, built for compliance with Brazil's ECA Digital (Law 15,211/2025).

## License

Apache 2.0
