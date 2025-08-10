import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { Button } from "../../hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../hig/Card";
import { Input } from "../../hig/Input";
import { Label } from "../../hig/Label";
import { loginSchema } from "../../../lib/schemas/auth.schema";

type LoginFormInputs = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Logowanie nie powiodło się");
      }

      window.location.href = "/generate";
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
          <CardTitle>Zaloguj się</CardTitle>
          <CardDescription>Wprowadź swój e-mail, aby zalogować się na swoje konto.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              {...register("email")}
              data-testid="email-input"
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Hasło</Label>
              <a href="/reset-password" className="ml-auto inline-block text-sm underline">
                Nie pamiętasz hasła?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              {...register("password")}
              disabled={isLoading}
              data-testid="password-input"
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading} data-testid="login-button">
            {isLoading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </CardContent>
      </form>
      <CardFooter>
        <div className="text-center text-sm">
          Nie masz jeszcze konta?{" "}
          <a href="/register" className="underline">
            Zarejestruj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
