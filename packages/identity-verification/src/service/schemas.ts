import { z } from "zod";

export const IdentityVerificationRequestSchema = z.object({
  redirectUri: z.string().url("redirectUri must be a valid URL"),
  locale: z.string().optional(),
  metadata: z.record(z.string(), z.string()).optional()
});

export const IdentityVerificationCallbackPayloadSchema = z.object({
  providerPayload: z.unknown().refine((v) => v !== undefined, {
    message: "providerPayload is required"
  })
});
