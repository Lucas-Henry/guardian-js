import {
  ok,
  type ContentClassificationProvider,
  type ContentClassificationRequest,
  type ContentClassificationResult,
  type ContentRiskLevel,
  type ContentCategory,
  type Result
} from "@guardian-js/core";

type StubConfig = {
  readonly riskLevel?: ContentRiskLevel;
  readonly categories?: ReadonlyArray<ContentCategory>;
  readonly confidence?: number;
};

export class StubContentClassificationAdapter
  implements ContentClassificationProvider {
  public readonly name = "stub";

  private readonly config: Required<StubConfig>;

  public constructor(config: StubConfig = {}) {
    this.config = {
      riskLevel: config.riskLevel ?? "safe",
      categories: config.categories ?? ["safe"],
      confidence: config.confidence ?? 0.99
    };
  }

  public async classify(
    _request: ContentClassificationRequest
  ): Promise<Result<ContentClassificationResult>> {
    return Promise.resolve(
      ok({
        riskLevel: this.config.riskLevel,
        categories: this.config.categories,
        confidence: this.config.confidence,
        providerRef: "stub-ref-001"
      })
    );
  }
}
