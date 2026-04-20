import {
  ok,
  type IdentityVerificationProvider,
  type IdentityVerificationRequest,
  type IdentityVerificationCallbackPayload,
  type IdentityVerificationResult,
  type IdentityReliabilityLevel,
  type Result
} from "@guardian-js/core";

type StubConfig = {
  readonly identityVerified?: boolean;
  readonly reliabilityLevel?: IdentityReliabilityLevel;
  readonly authMethods?: ReadonlyArray<string>;
};

export class StubIdentityVerificationAdapter
  implements IdentityVerificationProvider {
  public readonly name = "stub";

  private readonly config: Required<StubConfig>;

  public constructor(config: StubConfig = {}) {
    this.config = {
      identityVerified: config.identityVerified ?? true,
      reliabilityLevel: config.reliabilityLevel ?? "gold",
      authMethods: config.authMethods ?? ["passwd"]
    };
  }

  public async initiateVerification(
    request: IdentityVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    return Promise.resolve(
      ok({ redirectUrl: `${request.redirectUri}?stub=1` })
    );
  }

  public async handleCallback(
    _payload: IdentityVerificationCallbackPayload
  ): Promise<Result<IdentityVerificationResult>> {
    return Promise.resolve(
      ok({
        identityVerified: this.config.identityVerified,
        reliabilityLevel: this.config.reliabilityLevel,
        method: "third_party" as const,
        authMethods: this.config.authMethods,
        authenticatedAt: new Date(),
        providerRef: "stub-ref-001"
      })
    );
  }
}
