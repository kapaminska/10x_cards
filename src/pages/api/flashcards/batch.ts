import type { APIContext } from "astro";
import { z } from "zod";
import * as flashcardService from "../../../lib/services/flashcard.service";
import type { CreateFlashcardsBatchCommand } from "../../../types";
import { logger } from "@/lib/utils";

export const prerender = false;

const CreateAIGeneratedFlashcardSchema = z.object({
  front: z.string().min(1, "Front cannot be empty."),
  back: z.string().min(1, "Back cannot be empty."),
  source: z.enum(["ai-full", "ai-edited"]),
});

const CreateFlashcardsBatchSchema = z.object({
  generationId: z.string().uuid("Invalid generationId format."),
  acceptedCards: z.array(CreateAIGeneratedFlashcardSchema),
  rejectedCount: z.number().int().min(0),
});

export async function POST({ request, locals }: APIContext): Promise<Response> {
  const { supabase, user } = locals;
  const startTime = Date.now();

  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), { status: 401 });
  }

  logger.info("[API] POST /api/flashcards/batch - Request started", {
    userId: user.id,
    userEmail: user.email,
  });

  let body: CreateFlashcardsBatchCommand;
  try {
    body = await request.json();
    logger.info("[API] POST /api/flashcards/batch - Request body parsed", {
      userId: user.id,
      cardCount: body.acceptedCards.length,
    });
  } catch {
    logger.error("[API] POST /api/flashcards/batch - Invalid JSON body", {
      userId: user.id,
    });
    return new Response(JSON.stringify({ message: "Invalid JSON body" }), {
      status: 400,
    });
  }

  const validationResult = CreateFlashcardsBatchSchema.safeParse(body);

  if (!validationResult.success) {
    logger.warn("[API] POST /api/flashcards/batch - Validation failed", {
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

  const data: CreateFlashcardsBatchCommand = validationResult.data;
  logger.info("[API] POST /api/flashcards/batch - Request validated successfully", {
    userId: user.id,
  });

  try {
    const { flashcards } = await flashcardService.createFlashcards(data, {
      supabase,
      user: { id: user.id },
    });

    const duration = Date.now() - startTime;
    logger.info("[API] POST /api/flashcards/batch - Flashcards created successfully", {
      userId: user.id,
      flashcardCount: flashcards.length,
      duration: `${duration}ms`,
    });

    return new Response(JSON.stringify({ flashcards }), { status: 201 });
  } catch (error: unknown) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    logger.error("[API] POST /api/flashcards/batch - Service error", {
      userId: user.id,
      error: errorMessage,
      duration: `${duration}ms`,
    });

    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}
