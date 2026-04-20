import { createRemoteJWKSet, jwtVerify } from "jose";
import type { GovBrIdTokenClaims } from "./types";

const JWK_CACHE = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwkSet(jwkUri: string): ReturnType<typeof createRemoteJWKSet> {
  const cached = JWK_CACHE.get(jwkUri);
  if (cached !== undefined) {
    return cached;
  }
  const jwkSet = createRemoteJWKSet(new URL(jwkUri));
  JWK_CACHE.set(jwkUri, jwkSet);
  return jwkSet;
}

export type VerifyIdTokenOptions = {
  readonly idToken: string;
  readonly expectedClientId: string;
  readonly expectedIssuer: string;
  readonly expectedNonce: string;
  readonly jwkUri: string;
};

export async function verifyIdToken(
  options: VerifyIdTokenOptions
): Promise<GovBrIdTokenClaims> {
  const jwks = getJwkSet(options.jwkUri);

  const { payload } = await jwtVerify(options.idToken, jwks, {
    issuer: options.expectedIssuer,
    audience: options.expectedClientId,
    algorithms: ["RS256"]
  });

  const claims = payload as unknown as GovBrIdTokenClaims;

  if (claims.nonce !== options.expectedNonce) {
    throw new Error("nonce mismatch");
  }

  return claims;
}
