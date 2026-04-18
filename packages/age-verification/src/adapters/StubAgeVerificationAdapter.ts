import {
  ok,
  type AgeVerificationProvider,
  type AgeVerificationRequest,
  type AgeVerificationCallbackPayload,
  type AgeVerificationResult,
  type Result
} from "@guardian-js/core";

type StubConfig = {
  readonly ageGroup?: AgeVerificationResult["ageGroup"];
  readonly verified?: boolean;
};

export class StubAgeVerificationAdapter implements AgeVerificationProvider {
  public readonly name = "stub";

  private readonly config: Required<StubConfig>;

  public constructor(config: StubConfig = {}) {
    this.config = {
      ageGroup: config.ageGroup ?? "adult",
      verified: config.verified ?? true
    };
  }

  public async initiateVerification(
    request: AgeVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    return Promise.resolve(
      ok({ redirectUrl: `${request.redirectUri}?stub=1` })
    );
  }

  public async handleCallback(
    _payload: AgeVerificationCallbackPayload
  ): Promise<Result<AgeVerificationResult>> {
    return Promise.resolve(
      ok({
        verified: this.config.verified,
        ageGroup: this.config.ageGroup,
        method: "third_party" as const,
        providerRef: "stub-ref-001"
      })
    );
  }
}
