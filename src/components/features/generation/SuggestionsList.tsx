import React from "react";
import type { SuggestionViewModel } from "./types";
import SuggestionCard from "./SuggestionCard";
import { Button } from "@/components/hig/Button";

interface SuggestionsListProps {
  suggestions: SuggestionViewModel[];
  onUpdateSuggestion: (id: string, data: Partial<SuggestionViewModel>) => void;
  onSaveBatch: () => void;
  isSaving: boolean;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onUpdateSuggestion,
  onSaveBatch,
  isSaving,
}) => {
  const acceptedCount = suggestions.filter((s) => s.status === "accepted" || s.status === "edited").length;

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold">Fiszki zapisane!</h3>
        <p className="text-muted-foreground">Możesz teraz wygenerować nowy zestaw lub przejść do nauki.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Wygenerowane sugestie ({suggestions.length})</h2>
        <Button onClick={onSaveBatch} disabled={isSaving || acceptedCount === 0}>
          {isSaving ? "Zapisywanie..." : `Zapisz zaakceptowane fiszki (${acceptedCount})`}
        </Button>
      </div>

      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            suggestion={suggestion}
            onUpdate={(id, data) => onUpdateSuggestion(id, data)}
          />
        ))}
      </div>
    </div>
  );
};

export default SuggestionsList;
