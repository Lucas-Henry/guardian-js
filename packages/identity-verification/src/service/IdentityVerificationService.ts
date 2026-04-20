import {
  err,
  guardianError,
  type IdentityVerificationProvider,
  type IdentityVerificationRequest,
  type IdentityVerificationCallbackPayload,
  type IdentityVerificationResult,
  type Result
} from "@guardian-js/core";

import {
  IdentityVerificationRequestSchema,
  IdentityVerificationCallbackPayloadSchema
} from "./schemas";

export class IdentityVerificationService {
  private readonly provider: IdentityVerificationProvider;

  public constructor(provider: IdentityVerificationProvider) {
    this.provider = provider;
  }

  public async initiateVerification(
    request: IdentityVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    const parsed = IdentityVerificationRequestSchema.safeParse(request);

    if (!parsed.success) {
      return err(
        guardianError(
          "INVALID_INPUT",
          parsed.error.issues[0]?.message ?? "invalid request"
        )
      );
    }

    return this.provider.initiateVerification(parsed.data);
  }

  public async handleCallback(
    payload: IdentityVerificationCallbackPayload
  ): Promise<Result<IdentityVerificationResult>> {
    const parsed = IdentityVerificationCallbackPayloadSchema.safeParse(payload);

    if (!parsed.success) {
      return err(
        guardianError(
          "INVALID_INPUT",
          parsed.error.issues[0]?.message ?? "invalid callback payload"
        )
      );
    }

    return this.provider.handleCallback(parsed.data);
  }

  public get providerName(): string {
    return this.provider.name;
  }
}

export function createIdentityVerificationService(
  provider: IdentityVerificationProvider
): IdentityVerificationService {
  return new IdentityVerificationService(provider);
}
