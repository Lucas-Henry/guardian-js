import {
  ok,
  err,
  guardianError,
  type IdentityVerificationProvider,
  type IdentityVerificationRequest,
  type IdentityVerificationCallbackPayload,
  type IdentityVerificationResult,
  type IdentityReliabilityLevel,
  type Result
} from "@guardian-js/core";

import {
  generateCodeVerifier,
  generateCodeChallenge,
  generateNonce,
  generateState
} from "./govbr/pkce";
import { exchangeCodeForToken } from "./govbr/token";
import { verifyIdToken } from "./govbr/jwt";
import type { GovBrCallbackPayload, GovBrPkceState } from "./govbr/types";

export type GovBrEnvironment = "staging" | "production";

export type GovBrAdapterConfig = {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly environment?: GovBrEnvironment;
  readonly onStateStore: (key: string, value: GovBrPkceState) => Promise<void>;
  readonly onStateRetrieve: (key: string) => Promise<GovBrPkceState | null>;
};

const ENDPOINTS = {
  staging: {
    authorize: "https://sso.staging.acesso.gov.br/authorize",
    token: "https://sso.staging.acesso.gov.br/token",
    jwk: "https://sso.staging.acesso.gov.br/jwk",
    issuer: "https://sso.staging.acesso.gov.br/"
  },
  production: {
    authorize: "https://sso.acesso.gov.br/authorize",
    token: "https://sso.acesso.gov.br/token",
    jwk: "https://sso.acesso.gov.br/jwk",
    issuer: "https://sso.acesso.gov.br/"
  }
} as const;

const REQUIRED_SCOPES =
  "openid+email+profile+govbr_confiabilidades+govbr_confiabilidades_idtoken";

const RELIABILITY_LEVEL_MAP: Record<string, IdentityReliabilityLevel> = {
  bronze: "bronze",
  silver: "silver",
  gold: "gold"
};

export class GovBrIdentityVerificationAdapter
  implements IdentityVerificationProvider {
  public readonly name = "gov-br";

  private readonly config: Required<GovBrAdapterConfig>;
  private readonly endpoints: (typeof ENDPOINTS)[GovBrEnvironment];

  public constructor(config: GovBrAdapterConfig) {
    this.config = {
      environment: "staging",
      ...config
    };
    this.endpoints = ENDPOINTS[this.config.environment];
  }

  public async initiateVerification(
    request: IdentityVerificationRequest
  ): Promise<Result<{ readonly redirectUrl: string }>> {
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = generateCodeChallenge(codeVerifier);
    const nonce = generateNonce();
    const state = generateState();

    const pkceState: GovBrPkceState = {
      codeVerifier,
      state,
      nonce,
      redirectUri: request.redirectUri
    };

    try {
      await this.config.onStateStore(state, pkceState);
    } catch {
      return err(
        guardianError("INTERNAL_ERROR", "failed to persist PKCE state")
      );
    }

    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.config.clientId,
      scope: REQUIRED_SCOPES,
      redirect_uri: request.redirectUri,
      nonce,
      state,
      code_challenge: codeChallenge,
      code_challenge_method: "S256"
    });

    if (request.locale !== undefined) {
      params.set("ui_locales", request.locale);
    }

    const redirectUrl = `${this.endpoints.authorize}?${params.toString()}`;

    return ok({ redirectUrl });
  }

  public async handleCallback(
    payload: IdentityVerificationCallbackPayload
  ): Promise<Result<IdentityVerificationResult>> {
    const raw = payload.providerPayload as GovBrCallbackPayload;

    if (
      typeof raw.code !== "string" ||
      typeof raw.state !== "string" ||
      raw.code.length === 0 ||
      raw.state.length === 0
    ) {
      return err(
        guardianError(
          "INVALID_INPUT",
          "providerPayload must contain code and state"
        )
      );
    }

    let pkceState: GovBrPkceState | null;

    try {
      pkceState = await this.config.onStateRetrieve(raw.state);
    } catch {
      return err(
        guardianError("INTERNAL_ERROR", "failed to retrieve PKCE state")
      );
    }

    if (pkceState === null) {
      return err(
        guardianError(
          "PROVIDER_REJECTED",
          "unknown or expired state parameter"
        )
      );
    }

    if (pkceState.state !== raw.state) {
      return err(guardianError("PROVIDER_REJECTED", "state mismatch"));
    }

    let tokenResponse: Awaited<ReturnType<typeof exchangeCodeForToken>>;

    try {
      tokenResponse = await exchangeCodeForToken({
        tokenEndpoint: this.endpoints.token,
        code: raw.code,
        redirectUri: pkceState.redirectUri,
        codeVerifier: pkceState.codeVerifier,
        clientId: this.config.clientId,
        clientSecret: this.config.clientSecret
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "token exchange failed";
      return err(guardianError("PROVIDER_REJECTED", message));
    }

    let claims: Awaited<ReturnType<typeof verifyIdToken>>;

    try {
      claims = await verifyIdToken({
        idToken: tokenResponse.id_token,
        expectedClientId: this.config.clientId,
        expectedIssuer: this.endpoints.issuer,
        expectedNonce: pkceState.nonce,
        jwkUri: this.endpoints.jwk
      });
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "id_token verification failed";
      return err(guardianError("PROVIDER_REJECTED", message));
    }

    const rawLevel = claims.reliability_info?.level;
    const reliabilityLevel: IdentityReliabilityLevel | null =
      rawLevel !== undefined
        ? (RELIABILITY_LEVEL_MAP[rawLevel] ?? null)
        : null;

    return ok({
      identityVerified: true,
      reliabilityLevel,
      method: "gov_br" as const,
      authMethods: [...claims.amr],
      authenticatedAt: new Date(claims.auth_time * 1000),
      providerRef: null
    });
  }
}
