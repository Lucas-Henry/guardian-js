import { z } from "zod";

export const TextClassificationRequestSchema = z.object({
  type: z.literal("text"),
  content: z.string().min(1, "content must not be empty").max(50000, "content exceeds maximum length"),
  locale: z.string().optional()
});

export const UrlClassificationRequestSchema = z.object({
  type: z.literal("url"),
  url: z.string().url("url must be a valid URL")
});

export const ContentClassificationRequestSchema = z.discriminatedUnion("type", [
  TextClassificationRequestSchema,
  UrlClassificationRequestSchema
]);
