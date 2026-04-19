<table border="0">
  <tr>
    <td>
      <img width="80" height="80" alt="guardian-js" src="https://github.com/user-attachments/assets/81399011-0b1c-47a3-a827-801ce939dc38" />
    </td>
    <td>
      <h1>@guardian-js/content-classification</h1>
    </td>
  </tr>
</table>

Content risk classification with pluggable backend adapters — part of the [guardian-js](https://github.com/Lucas-Henry/guardian-js) toolkit.

## Installation

```bash
pnpm add @guardian-js/core @guardian-js/content-classification zod
```

## Usage

```typescript
import { ContentClassificationService } from '@guardian-js/content-classification';
import { MyModerationAdapter } from './adapters/MyModerationAdapter';

const service = new ContentClassificationService(new MyModerationAdapter());

// Classify text
const textResult = await service.classify({
  type: 'text',
  content: 'Content submitted by the user...',
  locale: 'pt-BR'
});

// Classify a URL
const urlResult = await service.classify({
  type: 'url',
  url: 'https://example.com/some-page'
});

if (textResult.success) {
  const { riskLevel, categories, confidence } = textResult.data;
  // riskLevel: 'safe' | 'low' | 'medium' | 'high' | 'blocked'
  // categories: Array<'adult_content' | 'violence' | 'hate_speech' | 'gambling' | 'drugs' | 'self_harm' | 'safe'>
  // confidence: number (0–1)
}
```

## Testing with the stub adapter

```typescript
import { ContentClassificationService, StubContentClassificationAdapter } from '@guardian-js/content-classification';

// Returns 'safe' by default
const service = new ContentClassificationService(new StubContentClassificationAdapter());

// Override for high-risk scenarios
const highRiskService = new ContentClassificationService(
  new StubContentClassificationAdapter({ riskLevel: 'high', categories: ['adult_content'] })
);
```

## Implementing your own adapter

```typescript
import type { ContentClassificationProvider, ContentClassificationRequest, ContentClassificationResult, Result } from '@guardian-js/core';
import { ok, err, guardianError } from '@guardian-js/core';

export class MyModerationAdapter implements ContentClassificationProvider {
  public readonly name = 'my-moderation-api';

  public async classify(request: ContentClassificationRequest): Promise<Result<ContentClassificationResult>> {
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

## License

Apache 2.0
