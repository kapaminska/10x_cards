import type { FlashcardDTO } from "@/types";
import { Button } from "@/components/hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/hig/Card";
import { format } from "date-fns";
import { Pencil, Trash2 } from "lucide-react";

interface FlashcardListItemProps {
  flashcard: FlashcardDTO;
  onEdit: (flashcard: FlashcardDTO) => void;
  onDelete: (flashcardId: string) => void;
}

const FlashcardListItem = ({ flashcard, onEdit, onDelete }: FlashcardListItemProps) => {
  const formattedDate = flashcard.createdAt ? format(new Date(flashcard.createdAt), "dd.MM.yyyy") : "Brak daty";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-grow">
        <CardTitle className="text-lg font-semibold">{flashcard.front}</CardTitle>
        <CardDescription className="text-xs">
          Źródło: {flashcard.source} | Utworzono: {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{flashcard.back}</p>
      </CardContent>
      <CardFooter className="flex justify-end items-center gap-2 mt-auto pt-4">
        <Button variant="ghost" size="icon" onClick={() => onEdit(flashcard)}>
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edytuj fiszkę</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(flashcard.id)}>
          <Trash2 className="h-4 w-4 text-red-500" />
          <span className="sr-only">Usuń fiszkę</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardListItem;
