import { ContentClassificationService } from "../service/ContentClassificationService";
import { StubContentClassificationAdapter } from "../adapters/StubContentClassificationAdapter";

describe("ContentClassificationService", () => {
  describe("classify — text input", () => {
    it("returns a safe classification for clean text", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter({ riskLevel: "safe" })
      );

      const result = await service.classify({
        type: "text",
        content: "hello world"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.riskLevel).toBe("safe");
        expect(result.data.confidence).toBeGreaterThan(0);
        expect(result.data.categories).toContain("safe");
      }
    });

    it("returns INVALID_INPUT when content is empty", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter()
      );

      const result = await service.classify({
        type: "text",
        content: ""
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });

    it("returns INVALID_INPUT when content exceeds max length", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter()
      );

      const result = await service.classify({
        type: "text",
        content: "a".repeat(50001)
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });

    it("accepts optional locale", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter()
      );

      const result = await service.classify({
        type: "text",
        content: "conteúdo em português",
        locale: "pt-BR"
      });

      expect(result.success).toBe(true);
    });
  });

  describe("classify — url input", () => {
    it("returns a classification for a valid URL", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter({ riskLevel: "high", categories: ["adult_content"] })
      );

      const result = await service.classify({
        type: "url",
        url: "https://example.com/page"
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.riskLevel).toBe("high");
        expect(result.data.categories).toContain("adult_content");
      }
    });

    it("returns INVALID_INPUT for a malformed URL", async () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter()
      );

      const result = await service.classify({
        type: "url",
        url: "not-a-url"
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe("INVALID_INPUT");
      }
    });
  });

  describe("providerName", () => {
    it("exposes the provider name", () => {
      const service = new ContentClassificationService(
        new StubContentClassificationAdapter()
      );

      expect(service.providerName).toBe("stub");
    });
  });
});
