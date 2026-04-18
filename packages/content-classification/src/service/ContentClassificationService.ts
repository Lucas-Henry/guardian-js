import {
  err,
  guardianError,
  type ContentClassificationProvider,
  type ContentClassificationRequest,
  type ContentClassificationResult,
  type Result
} from "@guardian-js/core";

import { ContentClassificationRequestSchema } from "./schemas";

export class ContentClassificationService {
  private readonly provider: ContentClassificationProvider;

  public constructor(provider: ContentClassificationProvider) {
    this.provider = provider;
  }

  public async classify(
    request: ContentClassificationRequest
  ): Promise<Result<ContentClassificationResult>> {
    const parsed = ContentClassificationRequestSchema.safeParse(request);

    if (!parsed.success) {
      return err(
        guardianError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "invalid request")
      );
    }

    return this.provider.classify(parsed.data);
  }

  public get providerName(): string {
    return this.provider.name;
  }
}

export function createContentClassificationService(
  provider: ContentClassificationProvider
): ContentClassificationService {
  return new ContentClassificationService(provider);
}
