import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { GenerationSuggestionsResponseDto } from "@/types";
import { useGenerationManager } from "./useGenerationManager";

// Mock window.alert
window.alert = vi.fn();

// Mock successful generation response
const mockGenerationResponse: GenerationSuggestionsResponseDto = {
  generationId: "gen-123",
  generationCount: 1,
  flashcardsSuggestions: [
    { front: "Q1", back: "A1", source: "ai-full" },
    { front: "Q2", back: "A2", source: "ai-full" },
    { front: "Q3", back: "A3", source: "ai-full" },
    { front: "Q4", back: "A4", source: "ai-full" },
  ],
};

// Mock fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

// Mock crypto.randomUUID
let idCounter = 0;
const mockRandomUUID = vi.fn(() => `uuid-${++idCounter}`);
vi.stubGlobal("crypto", {
  ...global.crypto,
  randomUUID: mockRandomUUID,
});

describe("useGenerationManager hook", () => {
  beforeEach(() => {
    mockFetch.mockReset();
    mockRandomUUID.mockClear();
    idCounter = 0;
  });

  it("should generate suggestions successfully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGenerationResponse,
    });
    const { result } = renderHook(() => useGenerationManager());

    act(() => {
      result.current.setSourceText("Some source text");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.apiState).toBe("success");
    expect(result.current.suggestions).toHaveLength(4);
    expect(result.current.suggestions[0]).toEqual({
      id: "uuid-1",
      front: "Q1",
      back: "A1",
      source: "ai-full",
      status: "new",
    });
    expect(result.current.generationId).toBe("gen-123");
  });

  it("should handle generation failure", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "AI model unavailable" }),
    });
    const { result } = renderHook(() => useGenerationManager());

    act(() => {
      result.current.setSourceText("Some text");
    });

    await act(async () => {
      await result.current.handleGenerate();
    });

    expect(result.current.apiState).toBe("error");
    expect(result.current.errorMessage).toBe("AI model unavailable");
    expect(result.current.suggestions).toHaveLength(0);
  });

  it("should update a single suggestion", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGenerationResponse,
    });
    const { result } = renderHook(() => useGenerationManager());

    await act(async () => {
      await result.current.handleGenerate();
    });

    act(() => {
      result.current.handleUpdateSuggestion("uuid-1", { status: "accepted" });
    });

    expect(result.current.suggestions[0].status).toBe("accepted");

    act(() => {
      result.current.handleUpdateSuggestion("uuid-1", { front: "Updated Q1" });
    });

    expect(result.current.suggestions[0].front).toBe("Updated Q1");
  });

  it("should save accepted and edited suggestions", async () => {
    // Mock the generation call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGenerationResponse,
    });
    // Mock the batch save call
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    const { result } = renderHook(() => useGenerationManager());

    // 1. Generate suggestions
    await act(async () => {
      await result.current.handleGenerate();
    });

    // 2. Update suggestions' status
    act(() => {
      result.current.handleUpdateSuggestion("uuid-1", { status: "accepted" });
      result.current.handleUpdateSuggestion("uuid-2", { status: "edited", front: "Q2-edited" });
      result.current.handleUpdateSuggestion("uuid-3", { status: "rejected" });
    });

    // 3. Save the batch
    await act(async () => {
      await result.current.handleSaveBatch();
    });

    // 4. Assertions
    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBeNull();
    await waitFor(() => {
      expect(result.current.suggestions).toHaveLength(0);
    });

    const batchCall = mockFetch.mock.calls[1]; // The second call is the batch save
    const command = JSON.parse(batchCall[1]?.body as string);

    expect(batchCall[0]).toBe("/api/flashcards/batch");
    expect(command.generationId).toBe("gen-123");
    expect(command.acceptedCards).toHaveLength(2);
    expect(command.acceptedCards[0]).toEqual({ front: "Q1", back: "A1", source: "ai-full" });
    expect(command.acceptedCards[1]).toEqual({ front: "Q2-edited", back: "A2", source: "ai-edited" });
    expect(command.rejectedCount).toBe(1);
  });

  it("should handle saving failure", async () => {
    // Mock the generation call
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockGenerationResponse,
    });
    // Mock the batch save call to fail
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: "Failed to save batch" }),
    });
    const { result } = renderHook(() => useGenerationManager());

    // 1. Generate suggestions
    await act(async () => {
      await result.current.handleGenerate();
    });

    // 2. Update a suggestion to be saved
    act(() => {
      result.current.handleUpdateSuggestion("uuid-1", { status: "accepted" });
    });

    // 3. Save the batch
    await act(async () => {
      await result.current.handleSaveBatch();
    });

    expect(result.current.isSaving).toBe(false);
    expect(result.current.saveError).toBe("Failed to save batch");
    expect(result.current.suggestions).toHaveLength(4); // Suggestions are not cleared on failure
  });
});
