import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { FlashcardsListResponse } from "@/types";
import useFlashcards from "./useFlashcards";

// Mock successful fetch response
const mockFlashcardsResponse: FlashcardsListResponse = {
  data: [
    {
      id: "1",
      front: "Q1",
      back: "A1",
      source: "manual",
      createdAt: "2023-01-01T12:00:00Z",
      updatedAt: "2023-01-01T12:00:00Z",
      generationId: null,
    },
    {
      id: "2",
      front: "Q2",
      back: "A2",
      source: "ai-full",
      createdAt: "2023-01-02T12:00:00Z",
      updatedAt: "2023-01-02T12:00:00Z",
      generationId: null,
    },
  ],
  pagination: {
    page: 1,
    limit: 9,
    totalItems: 2,
    totalPages: 1,
  },
};

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("useFlashcards hook", () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockFetch.mockReset();
  });

  it("should have correct initial state", () => {
    const { result } = renderHook(() => useFlashcards());

    expect(result.current.flashcards).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.page).toBe(1);
  });

  it("should fetch flashcards and update state on success", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlashcardsResponse,
    });

    const { result } = renderHook(() => useFlashcards());

    await act(async () => {
      await result.current.fetchFlashcards();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.flashcards).toHaveLength(2);
    expect(result.current.flashcards[0].front).toBe("Q1");
    expect(result.current.pagination.totalItems).toBe(2);
  });

  it("should handle fetch error correctly", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: { message: "Failed to fetch" } }),
    });

    const { result } = renderHook(() => useFlashcards());

    await act(async () => {
      await result.current.fetchFlashcards();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.flashcards).toEqual([]);
    expect(result.current.error).toContain("Failed to fetch flashcards");
  });

  it("should update filters and reset page to 1", async () => {
    const { result } = renderHook(() => useFlashcards());

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.pagination.page).toBe(5);

    act(() => {
      result.current.setFilters({ source: "manual" });
    });

    expect(result.current.filters.source).toBe("manual");
    expect(result.current.pagination.page).toBe(1);
  });

  it("should call fetch with correct params when filtering", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockFlashcardsResponse,
    });
    const { result } = renderHook(() => useFlashcards());

    act(() => {
      result.current.setFilters({ source: "ai-full" });
    });

    await act(async () => {
      await result.current.fetchFlashcards();
    });

    const fetchCall = mockFetch.mock.calls[0][0] as string;
    const params = new URL(fetchCall, "http://localhost").searchParams;

    expect(params.get("source")).toBe("ai-full");
    expect(params.get("page")).toBe("1");
  });

  it("should delete a flashcard and refetch the list", async () => {
    // First fetch for the list
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockFlashcardsResponse,
    });
    // Second fetch for the delete call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    // Third fetch for the refetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockFlashcardsResponse,
        data: [mockFlashcardsResponse.data[1]],
      }), // Return only one item
    });

    const { result } = renderHook(() => useFlashcards());

    // initial fetch
    await act(async () => {
      await result.current.fetchFlashcards();
    });
    expect(result.current.flashcards).toHaveLength(2);

    // delete
    await act(async () => {
      await result.current.deleteFlashcard("1");
    });

    const deleteCall = mockFetch.mock.calls[1];
    expect(deleteCall[0]).toBe("/api/flashcards/1");
    expect(deleteCall[1]?.method).toBe("DELETE");

    // check if list was refetched and updated
    expect(mockFetch).toHaveBeenCalledTimes(3);
    expect(result.current.flashcards).toHaveLength(1);
    expect(result.current.flashcards[0].id).toBe("2");
  });
});
