import type { Result } from "../shared/result";

export type AgeGroup = "child" | "adolescent" | "adult";

export type AgeVerificationMethod =
  | "document"
  | "gov_id"
  | "biometric"
  | "third_party";

export type AgeVerificationResult = {
  readonly verified: boolean;
  readonly ageGroup: AgeGroup | null;
  readonly method: AgeVerificationMethod;
  readonly providerRef: string | null;
};

export type AgeVerificationRequest = {
  readonly redirectUri: string;
  readonly locale?: string;
  readonly metadata?: Record<string, string>;
};

export type AgeVerificationCallbackPayload = {
  readonly providerPayload: unknown;
};

export interface AgeVerificationProvider {
  readonly name: string;

  initiateVerification(
    request: AgeVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>>;

  handleCallback(
    payload: AgeVerificationCallbackPayload
  ): Promise<Result<AgeVerificationResult>>;
}
