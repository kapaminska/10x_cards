import type { FlashcardDTO } from "@/types";
import FlashcardListItem from "./FlashcardListItem";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

interface FlashcardsListProps {
  flashcards: FlashcardDTO[];
  isLoading: boolean;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcardId: string) => void;
}

const FlashcardsList = ({ flashcards, isLoading, onEdit, onDelete }: FlashcardsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex flex-col space-y-3">
            <Skeleton className="h-[125px] w-full rounded-xl" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold">Nie masz jeszcze żadnych fiszek</h2>
        <p className="text-muted-foreground mt-2 mb-4">
          Stwórz nową fiszkę ręcznie lub wygeneruj je z tekstu, aby rozpocząć naukę.
        </p>
        <div className="flex justify-center gap-4">
          <Button>Stwórz fiszkę</Button>
          <Button variant="outline" asChild>
            <a href="/generate">Wygeneruj z tekstu</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {flashcards.map((flashcard) => (
        <FlashcardListItem key={flashcard.id} flashcard={flashcard} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default FlashcardsList;
