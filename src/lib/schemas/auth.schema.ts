import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres e-mail." }),
  password: z.string().min(1, { message: "Hasło jest wymagane." }),
});

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Nieprawidłowy adres e-mail." }),
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string().min(8, { message: "Potwierdzenie hasła musi mieć co najmniej 8 znaków." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Nieprawidłowy adres e-mail." }),
});

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, { message: "Hasło musi mieć co najmniej 8 znaków." }),
    confirmPassword: z.string().min(8, { message: "Potwierdzenie hasła musi mieć co najmniej 8 znaków." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są takie same.",
    path: ["confirmPassword"],
  });
