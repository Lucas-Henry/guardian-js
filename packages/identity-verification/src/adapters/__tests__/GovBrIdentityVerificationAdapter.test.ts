import { GovBrIdentityVerificationAdapter } from "../GovBrIdentityVerificationAdapter";
import type { GovBrPkceState } from "../govbr/types";

jest.mock("../govbr/token", () => ({
  exchangeCodeForToken: jest.fn()
}));

jest.mock("../govbr/jwt", () => ({
  verifyIdToken: jest.fn()
}));

import { exchangeCodeForToken } from "../govbr/token";
import { verifyIdToken } from "../govbr/jwt";

const mockExchange = exchangeCodeForToken as jest.MockedFunction<
  typeof exchangeCodeForToken
>;
const mockVerify = verifyIdToken as jest.MockedFunction<typeof verifyIdToken>;

function makeStore(): {
  store: Map<string, GovBrPkceState>;
  onStateStore: (k: string, v: GovBrPkceState) => Promise<void>;
  onStateRetrieve: (k: string) => Promise<GovBrPkceState | null>;
} {
  const store = new Map<string, GovBrPkceState>();
  return {
    store,
    onStateStore: async (k, v) => { store.set(k, v); },
    onStateRetrieve: async (k) => store.get(k) ?? null
  };
}

function makeAdapter(overrides: Partial<ConstructorParameters<typeof GovBrIdentityVerificationAdapter>[0]> = {}): {
  adapter: GovBrIdentityVerificationAdapter;
  store: Map<string, GovBrPkceState>;
  onStateRetrieve: (k: string) => Promise<GovBrPkceState | null>;
} {
  const { store, onStateStore, onStateRetrieve } = makeStore();
  const adapter = new GovBrIdentityVerificationAdapter({
    clientId: "test-client",
    clientSecret: "test-secret",
    environment: "staging",
    onStateStore,
    onStateRetrieve,
    ...overrides
  });
  return { adapter, store, onStateRetrieve };
}

