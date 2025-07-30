import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { describe, it, expect } from "vitest";

describe("Button", () => {
  it("renders a button with the correct text", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });
});
