<table border="0">
  <tr>
    <td>
      <img width="80" height="80" alt="guardian-ico2" src="https://github.com/user-attachments/assets/81399011-0b1c-47a3-a827-801ce939dc38" />
    </td>
    <td>
      <h1>guardian-js</h1>
    </td>
  </tr>
</table>

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
| `@guardian-js/age-verification` | Standardized age verification flows with pluggable provider adapters | Alpha |
| `@guardian-js/content-classification` | Content risk classification with pluggable backend adapters | Alpha |
| `@guardian-js/core` | Shared types, result schemas, and utilities | Alpha |

---

## Installation

Install only the packages you need. `@guardian-js/core` is a peer dependency of the other packages and must always be installed alongside them.

```bash
# npm
npm install @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification

# pnpm
pnpm add @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification

# yarn
yarn add @guardian-js/core @guardian-js/age-verification @guardian-js/content-classification
```

If you only need one of the features:

```bash
# age verification only
pnpm add @guardian-js/core @guardian-js/age-verification

# content classification only
pnpm add @guardian-js/core @guardian-js/content-classification
```

**Requirements:** Node.js >= 18, TypeScript >= 5.0, Zod >= 3.24 (peer dependency).

---

## Quick start

### Age verification

Age verification works in two steps: initiate a redirect to the identity provider, then handle the callback when the user returns.

```typescript
import { AgeVerificationService } from '@guardian-js/age-verification';
import { MyIdentityProviderAdapter } from './adapters/MyIdentityProviderAdapter';

const service = new AgeVerificationService(new MyIdentityProviderAdapter());

// Step 1 — initiate verification
// Call this when the user tries to access age-restricted content.
const initResult = await service.initiateVerification({
  redirectUri: 'https://myplatform.com/auth/callback',
  locale: 'en-US',
  metadata: { sessionId: 'sess_abc123' } // optional, Record<string, string>
});

if (!initResult.success) {
  // initResult.error.code: 'INVALID_INPUT' | 'PROVIDER_UNAVAILABLE' | ...
  throw new Error(`Verification failed: ${initResult.error.message}`);
}

// Redirect the user to the identity provider
redirect(initResult.data.redirectUrl);
```

```typescript
// Step 2 — handle the callback
// Call this on the route the provider redirects back to.
const callbackResult = await service.handleCallback({
  providerPayload: req.body // the raw payload sent by the provider
});

if (!callbackResult.success) {
  // handle provider errors
  return res.status(502).json({ error: callbackResult.error.code });
}

const { verified, ageGroup, method, providerRef } = callbackResult.data;
// verified: boolean
// ageGroup: 'child' | 'adolescent' | 'adult' | null
// method: 'document' | 'gov_id' | 'biometric' | 'third_party'
// providerRef: string | null — opaque reference from the provider, for audit use

// Your platform decides what to do with the result.
if (!verified || ageGroup !== 'adult') {
  return res.redirect('/access-denied');
}

return res.redirect('/protected-content');
```

---

### Content classification

```typescript
import { ContentClassificationService } from '@guardian-js/content-classification';
import { MyModerationAdapter } from './adapters/MyModerationAdapter';

const service = new ContentClassificationService(new MyModerationAdapter());

// Classify a piece of text
const textResult = await service.classify({
  type: 'text',
  content: 'Content submitted by the user...',
  locale: 'pt-BR' // optional
});

if (textResult.success) {
  const { riskLevel, categories, confidence } = textResult.data;
  // riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'blocked'
  // categories: Array<'adult_content' | 'violence' | 'hate_speech' | 'gambling' | 'drugs' | 'self_harm' | 'safe'>
  // confidence: number (0–1)

  if (riskLevel === 'blocked' || riskLevel === 'high') {
    // your platform decides: reject, flag for review, etc.
  }
}

// Classify a URL
const urlResult = await service.classify({
  type: 'url',
  url: 'https://example.com/some-page'
});
```

---

### Implementing your own adapter

