import { useState, useCallback } from "react";
import type { FlashcardsViewState } from "./types";
import type { FlashcardsListResponse } from "@/types";
import type { FlashcardFormData } from "@/lib/schemas/flashcard.schema";

const useFlashcards = () => {
  const [state, setState] = useState<FlashcardsViewState>({
    flashcards: [],
    pagination: {
      page: 1,
      limit: 10,
      totalItems: 0,
      totalPages: 1,
    },
    isLoading: true,
    error: null,
    filters: {},
    sorting: {
      sortBy: "created_at",
      order: "desc",
    },
  });

  const fetchFlashcards = useCallback(async () => {
    setState((s) => ({ ...s, isLoading: true, error: null }));
    try {
      const params = new URLSearchParams({
        page: state.pagination.page.toString(),
        limit: state.pagination.limit.toString(),
        sort: state.sorting.sortBy,
        order: state.sorting.order,
      });

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch flashcards");
      }
      const data: FlashcardsListResponse = await response.json();
      setState((s) => ({
        ...s,
        flashcards: data.data,
        pagination: data.pagination,
        isLoading: false,
      }));
    } catch (error) {
      setState((s) => ({ ...s, isLoading: false, error: (error as Error).message }));
    }
  }, [state.pagination.page, state.pagination.limit, state.sorting.sortBy, state.sorting.order]);

  const createFlashcard = async (formData: FlashcardFormData) => {
    const response = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Nie udało się utworzyć fiszki.");
    }

    await fetchFlashcards();
  };

  const updateFlashcard = async (id: string, formData: FlashcardFormData) => {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Nie udało się zaktualizować fiszki.");
    }

    await fetchFlashcards();
  };

  const deleteFlashcard = async (id: string) => {
    const response = await fetch(`/api/flashcards/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Nie udało się usunąć fiszki.");
    }

    await fetchFlashcards();
  };

  const setFilters = (filters: FlashcardsViewState["filters"]) => {
    setState((s) => ({ ...s, filters }));
  };
  const setSorting = (sorting: FlashcardsViewState["sorting"]) => {
    setState((s) => ({ ...s, sorting }));
  };
  const setPage = (page: number) => {
    setState((s) => ({ ...s, pagination: { ...s.pagination, page } }));
  };

  return {
    ...state,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setFilters,
    setSorting,
    setPage,
  };
};

export default useFlashcards;
