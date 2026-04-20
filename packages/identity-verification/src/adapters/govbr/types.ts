export type GovBrReliabilityLevel = "bronze" | "silver" | "gold";

export type GovBrIdTokenClaims = {
  readonly sub: string;
  readonly name: string;
  readonly email?: string;
  readonly email_verified?: string;
  readonly phone_number?: string;
  readonly phone_number_verified?: string;
  readonly amr: ReadonlyArray<string>;
  readonly auth_time: number;
  readonly iss: string;
  readonly aud: string;
  readonly exp: number;
  readonly iat: number;
  readonly nonce: string;
  readonly reliability_info?: {
    readonly level: GovBrReliabilityLevel;
    readonly reliabilities: ReadonlyArray<{
      readonly id: string;
      readonly updatedAt: string;
    }>;
  };
};

export type GovBrTokenResponse = {
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
  readonly scope: string;
  readonly id_token: string;
};

export type GovBrCallbackPayload = {
  readonly code: string;
  readonly state: string;
};

export type GovBrPkceState = {
  readonly codeVerifier: string;
  readonly state: string;
  readonly nonce: string;
  readonly redirectUri: string;
};
