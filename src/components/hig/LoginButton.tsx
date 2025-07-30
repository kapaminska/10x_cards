import { LogIn } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";

export const LoginButton = () => {
  return (
    <a href="/login">
      <Button variant="ghost" className="flex items-center gap-2">
        <LogIn className="h-4 w-4" />
        <span>Zaloguj</span>
      </Button>
    </a>
  );
};
