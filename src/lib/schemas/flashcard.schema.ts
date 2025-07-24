import { z } from "zod";

export const flashcardFormSchema = z.object({
  front: z
    .string()
    .min(1, { message: "Pole 'Przód' jest wymagane." })
    .max(200, { message: "Maksymalna długość to 200 znaków." }),
  back: z
    .string()
    .min(1, { message: "Pole 'Tył' jest wymagane." })
    .max(500, { message: "Maksymalna długość to 500 znaków." }),
});

export type FlashcardFormData = z.infer<typeof flashcardFormSchema>;
