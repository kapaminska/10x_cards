// Global DTO & Command Model definitions for the 10x Cards public API.
// These types are derived from database entities declared in ./db/database.types.ts
// and follow the structures documented in .ai/api-plan.md.
//
// ----------------------------------------------------------------------------------
// Helper aliases & utilities
// ----------------------------------------------------------------------------------

import type { Database, Json } from "./db/database.types";

// Generic helper that flattens intersection types for better autocomplete
// (taken from https://github.com/sindresorhus/type-fest#simplify).
export type Simplify<T> = { [K in keyof T]: T[K] } & {};

// Re-export the enum for convenience so that the frontend does not need to reach
// for deeply-nested locations.
export type FlashcardSource = Database["public"]["Enums"]["flashcard_source"];

// Entity helpers (database rows)
export type FlashcardInsert = Database["public"]["Tables"]["flashcards"]["Insert"];
export type FlashcardRow = Database["public"]["Tables"]["flashcards"]["Row"];
export type GenerationRow = Database["public"]["Tables"]["generations"]["Row"];
export type GenerationErrorLogRow = Database["public"]["Tables"]["generation_error_logs"]["Row"];

// ----------------------------------------------------------------------------------
// Generic response / pagination helpers
// ----------------------------------------------------------------------------------

export interface PaginationDto {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationDto;
}

// ----------------------------------------------------------------------------------
// Flashcards
// ----------------------------------------------------------------------------------

export interface FlashcardDTO
  extends Simplify<
    Pick<FlashcardRow, "id" | "front" | "back" | "source"> & {
      generationId: FlashcardRow["generation_id"];
      createdAt: FlashcardRow["created_at"];
      updatedAt: FlashcardRow["updated_at"];
    }
  > {}

// Create (manual) -------------------------------------------------------------------
export interface CreateFlashcardCommand {
  /** Question side of the flashcard */
  front: string;
  /** Answer side of the flashcard */
  back: string;
  /**
   * Explicitly allow the client to send the source field; the backend will
   * coerce it to "manual" if omitted.
   */
  source?: Extract<FlashcardSource, "manual">;
}

// Batch create (AI) -----------------------------------------------------------------
export interface CreateAIGeneratedFlashcard {
  front: string;
  back: string;
  source: Extract<FlashcardSource, "ai-full" | "ai-edited">;
}

export interface CreateFlashcardsBatchCommand {
  /** UUID that identifies the generation job being accepted */
  generationId: string;
  /** Cards that the user accepted (with or without manual edits) */
  acceptedCards: CreateAIGeneratedFlashcard[];
  /** Number of suggestions the user rejected outright */
  rejectedCount: number;
}

// Update ---------------------------------------------------------------------------
export type UpdateFlashcardCommand = Partial<Pick<FlashcardDTO, "front" | "back" | "source">>;

// List / Pagination ----------------------------------------------------------------
export type FlashcardsListResponse = PaginatedResponse<FlashcardDTO>;

// ----------------------------------------------------------------------------------
// Unified single-create payload (manual or AI) --------------------------------------

/**
 * DTO for creating a single flashcard via POST /flashcards.
 * - For manual creation: `source` must be "manual" and `generationId` **must be omitted or null**.
 * - For AI-accepted creation (edge-case, not batch): `source` must be "ai-full" or "ai-edited"
 *   and `generationId` **must be provided**.
 */
export type FlashcardCreateDto = Simplify<
  Pick<FlashcardInsert, "front" | "back"> & {
    source: FlashcardSource;
    generationId?: string | null;
  }
>;

// ----------------------------------------------------------------------------------
// Generations
// ----------------------------------------------------------------------------------

export interface FlashcardSuggestion {
  front: string;
  back: string;
  source: "ai-full";
}

// Alias preserving naming convention with the DTO suffix
export type FlashcardSuggestionDto = FlashcardSuggestion;

export interface CreateGenerationCommand {
  /** Raw source text (1 000–10 000 characters) that will be transformed into cards */
  sourceText: string;
}

// Alternative name matching business-logic wording
export type GenerateFlashcardsCommand = CreateGenerationCommand;

export interface GenerationSuggestionsResponse {
  generationId: GenerationRow["id"];
  flashcardsSuggestions: FlashcardSuggestion[];
  generationCount: number;
}

export type GenerationSuggestionsResponseDto = GenerationSuggestionsResponse;

export interface GenerationSummaryDTO
  extends Simplify<
    Pick<GenerationRow, "id" | "model"> & {
      sourceTextLength: GenerationRow["source_text_length"];
      suggestionsCount: GenerationRow["suggestions_count"];
      acceptedUneditedCount: GenerationRow["accepted_unedited_count"];
      acceptedEditedCount: GenerationRow["accepted_edited_count"];
      rejectedCount: GenerationRow["rejected_count"];
      generationDurationMs: GenerationRow["generation_duration_ms"];
      createdAt: GenerationRow["created_at"];
    }
  > {}

// In the current API plan, detail payload mirrors the summary fields 1-to-1.
export type GenerationDetailDTO = GenerationSummaryDTO;

export type GenerationLogsListResponse = PaginatedResponse<GenerationSummaryDTO>;

// Aggregated statistics -------------------------------------------------------------
export interface GenerationStatsDTO {
  totalGenerations: number;
  totalSuggestions: number;
  acceptedUnedited: number;
  acceptedEdited: number;
  rejected: number;
  acceptanceRate: number; // 0..1
}

// ----------------------------------------------------------------------------------
// Generation Error Logs
// ----------------------------------------------------------------------------------

export interface GenerationErrorLogDTO
  extends Simplify<
    Pick<GenerationErrorLogRow, "id" | "model"> & {
      errorMessage: GenerationErrorLogRow["error_message"];
      errorContext: GenerationErrorLogRow["error_context"];
      sourceTextLength: GenerationErrorLogRow["source_text_length"];
      createdAt: GenerationErrorLogRow["created_at"];
    }
  > {}

export type GenerationErrorLogsListResponse = PaginatedResponse<GenerationErrorLogDTO>;

// In the current API plan, detail payload mirrors the summary fields 1-to-1.
export type GenerationErrorLogDetailDTO = GenerationErrorLogDTO;

// ----------------------------------------------------------------------------------
// Utility exports
// ----------------------------------------------------------------------------------

// Re-export Json for convenience in downstream code.
export type { Json };
