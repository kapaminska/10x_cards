import React from "react";
import { Textarea } from "@/components/hig/Textarea";
import { Button } from "@/components/hig/Button";

interface GenerationFormProps {
  sourceText: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  validationError: string | null;
}

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export const isSourceTextValid = (text: string) => {
  return text.length >= MIN_LENGTH && text.length <= MAX_LENGTH;
};

const GenerationForm: React.FC<GenerationFormProps> = ({ sourceText, onTextChange, onSubmit, isLoading }) => {
  const isValid = isSourceTextValid(sourceText);

  return (
    <form
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isValid && !isLoading) {
          onSubmit();
        }
      }}
      className="space-y-4"
    >
      <Textarea
        value={sourceText}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Wklej tutaj tekst (od 1000 do 10000 znaków), z którego wygenerujemy fiszki..."
        className="min-h-[200px] resize-y"
        maxLength={MAX_LENGTH}
        data-testid="source-text-input"
      />
      <div className="flex items-center justify-between">
        <p className={`text-sm ${sourceText.length > MAX_LENGTH ? "text-red-500" : "text-muted-foreground"}`}>
          {sourceText.length} / {MAX_LENGTH}
        </p>
        <Button type="submit" disabled={!isValid || isLoading} data-testid="generate-flashcards-button">
          {isLoading ? "Generowanie..." : "Generuj fiszki"}
        </Button>
      </div>
      {!isValid && sourceText.length > 0 && (
        <p className="text-sm text-red-500">
          Tekst musi mieć od {MIN_LENGTH} do {MAX_LENGTH} znaków.
        </p>
      )}
    </form>
  );
};

export default GenerationForm;
