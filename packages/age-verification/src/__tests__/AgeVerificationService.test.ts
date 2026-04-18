import { AgeVerificationService } from "../service/AgeVerificationService";
import { StubAgeVerificationAdapter } from "../adapters/StubAgeVerificationAdapter";

describe("AgeVerificationService", () => {
  describe("initiateVerification", () => {
    it("returns a redirect URL from the provider", async () => {
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter()
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
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter()
      );

      const result = await service.initiateVerification({
        redirectUri: "not-a-url"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });

    it("passes optional metadata to the provider", async () => {
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter()
      );

      const result = await service.initiateVerification({
        redirectUri: "https://example.com/callback",
        locale: "pt-BR",
        metadata: { sessionId: "abc123" }
      });

      expect(result.success).toBe(true);
    });
  });

  describe("handleCallback", () => {
    it("returns a verified adult result from the stub", async () => {
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter({ ageGroup: "adult", verified: true })
      );

      const result = await service.handleCallback({ providerPayload: {} });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verified).toBe(true);
        expect(result.data.ageGroup).toBe("adult");
        expect(result.data.method).toBe("third_party");
      }
    });

    it("returns a non-verified child result when stub is configured so", async () => {
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter({ ageGroup: "child", verified: false })
      );

      const result = await service.handleCallback({ providerPayload: {} });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.verified).toBe(false);
        expect(result.data.ageGroup).toBe("child");
      }
    });
  });

  describe("providerName", () => {
    it("exposes the provider name", () => {
      const service = new AgeVerificationService(
        new StubAgeVerificationAdapter()
      );

      expect(service.providerName).toBe("stub");
    });
  });
});