describe("GovBrIdentityVerificationAdapter", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("initiateVerification", () => {
    it("returns a staging authorize URL with required PKCE params", async () => {
      const { adapter } = makeAdapter();

      const result = await adapter.initiateVerification({
        redirectUri: "https://example.com/callback"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const url = new URL(result.data.redirectUrl);
        expect(url.hostname).toBe("sso.staging.acesso.gov.br");
        expect(url.searchParams.get("response_type")).toBe("code");
        expect(url.searchParams.get("client_id")).toBe("test-client");
        expect(url.searchParams.get("code_challenge_method")).toBe("S256");
        expect(url.searchParams.get("code_challenge")).toBeTruthy();
        expect(url.searchParams.get("nonce")).toBeTruthy();
        expect(url.searchParams.get("state")).toBeTruthy();
        expect(url.searchParams.get("redirect_uri")).toBe(
          "https://example.com/callback"
        );
      }
    });

    it("persists PKCE state keyed by state param", async () => {
      const { adapter, store } = makeAdapter();

      const result = await adapter.initiateVerification({
        redirectUri: "https://example.com/callback"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const url = new URL(result.data.redirectUrl);
        const state = url.searchParams.get("state") ?? "";
        expect(store.has(state)).toBe(true);
        const pkce = store.get(state);
        expect(pkce?.codeVerifier).toBeTruthy();
        expect(pkce?.nonce).toBeTruthy();
        expect(pkce?.redirectUri).toBe("https://example.com/callback");
      }
    });

    it("returns INTERNAL_ERROR when state store throws", async () => {
      const { store } = makeStore();
      const adapter = new GovBrIdentityVerificationAdapter({
        clientId: "test-client",
        clientSecret: "test-secret",
        onStateStore: async () => { throw new Error("storage unavailable"); },
        onStateRetrieve: async (k) => store.get(k) ?? null
      });

      const result = await adapter.initiateVerification({
        redirectUri: "https://example.com/callback"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INTERNAL_ERROR");
      }
    });

    it("uses production endpoints when environment is production", async () => {
      const { adapter } = makeAdapter({ environment: "production" });

      const result = await adapter.initiateVerification({
        redirectUri: "https://example.com/callback"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        const url = new URL(result.data.redirectUrl);
        expect(url.hostname).toBe("sso.acesso.gov.br");
      }
    });
  });

  describe("handleCallback", () => {
    async function initiateAndGetState(
      adapter: GovBrIdentityVerificationAdapter,
      _store: Map<string, GovBrPkceState>
    ): Promise<string> {
      const initResult = await adapter.initiateVerification({
        redirectUri: "https://example.com/callback"
      });
      if (!initResult.success) throw new Error("initiate failed");
      const url = new URL(initResult.data.redirectUrl);
      return url.searchParams.get("state") ?? "";
    }

    it("returns a gold-level identity result on valid callback", async () => {
      const { adapter, store } = makeAdapter();
      const state = await initiateAndGetState(adapter, store);
      const pkce = store.get(state);

      mockExchange.mockResolvedValueOnce({
        access_token: "at-123",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile",
        id_token: "id-token-stub"
      });

      mockVerify.mockResolvedValueOnce({
        sub: "00000000000",
        name: "Test User",
        amr: ["passwd", "mfa"],
        auth_time: Math.floor(Date.now() / 1000),
        iss: "https://sso.staging.acesso.gov.br/",
        aud: "test-client",
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        nonce: pkce?.nonce ?? "",
        reliability_info: {
          level: "gold",
          reliabilities: [{ id: "601", updatedAt: "2026-01-01T00:00:00Z" }]
        }
      });

      const result = await adapter.handleCallback({
        providerPayload: { code: "auth-code-123", state }
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.identityVerified).toBe(true);
        expect(result.data.reliabilityLevel).toBe("gold");
        expect(result.data.method).toBe("gov_br");
        expect(result.data.authMethods).toContain("mfa");
        expect(result.data.authenticatedAt).toBeInstanceOf(Date);
      }
    });

    it("returns null reliabilityLevel when reliability_info is absent", async () => {
      const { adapter, store } = makeAdapter();
      const state = await initiateAndGetState(adapter, store);
      const pkce = store.get(state);

      mockExchange.mockResolvedValueOnce({
        access_token: "at-123",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile",
        id_token: "id-token-stub"
      });

      mockVerify.mockResolvedValueOnce({
        sub: "00000000000",
        name: "Test User",
        amr: ["passwd"],
        auth_time: Math.floor(Date.now() / 1000),
        iss: "https://sso.staging.acesso.gov.br/",
        aud: "test-client",
        exp: Math.floor(Date.now() / 1000) + 60,
        iat: Math.floor(Date.now() / 1000),
        nonce: pkce?.nonce ?? ""
      });

      const result = await adapter.handleCallback({
        providerPayload: { code: "auth-code-123", state }
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reliabilityLevel).toBeNull();
      }
    });

    it("returns INVALID_INPUT when code is missing from payload", async () => {
      const { adapter } = makeAdapter();

      const result = await adapter.handleCallback({
        providerPayload: { state: "some-state" }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });

    it("returns PROVIDER_REJECTED when state is unknown", async () => {
      const { adapter } = makeAdapter();

      const result = await adapter.handleCallback({
        providerPayload: { code: "some-code", state: "unknown-state" }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PROVIDER_REJECTED");
      }
    });

    it("returns PROVIDER_REJECTED when token exchange fails", async () => {
      const { adapter, store } = makeAdapter();
      const state = await initiateAndGetState(adapter, store);

      mockExchange.mockRejectedValueOnce(new Error("network error"));

      const result = await adapter.handleCallback({
        providerPayload: { code: "auth-code-123", state }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PROVIDER_REJECTED");
        expect(result.error.message).toContain("network error");
      }
    });

    it("returns PROVIDER_REJECTED when id_token signature is invalid", async () => {
      const { adapter, store } = makeAdapter();
      const state = await initiateAndGetState(adapter, store);

      mockExchange.mockResolvedValueOnce({
        access_token: "at-123",
        token_type: "Bearer",
        expires_in: 3600,
        scope: "openid profile",
        id_token: "id-token-stub"
      });

      mockVerify.mockRejectedValueOnce(new Error("JWSSignatureVerificationFailed"));

      const result = await adapter.handleCallback({
        providerPayload: { code: "auth-code-123", state }
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("PROVIDER_REJECTED");
      }
    });
  });
});
