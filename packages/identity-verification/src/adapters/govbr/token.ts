import type { GovBrTokenResponse } from "./types";

export type ExchangeCodeOptions = {
  readonly tokenEndpoint: string;
  readonly code: string;
  readonly redirectUri: string;
  readonly codeVerifier: string;
  readonly clientId: string;
  readonly clientSecret: string;
};

export async function exchangeCodeForToken(
  options: ExchangeCodeOptions
): Promise<GovBrTokenResponse> {
  const credentials = Buffer.from(
    `${options.clientId}:${options.clientSecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code: options.code,
    redirect_uri: options.redirectUri,
    code_verifier: options.codeVerifier
  });

  const response = await fetch(options.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`
    },
    body: body.toString()
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `gov.br token endpoint returned ${response.status.toString()}: ${text}`
    );
  }

  return response.json() as Promise<GovBrTokenResponse>;
}
