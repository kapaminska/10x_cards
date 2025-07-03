import type { APIContext } from "astro";
import { z } from "zod";
import * as flashcardService from "../../../lib/services/flashcard.service";
import type { CreateFlashcardsBatchCommand, FlashcardCreateDto } from "../../../types";
import { logger } from "@/lib/utils";
import { DEFAULT_USER_ID } from "@/db/supabase.client";

export const prerender = false;

/**
 * Schemas for POST /api/flashcards endpoint
 */
const CreateAIGeneratedFlashcardSchema = z.object({
  front: z.string().min(1, "Front cannot be empty."),
  back: z.string().min(1, "Back cannot be empty."),
  source: z.enum(["ai-full", "ai-edited"]),
});

const BatchFlashcardsSchema = z.object({
  generationId: z.string().uuid("Invalid generationId format."),
  acceptedCards: z.array(CreateAIGeneratedFlashcardSchema).min(1, "At least one card must be accepted."),
  rejectedCount: z.number().int().min(0),
});

const SingleFlashcardSchema = z
  .object({
    front: z.string().min(1, "Front cannot be empty."),
    back: z.string().min(1, "Back cannot be empty."),
    source: z.enum(["manual", "ai-full", "ai-edited"]).default("manual"),
    generationId: z.string().uuid().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.source === "manual") {
      if (data.generationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "generationId must be null or omitted for manual flashcards.",
          path: ["generationId"],
        });
      }
    } else {
      // source is 'ai-full' or 'ai-edited'
      if (!data.generationId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "generationId is required for AI-generated flashcards.",
          path: ["generationId"],
        });
      }
    }
  });

const FlashcardsPostRequestSchema = z.union([BatchFlashcardsSchema, SingleFlashcardSchema]);

export async function POST({ request, locals }: APIContext): Promise<Response> {
  const { supabase } = locals;
  const startTime = Date.now();

  // Use default user for testing instead of real authentication
  const user = {
    id: DEFAULT_USER_ID,
    email: "test@example.com",
  };

  logger.info("POST /api/flashcards - Request started", {
    userId: user.id,
    userEmail: user.email,
  });

  let body;
  try {
    body = await request.json();
    logger.info("POST /api/flashcards - Request body parsed", {
      userId: user.id,
      bodyType: "acceptedCards" in body ? "batch" : "single",
      cardCount: "acceptedCards" in body ? body.acceptedCards.length : 1,
    });
  } catch {
    logger.error("POST /api/flashcards - Invalid JSON body", {
      userId: user.id,
    });
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const validationResult = FlashcardsPostRequestSchema.safeParse(body);

  if (!validationResult.success) {
    logger.warn("POST /api/flashcards - Validation failed", {
      userId: user.id,
      errors: validationResult.error.flatten(),
    });
    return new Response(
      JSON.stringify({
        message: "Invalid request body.",
        errors: validationResult.error.flatten(),
      }),
      { status: 400 }
    );
  }

  const data: CreateFlashcardsBatchCommand | FlashcardCreateDto = validationResult.data;
  logger.info("POST /api/flashcards - Request validated successfully", {
    userId: user.id,
    dataType: "acceptedCards" in data ? "batch" : "single",
  });

  try {
    const { flashcards } = await flashcardService.createFlashcards(data, {
      supabase,
      user,
    });

    const duration = Date.now() - startTime;
    logger.info("POST /api/flashcards - Flashcards created successfully", {
      userId: user.id,
      flashcardCount: flashcards.length,
      duration: `${duration}ms`,
    });

    return new Response(JSON.stringify({ flashcards }), { status: 201 });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;

    if (error instanceof Error) {
      logger.error("POST /api/flashcards - Service error", {
        userId: user.id,
        error: error.message,
        duration: `${duration}ms`,
      });
    } else {
      logger.error("POST /api/flashcards - Unknown error", {
        userId: user.id,
        error: String(error),
        duration: `${duration}ms`,
      });
    }

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
