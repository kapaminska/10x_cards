import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardSuggestionDto, GenerationSuggestionsResponseDto, Json } from "../../types";
import { logger } from "../utils";

/**
 * Service for handling flashcard generation using AI
 */
export class GenerationService {
  constructor(private supabase: SupabaseClient<Database>) {}

  /**
   * Main method to generate flashcard suggestions
   */
  async generateSuggestions(sourceText: string, userId: string): Promise<GenerationSuggestionsResponseDto> {
    const startTime = Date.now();

    logger.info(`[GenerationService] Starting generation for user ${userId}, text length: ${sourceText.length}`);

    try {
      // Validate source text length
      logger.info(`[GenerationService] Validating source text`);
      this.validateSourceText(sourceText);

      // Calculate hash for storage and reference
      const sourceTextHash = await this.calculateHash(sourceText);
      logger.info(`[GenerationService] Calculated hash: ${sourceTextHash.substring(0, 8)}...`);

      // Call AI service (mocked for now)
      logger.info(`[GenerationService] Calling AI service`);
      const suggestions = await this.callAIService(sourceText);
      logger.info(`[GenerationService] AI service returned ${suggestions.length} suggestions`);

      // Calculate generation duration
      const generationDurationMs = Date.now() - startTime;

      // Save generation to database
      logger.info(`[GenerationService] Saving generation to database`);
      const generationId = await this.saveGeneration({
        userId,
        sourceTextHash,
        sourceTextLength: sourceText.length,
        suggestionsCount: suggestions.length,
        generationDurationMs,
        model: "mock-ai-model-v1", // TODO: Replace with actual model name
      });

      logger.info(
        `[GenerationService] Generation completed successfully. ID: ${generationId}, Duration: ${generationDurationMs}ms`
      );

      return {
        generationId,
        flashcardsSuggestions: suggestions,
        generationCount: suggestions.length,
      };
    } catch (error) {
      const generationDurationMs = Date.now() - startTime;
      logger.error(`[GenerationService] Generation failed after ${generationDurationMs}ms:`, error);

      // Log error if it's an AI service error
      if (error instanceof AIServiceError) {
        logger.warn(`[GenerationService] Logging AI service error to database`);
        await this.logError({
          userId,
          sourceTextHash: await this.calculateHash(sourceText),
          sourceTextLength: sourceText.length,
          errorMessage: error.message,
          errorContext: error.context as Json,
          model: "mock-ai-model-v1",
        });
      }
      throw error;
    }
  }

  /**
   * Validates source text business rules
   */
  private validateSourceText(sourceText: string): void {
    if (sourceText.length < 1000) {
      throw new ValidationError("Source text must be at least 1000 characters long");
    }
    if (sourceText.length > 10000) {
      throw new ValidationError("Source text cannot exceed 10000 characters");
    }
  }

  /**
   * Calculates SHA-256 hash of source text for storage and reference purposes
   */
  private async calculateHash(sourceText: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(sourceText);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Calls AI service to generate flashcard suggestions (mocked)
   */
  private async callAIService(sourceText: string): Promise<FlashcardSuggestionDto[]> {
    // TODO: Replace with actual AI service call using sourceText
    // Currently mocked - will process sourceText in real implementation
    void sourceText; // Suppress unused parameter warning

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock response - in production this would be the actual AI call
    const mockSuggestions: FlashcardSuggestionDto[] = [
      {
        front: "What is the main concept discussed in the provided text?",
        back: "The main concept is extracted from the source material and presented as a concise answer.",
        source: "ai-full",
      },
      {
        front: "What are the key points mentioned in the source text?",
        back: "Key points include the essential information that was highlighted in the original material.",
        source: "ai-full",
      },
      {
        front: "How does this topic relate to broader concepts?",
        back: "This topic connects to wider themes and principles within the subject area.",
        source: "ai-full",
      },
    ];

    return mockSuggestions;
  }

  /**
   * Saves generation record to database
   */
  private async saveGeneration(data: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    suggestionsCount: number;
    generationDurationMs: number;
    model: string;
  }): Promise<string> {
    const { data: result, error } = await this.supabase
      .from("generations")
      .insert({
        user_id: data.userId,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceTextLength,
        suggestions_count: data.suggestionsCount,
        generation_duration_ms: data.generationDurationMs,
        model: data.model,
      })
      .select("id")
      .single();

    if (error) {
      throw new DatabaseError("Failed to save generation", error);
    }

    return result.id;
  }

  /**
   * Logs error to generation_error_logs table
   */
  private async logError(data: {
    userId: string;
    sourceTextHash: string;
    sourceTextLength: number;
    errorMessage: string;
    errorContext: Json;
    model: string;
  }): Promise<void> {
    try {
      await this.supabase.from("generation_error_logs").insert({
        user_id: data.userId,
        source_text_hash: data.sourceTextHash,
        source_text_length: data.sourceTextLength,
        error_message: data.errorMessage,
        error_context: data.errorContext,
        model: data.model,
      });
    } catch (error) {
      // Don't throw error if logging fails - just log to console
      logger.error("Failed to log error:", error);
    }
  }
}

// Custom error classes
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AIServiceError extends Error {
  constructor(
    message: string,
    public context?: unknown
  ) {
    super(message);
    this.name = "AIServiceError";
  }
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}
