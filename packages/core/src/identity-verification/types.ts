import type { Result } from "../shared/result";

export type IdentityReliabilityLevel = "bronze" | "silver" | "gold";

export type IdentityVerificationMethod =
  | "gov_br"
  | "document_ocr"
  | "third_party";

export type IdentityVerificationResult = {
  readonly identityVerified: boolean;
  readonly reliabilityLevel: IdentityReliabilityLevel | null;
  readonly method: IdentityVerificationMethod;
  readonly authMethods: ReadonlyArray<string>;
  readonly authenticatedAt: Date;
  readonly providerRef: string | null;
};

export type IdentityVerificationRequest = {
  readonly redirectUri: string;
  readonly locale?: string;
  readonly metadata?: Record<string, string>;
};

export type IdentityVerificationCallbackPayload = {
  readonly providerPayload: unknown;
};

export interface IdentityVerificationProvider {
  readonly name: string;

  initiateVerification(
    request: IdentityVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>>;

  handleCallback(
    payload: IdentityVerificationCallbackPayload
  ): Promise<Result<IdentityVerificationResult>>;
}
