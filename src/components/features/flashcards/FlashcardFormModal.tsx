import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/hig/Dialog";
import { Button } from "@/components/hig/Button";
import { Input } from "@/components/hig/Input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/hig/Form";
import { Textarea } from "@/components/hig/Textarea";
import type { FlashcardFormState } from "./types";
import type { FlashcardFormData } from "@/lib/schemas/flashcard.schema";
import { flashcardFormSchema } from "@/lib/schemas/flashcard.schema";
import { useEffect } from "react";

interface FlashcardFormModalProps {
  state: FlashcardFormState;
  onClose: () => void;
  onSubmit: (data: FlashcardFormData) => void;
}

const FlashcardFormModal = ({ state, onClose, onSubmit }: FlashcardFormModalProps) => {
  const form = useForm<FlashcardFormData>({
    resolver: zodResolver(flashcardFormSchema),
    defaultValues: {
      front: "",
      back: "",
    },
  });

  useEffect(() => {
    if (state.mode === "edit" && state.initialData) {
      form.reset(state.initialData);
    } else {
      form.reset({ front: "", back: "" });
    }
  }, [state.initialData, state.mode, form]);

  const title = state.mode === "create" ? "Stwórz nową fiszkę" : "Edytuj fiszkę";
  const description =
    state.mode === "create"
      ? "Wypełnij poniższe pola, aby dodać nową fiszkę do swojej kolekcji."
      : "Wprowadź zmiany w swojej fiszce.";

  return (
    <Dialog open={state.isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Przód</FormLabel>
                  <FormControl>
                    <Input placeholder="Pytanie lub pojęcie..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tył</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Odpowiedź lub definicja..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit" disabled={state.isSubmitting}>
                {state.isSubmitting ? "Zapisywanie..." : "Zapisz"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FlashcardFormModal;
