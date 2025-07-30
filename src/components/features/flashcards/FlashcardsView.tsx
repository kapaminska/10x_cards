import { useEffect, useState } from "react";
import useFlashcards from "./useFlashcards";
import { Button } from "@/components/hig/Button";
import FlashcardsList from "./FlashcardsList";
import FlashcardFormModal from "./FlashcardFormModal";
import ConfirmationDialog from "./ConfirmationDialog";
import type { FlashcardFormState, DeleteConfirmationState } from "./types";
import type { FlashcardDTO } from "@/types";
import type { FlashcardFormData } from "@/lib/schemas/flashcard.schema";
import { Toaster, toast } from "sonner";
import FilterSortControls from "./FilterSortControls";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const FlashcardsView = () => {
  const {
    flashcards,
    isLoading,
    error,
    filters,
    sorting,
    fetchFlashcards,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    setFilters,
    setSorting,
    pagination,
    setPage,
  } = useFlashcards();

  const [formState, setFormState] = useState<FlashcardFormState>({
    isOpen: false,
    mode: "create",
    isSubmitting: false,
  });
  const [deleteState, setDeleteState] = useState<DeleteConfirmationState>({
    isOpen: false,
    isConfirming: false,
  });

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const handleOpenCreateModal = () => {
    setFormState({ isOpen: true, mode: "create", isSubmitting: false });
  };

  const handleOpenEditModal = (flashcard: FlashcardDTO) => {
    setFormState({
      isOpen: true,
      mode: "edit",
      isSubmitting: false,
      initialData: flashcard,
    });
  };

  const handleOpenDeleteDialog = (flashcardId: string) => {
    setDeleteState({ isOpen: true, isConfirming: false, flashcardId });
  };

  const handleCloseModals = () => {
    setFormState((s) => ({ ...s, isOpen: false }));
    setDeleteState((s) => ({ ...s, isOpen: false }));
  };

  const handleFormSubmit = async (data: FlashcardFormData) => {
    setFormState((s) => ({ ...s, isSubmitting: true }));
    try {
      if (formState.mode === "create") {
        await createFlashcard(data);
        toast.success("Fiszka została pomyślnie utworzona.");
      } else if (formState.initialData?.id) {
        await updateFlashcard(formState.initialData.id, data);
        toast.success("Fiszka została pomyślnie zaktualizowana.");
      }
      handleCloseModals();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setFormState((s) => ({ ...s, isSubmitting: false }));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteState.flashcardId) return;
    setDeleteState((s) => ({ ...s, isConfirming: true }));
    try {
      await deleteFlashcard(deleteState.flashcardId);
      toast.success("Fiszka została pomyślnie usunięta.");
      handleCloseModals();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setDeleteState((s) => ({ ...s, isConfirming: false }));
    }
  };

  return (
    <>
      <Toaster richColors />

      <header className="flex justify-between items-center py-4 mb-6 border-b">
        <div>
          <h1 className="text-2xl font-semibold">MOJE FISZKI</h1>
          <p className="text-muted-foreground mt-1">Zarządzaj swoją kolekcją fiszek.</p>
        </div>
        <Button onClick={handleOpenCreateModal}>Stwórz nową fiszkę</Button>
      </header>

      <div className="mb-6 flex justify-end">
        <FilterSortControls
          filterSource={filters.source || "all"}
          onFilterSourceChange={(source) => setFilters({ ...filters, source })}
          sortBy={sorting.sortBy}
          onSortByChange={(sortBy) => setSorting({ ...sorting, sortBy })}
        />
      </div>

      {error && <p className="text-red-500">Błąd: {error}</p>}

      <FlashcardsList
        flashcards={flashcards}
        isLoading={isLoading}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
      />

      <div className="mt-6 flex justify-center">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page > 1) {
                    setPage(pagination.page - 1);
                  }
                }}
                className={pagination.page <= 1 ? "pointer-events-none text-muted-foreground" : ""}
              />
            </PaginationItem>
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(i + 1);
                  }}
                  isActive={pagination.page === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={(e) => {
                  e.preventDefault();
                  if (pagination.page < pagination.totalPages) {
                    setPage(pagination.page + 1);
                  }
                }}
                className={pagination.page >= pagination.totalPages ? "pointer-events-none text-muted-foreground" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <FlashcardFormModal state={formState} onClose={handleCloseModals} onSubmit={handleFormSubmit} />
      <ConfirmationDialog state={deleteState} onClose={handleCloseModals} onConfirm={handleDeleteConfirm} />
    </>
  );
};

export default FlashcardsView;
