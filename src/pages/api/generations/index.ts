import type { APIRoute } from "astro";
import {
  GenerationService,
  ValidationError,
  AIServiceError,
  DatabaseError,
} from "../../../lib/services/generation.service";
import { createGenerationSchema } from "../../../lib/schemas/generation.schema";
import { logger } from "../../../lib/utils";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  logger.info(`[API] POST /api/generations - Request received`);

  try {
    const { supabase, user } = locals;
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    // Parse and validate request body
    logger.info(`[API] Parsing request body`);
    let requestBody;
    try {
      requestBody = await request.json();
    } catch {
      logger.warn(`[API] Invalid JSON in request body`);
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Invalid JSON in request body",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate with Zod schema
    logger.info(`[API] Validating request data`);
    const validationResult = createGenerationSchema.safeParse(requestBody);
    if (!validationResult.success) {
      logger.warn(`[API] Validation failed:`, validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Validation failed",
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { sourceText } = validationResult.data;
    logger.info(`[API] Request validated successfully, proceeding with generation`);

    // Create service instance and generate suggestions with authenticated user
    const generationService = new GenerationService(supabase);
    const result = await generationService.generateSuggestions(sourceText, user.id);

    logger.info(`[API] Generation completed successfully, returning response`);
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Generation endpoint error:", error);

    if (error instanceof ValidationError) {
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: error.message,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof AIServiceError) {
      return new Response(
        JSON.stringify({
          error: "AI Service Error",
          message: "Failed to generate flashcards. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof DatabaseError) {
      return new Response(
        JSON.stringify({
          error: "Database Error",
          message: "Internal server error. Please try again.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

// Optional: Add other HTTP methods if needed
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      error: "Method Not Allowed",
      message: "GET method is not supported for this endpoint",
    }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    }
  );
};