guardian-js ships with stub adapters for testing. In production you connect to real providers by implementing the adapter interfaces from `@guardian-js/core`.

**Age verification adapter:**

```typescript
import type {
  AgeVerificationProvider,
  AgeVerificationRequest,
  AgeVerificationCallbackPayload,
  AgeVerificationResult,
  Result
} from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MyIdentityProviderAdapter implements AgeVerificationProvider {
  public readonly name = 'my-identity-provider';

  public async initiateVerification(
    request: AgeVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    try {
      const url = await myProviderSdk.createSession({
        callbackUrl: request.redirectUri,
        locale: request.locale
      });
      return ok({ redirectUrl: url });
    } catch {
      return err(guardianError('PROVIDER_UNAVAILABLE', 'Failed to create verification session'));
    }
  }

  public async handleCallback(
    payload: AgeVerificationCallbackPayload
  ): Promise<Result<AgeVerificationResult>> {
    try {
      const response = await myProviderSdk.resolveCallback(payload.providerPayload);
      return ok({
        verified: response.verified,
        ageGroup: response.age >= 18 ? 'adult' : response.age >= 12 ? 'adolescent' : 'child',
        method: 'third_party',
        providerRef: response.referenceId ?? null
      });
    } catch {
      return err(guardianError('PROVIDER_REJECTED', 'Callback resolution failed'));
    }
  }
}
```

**Content classification adapter:**

```typescript
import type {
  ContentClassificationProvider,
  ContentClassificationRequest,
  ContentClassificationResult,
  Result
} from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MyModerationAdapter implements ContentClassificationProvider {
  public readonly name = 'my-moderation-api';

  public async classify(
    request: ContentClassificationRequest
  ): Promise<Result<ContentClassificationResult>> {
    try {
      const input = request.type === 'text' ? request.content : request.url;
      const response = await myModerationApi.analyze(input);
      return ok({
        riskLevel: response.riskLevel,
        categories: response.categories,
        confidence: response.confidence,
        providerRef: response.id ?? null
      });
    } catch {
      return err(guardianError('PROVIDER_UNAVAILABLE', 'Moderation API unreachable'));
    }
  }
}
```

---

### Testing with stub adapters

Both packages include configurable stub adapters so you can test your integration logic without calling real provider APIs.

```typescript
import { AgeVerificationService, StubAgeVerificationAdapter } from '@guardian-js/age-verification';
import { ContentClassificationService, StubContentClassificationAdapter } from '@guardian-js/content-classification';

// Stub returns a verified adult by default
const ageService = new AgeVerificationService(new StubAgeVerificationAdapter());

// Override the stub for specific test scenarios
const childService = new AgeVerificationService(
  new StubAgeVerificationAdapter({ ageGroup: 'child', verified: false })
);

// Content classification stub returns 'safe' by default
const classificationService = new ContentClassificationService(
  new StubContentClassificationAdapter()
);

// Override for high-risk scenarios
const highRiskService = new ContentClassificationService(
  new StubContentClassificationAdapter({ riskLevel: 'high', categories: ['adult_content'] })
);
```

---

### Working with the Result type

Every method in guardian-js returns a `Result<T>` — it never throws. The pattern is consistent across all packages.

```typescript
import type { Result } from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

// Narrow using the success flag
const result = await service.initiateVerification({ redirectUri: 'https://...' });

if (result.success) {
  // TypeScript narrows result.data here
  console.log(result.data.redirectUrl);
} else {
  // TypeScript narrows result.error here
  // result.error.code is one of:
  // 'INVALID_INPUT' | 'PROVIDER_UNAVAILABLE' | 'PROVIDER_REJECTED' | 'UNSUPPORTED_METHOD' | 'INTERNAL_ERROR'
  console.error(result.error.code, result.error.message);
}
```

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

- [pt-BR — Documentação em Português](LEIAME.md)
- [Project Scope](SCOPE.md)
- [Contributing](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

---

## License

Apache License 2.0 — see [LICENSE](LICENSE) for details.
