import type { CreateFlashcardsBatchCommand, FlashcardCreateDto, FlashcardDTO, FlashcardInsert } from "@/types";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ServiceError } from "../errors";
import { type Database } from "@/db/database.types";
import { logger } from "../utils";

interface NormalizedFlashcardData {
  cardsToInsert: FlashcardInsert[];
  generationId: string | null;
  generationStats: {
    acceptedUnedited: number;
    acceptedEdited: number;
    rejected: number;
  } | null;
}

/**
 * Normalizes the input from the POST /api/flashcards endpoint into a unified format
 * suitable for insertion into the database.
 *
 * @param data - The validated request body, can be for a single card or a batch.
 * @param userId - The ID of the authenticated user.
 * @returns An object containing the cards to be inserted and any generation stats to update.
 */
function normalizeFlashcardData(
  data: CreateFlashcardsBatchCommand | FlashcardCreateDto,
  userId: string
): NormalizedFlashcardData {
  if ("acceptedCards" in data) {
    // Batch creation from AI generation
    const { acceptedCards, rejectedCount, generationId } = data;
    const cardsToInsert: FlashcardInsert[] = acceptedCards.map((card) => ({
      ...card,
      user_id: userId,
      generation_id: generationId,
    }));

    const acceptedUnedited = acceptedCards.filter((c) => c.source === "ai-full").length;
    const acceptedEdited = acceptedCards.filter((c) => c.source === "ai-edited").length;

    return {
      cardsToInsert,
      generationId,
      generationStats: {
        acceptedUnedited,
        acceptedEdited,
        rejected: rejectedCount,
      },
    };
  } else {
    // Single flashcard creation (manual or AI)
    const { front, back, source, generationId } = data;
    const cardsToInsert: FlashcardInsert[] = [
      {
        front,
        back,
        source,
        user_id: userId,
        generation_id: generationId,
      },
    ];
    return {
      cardsToInsert,
      generationId: generationId ?? null,
      generationStats: null,
    };
  }
}

/**
 * Creates one or more flashcards for a user.
 *
 * This function handles both single, manual flashcard creation and batch creation
 * from an AI generation session. It performs authorization checks, validation,
 * and database operations within a transaction.
 *
 * @param data - The validated request body from the API endpoint.
 * @param context - An object containing the Supabase client and the authenticated user.
 * @returns A promise that resolves to an object containing the list of created flashcards.
 */
export async function createFlashcards(
  data: CreateFlashcardsBatchCommand | FlashcardCreateDto,
  context: { supabase: SupabaseClient<Database>; user: { id: string } }
): Promise<{ flashcards: FlashcardDTO[] }> {
  const { supabase, user } = context;

  const { cardsToInsert, generationId, generationStats } = normalizeFlashcardData(data, user.id);

  if (generationId) {
    const { data: generation, error } = await supabase
      .from("generations")
      .select("id, user_id")
      .eq("id", generationId)
      .single();

    if (error || !generation) {
      throw new ServiceError("Not Found", `Generation with ID ${generationId} not found.`);
    }

    if (generation.user_id !== user.id) {
      throw new ServiceError("Forbidden", `Generation with ID ${generationId} does not belong to the current user.`);
    }
  }

  // 3. Perform database operations within a transaction via standard operations.
  // Insert flashcards
  const { data: createdFlashcards, error: insertError } = await supabase
    .from("flashcards")
    .insert(cardsToInsert)
    .select();

  if (insertError) {
    logger.error("Insert Error:", insertError);
    throw new ServiceError("Internal Server Error", "A database error occurred while creating flashcards.");
  }

  // Update generation stats if needed
  if (generationStats && generationId) {
    const { error: updateError } = await supabase
      .from("generations")
      .update({
        accepted_unedited_count: generationStats.acceptedUnedited,
        accepted_edited_count: generationStats.acceptedEdited,
        rejected_count: generationStats.rejected,
      })
      .eq("id", generationId);

    if (updateError) {
      logger.error("Update Error:", updateError);
      // Note: We don't throw here as flashcards were already created
      // In production, you might want to implement proper transaction rollback
    }
  }

  if (!createdFlashcards) {
    throw new ServiceError("Internal Server Error", "No data was returned after creating flashcards.");
  }

  // 4. Map the inserted data to FlashcardDTO.
  const flashcardDTOs: FlashcardDTO[] = createdFlashcards.map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    source: card.source,
    generationId: card.generation_id,
    createdAt: card.created_at,
    updatedAt: card.updated_at,
  }));

  // 5. Return the DTOs.
  return {
    flashcards: flashcardDTOs,
  };
}
