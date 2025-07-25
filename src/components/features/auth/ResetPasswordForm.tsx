import * as React from "react";

import { Button } from "../../hig/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../hig/Card";
import { Input } from "../../hig/Input";
import { Label } from "../../hig/Label";

export function ResetPasswordForm() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Zresetuj hasło</CardTitle>
        <CardDescription>Podaj swój adres e-mail, a wyślemy Ci link do zresetowania hasła.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" type="email" placeholder="m@example.com" required />
        </div>
        <Button type="submit" className="w-full">
          Wyślij link do resetowania hasła
        </Button>
      </CardContent>
      <CardFooter>
        <div className="text-center text-sm">
          Pamiętasz swoje hasło?{" "}
          <a href="/login" className="underline">
            Zaloguj się
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
