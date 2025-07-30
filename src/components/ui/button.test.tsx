// src/components/ui/button.test.tsx

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button component", () => {
  it("should render correctly with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Sprawdza domyślne klasy wariantów
    expect(button).toHaveClass("bg-primary text-primary-foreground");
    expect(button).toHaveClass("h-9 px-4 py-2");
  });

  it("should apply variant and size classes correctly", () => {
    render(
      <Button variant="destructive" size="lg">
        Delete
      </Button>
    );
    const button = screen.getByRole("button", { name: /delete/i });
    expect(button).toHaveClass("bg-destructive text-white"); // Wariant 'destructive'
    expect(button).toHaveClass("h-10 rounded-md px-6"); // Rozmiar 'lg'
  });

  it("should handle onClick event", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button onClick={handleClick} disabled>
        Click me
      </Button>
    );

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(button).toBeDisabled();
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("should render as a child component when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/#">Link button</a>
      </Button>
    );

    const linkButton = screen.getByRole("link", { name: /link button/i });
    expect(linkButton).toBeInTheDocument();
    // Sprawdza, czy element <a> ma klasy przycisku
    expect(linkButton).toHaveClass("bg-primary text-primary-foreground");
  });

  it("should match inline snapshot for a complex setup", () => {
    const { container } = render(
      <Button variant="outline" size="icon" aria-label="Add to cart">
        <svg />
      </Button>
    );
    // Użycie snapshotu do weryfikacji złożonej struktury DOM
    // To jest zgodne z "Use inline snapshots for readable assertions"
    expect(container.firstChild).toMatchInlineSnapshot(`
      <button
        aria-label="Add to cart"
        class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50 size-9"
        data-slot="button"
      >
        <svg />
      </button>
    `);
  });
});
