import { LogOut } from "lucide-react";
import * as React from "react";
import { Button } from "./Button";

export const LogoutButton = () => {
  return (
    <form method="POST" action="/api/auth/logout">
      <Button variant="ghost" type="submit" className="flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        <span>Wyloguj</span>
      </Button>
    </form>
  );
};
