import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { DeleteConfirmationState } from "./types";

interface ConfirmationDialogProps {
  state: DeleteConfirmationState;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({ state, onClose, onConfirm }: ConfirmationDialogProps) => {
  return (
    <AlertDialog open={state.isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Czy jesteś pewien?</AlertDialogTitle>
          <AlertDialogDescription>
            Tej operacji nie można cofnąć. Fiszka zostanie trwale usunięta z Twojej kolekcji.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} disabled={state.isConfirming}>
            Anuluj
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={state.isConfirming}>
            {state.isConfirming ? "Usuwanie..." : "Usuń"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
