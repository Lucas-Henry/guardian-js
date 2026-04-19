# @guardian-js/age-verification

Standardized age verification flows with pluggable provider adapters — part of the [guardian-js](https://github.com/Lucas-Henry/guardian-js) toolkit.

## Installation

```bash
pnpm add @guardian-js/core @guardian-js/age-verification zod
```

## Usage

```typescript
import { AgeVerificationService } from '@guardian-js/age-verification';
import { MyProviderAdapter } from './adapters/MyProviderAdapter';

const service = new AgeVerificationService(new MyProviderAdapter());

// Step 1 — initiate verification
const initResult = await service.initiateVerification({
  redirectUri: 'https://myplatform.com/auth/callback',
  locale: 'pt-BR',
  metadata: { sessionId: 'sess_abc123' }
});

if (!initResult.success) {
  throw new Error(initResult.error.message);
}

redirect(initResult.data.redirectUrl);

// Step 2 — handle the callback
const callbackResult = await service.handleCallback({
  providerPayload: req.body
});

if (callbackResult.success) {
  const { verified, ageGroup, method, providerRef } = callbackResult.data;
  // ageGroup: 'child' | 'adolescent' | 'adult' | null
}
```

## Testing with the stub adapter

```typescript
import { AgeVerificationService, StubAgeVerificationAdapter } from '@guardian-js/age-verification';

// Returns a verified adult by default
const service = new AgeVerificationService(new StubAgeVerificationAdapter());

// Override for specific scenarios
const childService = new AgeVerificationService(
  new StubAgeVerificationAdapter({ ageGroup: 'child', verified: false })
);
```

## Implementing your own adapter

```typescript
import type { AgeVerificationProvider, AgeVerificationRequest, AgeVerificationCallbackPayload, AgeVerificationResult, Result } from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MyProviderAdapter implements AgeVerificationProvider {
  public readonly name = 'my-provider';

  public async initiateVerification(request: AgeVerificationRequest): Promise<Result<{ readonly redirectUrl: string }>> {
    try {
      const url = await myProviderSdk.createSession({ callbackUrl: request.redirectUri });
      return ok({ redirectUrl: url });
    } catch {
      return err(guardianError('PROVIDER_UNAVAILABLE', 'Failed to create session'));
    }
  }

  public async handleCallback(payload: AgeVerificationCallbackPayload): Promise<Result<AgeVerificationResult>> {
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

## License

Apache 2.0
