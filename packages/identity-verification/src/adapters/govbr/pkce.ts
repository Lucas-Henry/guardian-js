import { createHash, randomBytes } from "crypto";

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function generateCodeVerifier(): string {
  return base64UrlEncode(randomBytes(48));
}

export function generateCodeChallenge(codeVerifier: string): string {
  const hash = createHash("sha256").update(codeVerifier).digest();
  return base64UrlEncode(hash);
}

export function generateNonce(): string {
  return base64UrlEncode(randomBytes(16));
}

export function generateState(): string {
  return base64UrlEncode(randomBytes(16));
}
