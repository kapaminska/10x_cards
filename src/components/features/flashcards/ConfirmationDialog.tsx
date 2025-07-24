import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/hig/Dialog";
import { Button } from "@/components/hig/Button";
import type { DeleteConfirmationState } from "./types";

interface ConfirmationDialogProps {
  state: DeleteConfirmationState;
  onClose: () => void;
  onConfirm: () => void;
}

const ConfirmationDialog = ({ state, onClose, onConfirm }: ConfirmationDialogProps) => {
  return (
    <Dialog open={state.isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Czy jesteś pewien?</DialogTitle>
          <DialogDescription>
            Tej operacji nie można cofnąć. Fiszka zostanie trwale usunięta z Twojej kolekcji.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={state.isConfirming}>
            Anuluj
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={state.isConfirming}>
            {state.isConfirming ? "Usuwanie..." : "Usuń"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationDialog;
