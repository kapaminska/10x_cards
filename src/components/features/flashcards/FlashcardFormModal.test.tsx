import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import FlashcardFormModal from "./FlashcardFormModal";
import type { FlashcardFormState } from "./types";
import type { FlashcardDTO } from "@/types";

const mockOnSubmit = vi.fn();
const mockOnClose = vi.fn();

const defaultState: FlashcardFormState = {
  isOpen: true,
  isSubmitting: false,
  mode: "create",
  initialData: undefined, // Correctly typed as potentially undefined
};

const renderComponent = (props: Partial<FlashcardFormState> = {}) => {
  const state = { ...defaultState, ...props };
  return render(<FlashcardFormModal state={state} onClose={mockOnClose} onSubmit={mockOnSubmit} />);
};

describe("FlashcardFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render create form with correct title and empty fields", () => {
    renderComponent({ mode: "create" });
    expect(screen.getByText("Stwórz nową fiszkę")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Pytanie lub pojęcie...")).toHaveValue("");
    expect(screen.getByPlaceholderText("Odpowiedź lub definicja...")).toHaveValue("");
  });

  it("should render edit form with initial data", () => {
    const initialData: FlashcardDTO = {
      id: "1",
      front: "Initial Front",
      back: "Initial Back",
      source: "manual",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      generationId: null,
    };
    renderComponent({ mode: "edit", initialData });
    expect(screen.getByText("Edytuj fiszkę")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Pytanie lub pojęcie...")).toHaveValue(initialData.front);
    expect(screen.getByPlaceholderText("Odpowiedź lub definicja...")).toHaveValue(initialData.back);
  });

  it("should show validation errors for empty fields on submit", async () => {
    const user = userEvent.setup();
    renderComponent();
    const saveButton = screen.getByRole("button", { name: /zapisz/i });
    await user.click(saveButton);
    expect(await screen.findByText(/Pole 'Przód' jest wymagane/i)).toBeInTheDocument();
    expect(await screen.findByText(/Pole 'Tył' jest wymagane/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("should call onSubmit with form data when validation passes", async () => {
    const user = userEvent.setup();
    const expectedSubmitData = {
      front: "Test Front",
      back: "Test Back",
    };
    renderComponent({ mode: "create" });
    const frontInput = screen.getByPlaceholderText("Pytanie lub pojęcie...");
    const backInput = screen.getByPlaceholderText("Odpowiedź lub definicja...");
    const saveButton = screen.getByRole("button", { name: /zapisz/i });
    await user.type(frontInput, "Test Front");
    await user.type(backInput, "Test Back");
    await user.click(saveButton);
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining(expectedSubmitData), expect.anything());
    });
  });

  it("should call onClose when cancel button is clicked", async () => {
    const user = userEvent.setup();
    renderComponent();
    const cancelButton = screen.getByRole("button", { name: /anuluj/i });
    await user.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it("should disable submit button when isSubmitting is true", () => {
    renderComponent({ isSubmitting: true });
    const saveButton = screen.getByRole("button", { name: /zapisywanie/i });
    expect(saveButton).toBeDisabled();
  });
});
