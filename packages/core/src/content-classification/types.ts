import type { Result } from "../shared/result";

export type ContentRiskLevel = "safe" | "low" | "medium" | "high" | "blocked";

export type ContentCategory =
  | "adult_content"
  | "violence"
  | "hate_speech"
  | "gambling"
  | "drugs"
  | "self_harm"
  | "safe";

export type ContentClassificationResult = {
  readonly riskLevel: ContentRiskLevel;
  readonly categories: ReadonlyArray<ContentCategory>;
  readonly confidence: number;
  readonly providerRef: string | null;
};

export type TextClassificationRequest = {
  readonly type: "text";
  readonly content: string;
  readonly locale?: string;
};

export type UrlClassificationRequest = {
  readonly type: "url";
  readonly url: string;
};

export type ContentClassificationRequest =
  | TextClassificationRequest
  | UrlClassificationRequest;

export interface ContentClassificationProvider {
  readonly name: string;

  classify(
    request: ContentClassificationRequest
  ): Promise<Result<ContentClassificationResult>>;
}
