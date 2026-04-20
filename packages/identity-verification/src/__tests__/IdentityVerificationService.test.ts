import { IdentityVerificationService } from "../service/IdentityVerificationService";
import { StubIdentityVerificationAdapter } from "../adapters/StubIdentityVerificationAdapter";

describe("IdentityVerificationService", () => {
  describe("initiateVerification", () => {
    it("returns a redirect URL from the provider", async () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter()
      );

      const result = await service.initiateVerification({
        redirectUri: "https://example.com/callback"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.redirectUrl).toContain("https://example.com/callback");
      }
    });

    it("returns INVALID_INPUT when redirectUri is not a valid URL", async () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter()
      );

      const result = await service.initiateVerification({
        redirectUri: "not-a-url"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("handleCallback", () => {
    it("returns a gold-level verified identity result", async () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter({
          identityVerified: true,
          reliabilityLevel: "gold",
          authMethods: ["passwd", "mfa"]
        })
      );

      const result = await service.handleCallback({ providerPayload: {} });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.identityVerified).toBe(true);
        expect(result.data.reliabilityLevel).toBe("gold");
        expect(result.data.authMethods).toContain("mfa");
        expect(result.data.authenticatedAt).toBeInstanceOf(Date);
        expect(result.data.method).toBe("third_party");
      }
    });

    it("returns a bronze-level unverified result when stub is configured so", async () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter({
          identityVerified: false,
          reliabilityLevel: "bronze"
        })
      );

      const result = await service.handleCallback({ providerPayload: {} });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.identityVerified).toBe(false);
        expect(result.data.reliabilityLevel).toBe("bronze");
      }
    });

    it("returns INVALID_INPUT when providerPayload is missing", async () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter()
      );

      const result = await service.handleCallback(
        {} as { providerPayload: unknown }
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("providerName", () => {
    it("exposes the provider name", () => {
      const service = new IdentityVerificationService(
        new StubIdentityVerificationAdapter()
      );

      expect(service.providerName).toBe("stub");
    });
  });
});
