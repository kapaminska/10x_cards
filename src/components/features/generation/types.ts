import type { FlashcardSuggestionDto } from "@/types";

/**
 * Status sugestii fiszki w interfejsie użytkownika.
 * - 'new':      Świeżo wygenerowana, bez interakcji użytkownika.
 * - 'accepted': Zaakceptowana przez użytkownika bez zmian.
 * - 'edited':   Zaakceptowana przez użytkownika po dokonaniu zmian.
 * - 'rejected': Odrzucona przez użytkownika.
 */
export type SuggestionStatus = "new" | "accepted" | "edited" | "rejected";

/**
 * ViewModel dla pojedynczej sugestii fiszki.
 * Rozszerza DTO o pola potrzebne do śledzenia stanu w UI.
 */
export interface SuggestionViewModel extends FlashcardSuggestionDto {
  /** Unikalny identyfikator po stronie klienta (np. z crypto.randomUUID()) */
  id: string;
  /** Aktualny status karty w cyklu życia interakcji użytkownika */
  status: SuggestionStatus;
}

/**
 * Typ określający stan komunikacji z API.
 */
export type ApiState = "idle" | "loading" | "success" | "error";
