import * as React from "react";

import { Button } from "../../hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../hig/Card";
import { Input } from "../../hig/Input";
import { Label } from "../../hig/Label";

export function LoginForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Zaloguj się</CardTitle>
        <CardDescription>Wprowadź swój e-mail, aby zalogować się na swoje konto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Hasło</Label>
            <a href="/reset-password" className="ml-auto inline-block text-sm underline">
              Nie pamiętasz hasła?
            </a>
          </div>
          <Input id="password" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Zaloguj się
        </Button>
      </CardContent>
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
