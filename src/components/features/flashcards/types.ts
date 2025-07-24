import type { FlashcardDTO, FlashcardSource, PaginationDto } from "@/types";

// Stan całego widoku, zarządzany przez custom hooka
export interface FlashcardsViewState {
  flashcards: FlashcardDTO[];
  pagination: PaginationDto;
  isLoading: boolean;
  error: string | null;
  filters: {
    source: FlashcardSource | "all";
  };
  sorting: {
    sortBy: "created_at" | "updated_at";
  };
}

// Stan modalu formularza
export interface FlashcardFormState {
  mode: "create" | "edit";
  isOpen: boolean;
  isSubmitting: boolean;
  // Dane do pre-populacji formularza w trybie edycji
  initialData?: FlashcardDTO;
}

// Stan modalu potwierdzenia usunięcia
export interface DeleteConfirmationState {
  isOpen: boolean;
  isConfirming: boolean;
  // ID fiszki do usunięcia
  flashcardId?: string;
}
