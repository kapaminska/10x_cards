import { useCallback, useState } from "react";
import type { ApiState, SuggestionViewModel } from "./types";
import type {
  CreateAIGeneratedFlashcard,
  CreateFlashcardsBatchCommand,
  CreateGenerationCommand,
  GenerationSuggestionsResponseDto,
} from "@/types";

export function useGenerationManager() {
  const [sourceText, setSourceText] = useState("");
  const [suggestions, setSuggestions] = useState<SuggestionViewModel[]>([]);
  const [apiState, setApiState] = useState<ApiState>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    setApiState("loading");
    setErrorMessage(null);
    setSuggestions([]);

    try {
      const command: CreateGenerationCommand = { sourceText };
      const response = await fetch("/api/generations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił nieoczekiwany błąd serwera.");
      }

      const data: GenerationSuggestionsResponseDto = await response.json();

      setGenerationId(data.generationId);
      setSuggestions(
        data.flashcardsSuggestions.map((suggestion) => ({
          ...suggestion,
          id: crypto.randomUUID(),
          status: "new",
        }))
      );
      setApiState("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nie udało się wygenerować fiszek.";
      setApiState("error");
      setErrorMessage(message);
    }
  }, [sourceText]);

  const handleUpdateSuggestion = useCallback((id: string, data: Partial<SuggestionViewModel>) => {
    setSuggestions((currentSuggestions) => currentSuggestions.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const handleSaveBatch = useCallback(async () => {
    if (!generationId) {
      setSaveError("Brak ID generacji, nie można zapisać fiszek.");
      return;
    }

    setIsSaving(true);
    setSaveError(null);

    const acceptedCards = suggestions
      .filter((s) => s.status === "accepted" || s.status === "edited")
      .map((s) => ({
        front: s.front,
        back: s.back,
        source: (s.status === "edited" ? "ai-edited" : "ai-full") as CreateAIGeneratedFlashcard["source"],
      }));

    const rejectedCount = suggestions.filter((s) => s.status === "rejected").length;

    const command: CreateFlashcardsBatchCommand = {
      generationId,
      acceptedCards,
      rejectedCount,
    };

    try {
      const response = await fetch("/api/flashcards/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Wystąpił błąd podczas zapisywania fiszek.");
      }

      // Opcjonalnie: obsługa sukcesu, np. wyczyszczenie sugestii lub przekierowanie
      alert("Fiszki zostały pomyślnie zapisane!");
      setSuggestions([]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Nie udało się zapisać fiszek.";
      setSaveError(message);
    } finally {
      setIsSaving(false);
    }
  }, [suggestions, generationId]);

  return {
    sourceText,
    setSourceText,
    suggestions,
    apiState,
    errorMessage,
    generationId,
    handleGenerate,
    handleUpdateSuggestion,
    isSaving,
    saveError,
    handleSaveBatch,
  };
}
