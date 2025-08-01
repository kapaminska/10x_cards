import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "../../hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../hig/Card";
import { Input } from "../../hig/Input";
import { Label } from "../../hig/Label";
import { registerSchema } from "../../../lib/schemas/auth.schema";

type RegisterFormInputs = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormInputs) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Rejestracja nie powiodła się.");
      }

      toast.success("Konto zostało pomyślnie utworzone! Możesz się teraz zalogować.");
      window.location.href = "/login";
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Zarejestruj się</CardTitle>
          <CardDescription>Wprowadź swoje dane, aby utworzyć konto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" placeholder="m@example.com" {...register("email")} disabled={isLoading} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Hasło</Label>
            <Input id="password" type="password" {...register("password")} disabled={isLoading} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
            <Input id="confirmPassword" type="password" {...register("confirmPassword")} disabled={isLoading} />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Tworzenie konta..." : "Utwórz konto"}
          </Button>
        </CardContent>
      </form>
      <CardFooter>
        <div className="text-center text-sm">
          Masz już konto?{" "}
          <a href="/login" className="underline">
            Zaloguj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
