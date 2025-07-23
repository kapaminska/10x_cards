"use client";

import React from "react";
import { useGenerationManager } from "./useGenerationManager";
import GenerationForm, { isSourceTextValid } from "./GenerationForm";
import SuggestionsList from "./SuggestionsList";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const GenerationContainer: React.FC = () => {
  const {
    sourceText,
    setSourceText,
    suggestions,
    apiState,
    errorMessage,
    handleGenerate,
    handleUpdateSuggestion,
    isSaving,
    saveError,
    handleSaveBatch,
  } = useGenerationManager();

  const renderContent = () => {
    switch (apiState) {
      case "loading":
        return (
          <div className="space-y-4 mt-8">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        );
      case "error":
        return (
          <Alert variant="destructive" className="mt-8">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Błąd</AlertTitle>
            <AlertDescription>{errorMessage || "Wystąpił nieoczekiwany błąd."}</AlertDescription>
          </Alert>
        );
      case "success":
        return (
          <>
            <SuggestionsList
              suggestions={suggestions}
              onUpdateSuggestion={handleUpdateSuggestion}
              onSaveBatch={handleSaveBatch}
              isSaving={isSaving}
            />
            {saveError && (
              <Alert variant="destructive" className="mt-4">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Błąd zapisu</AlertTitle>
                <AlertDescription>{saveError}</AlertDescription>
              </Alert>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <GenerationForm
        sourceText={sourceText}
        onTextChange={setSourceText}
        onSubmit={handleGenerate}
        isLoading={apiState === "loading"}
        validationError={
          !isSourceTextValid(sourceText) && sourceText.length > 0 ? `Tekst musi mieć od 1000 do 10000 znaków.` : null
        }
      />
      <div className="mt-8">{renderContent()}</div>
    </div>
  );
};

export default GenerationContainer;
