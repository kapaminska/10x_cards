import type { FlashcardDTO } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface FlashcardListItemProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcardId: string) => void;
}

const FlashcardListItem = ({ flashcard, onEdit, onDelete }: FlashcardListItemProps) => {
  const formattedDate = flashcard.createdAt ? format(new Date(flashcard.createdAt), "dd.MM.yyyy") : "Brak daty";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{flashcard.front}</CardTitle>
        <CardDescription>
          Źródło: {flashcard.source} | Utworzono: {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>{flashcard.back}</p>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onEdit(flashcard)}>
          Edytuj
        </Button>
        <Button variant="destructive" onClick={() => onDelete(flashcard.id)}>
          Usuń
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardListItem;
