import * as React from "react";

import { Button } from "../../hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../hig/Card";
import { Input } from "../../hig/Input";
import { Label } from "../../hig/Label";

export function RegisterForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Zarejestruj się</CardTitle>
        <CardDescription>Wprowadź swoje dane, aby utworzyć konto.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Hasło</Label>
          <Input id="password" type="password" required />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
          <Input id="confirmPassword" type="password" required />
        </div>
        <Button type="submit" className="w-full">
          Utwórz konto
        </Button>
      </CardContent>
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
