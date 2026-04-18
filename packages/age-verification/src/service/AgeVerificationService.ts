import {
  err,
  guardianError,
  type AgeVerificationProvider,
  type AgeVerificationRequest,
  type AgeVerificationCallbackPayload,
  type AgeVerificationResult,
  type Result
} from "@guardian-js/core";

import {
  AgeVerificationRequestSchema,
  AgeVerificationCallbackPayloadSchema
} from "./schemas";

export class AgeVerificationService {
  private readonly provider: AgeVerificationProvider;

  public constructor(provider: AgeVerificationProvider) {
    this.provider = provider;
  }

  public async initiateVerification(
    request: AgeVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    const parsed = AgeVerificationRequestSchema.safeParse(request);

    if (!parsed.success) {
      return err(
        guardianError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "invalid request")
      );
    }

    return this.provider.initiateVerification(parsed.data);
  }

  public async handleCallback(
    payload: AgeVerificationCallbackPayload
  ): Promise<Result<AgeVerificationResult>> {
    const parsed = AgeVerificationCallbackPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return err(
        guardianError("INVALID_INPUT", parsed.error.issues[0]?.message ?? "invalid callback payload")
      );
    }

    return this.provider.handleCallback(parsed.data);
  }

  public get providerName(): string {
    return this.provider.name;
  }
}

export function createAgeVerificationService(
  provider: AgeVerificationProvider
): AgeVerificationService {
  return new AgeVerificationService(provider);
}
