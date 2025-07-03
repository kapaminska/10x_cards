import { z } from "zod";

/**
 * Schema for validating generation requests
 */
export const createGenerationSchema = z.object({
  sourceText: z
    .string()
    .min(1000, "Source text must be at least 1000 characters long")
    .max(10000, "Source text cannot exceed 10000 characters")
    .trim(),
});

export type CreateGenerationRequest = z.infer<typeof createGenerationSchema>;
