import { z } from "zod";

export const AgeVerificationRequestSchema = z.object({
  redirectUri: z.string().url("redirectUri must be a valid URL"),
  locale: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional()
});

export const AgeVerificationCallbackPayloadSchema = z.object({
  providerPayload: z.unknown().refine((v: unknown) => v !== undefined, {
    message: "providerPayload is required"
  })
});
