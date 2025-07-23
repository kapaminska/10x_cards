import React, { useState } from "react";
import type { SuggestionViewModel } from "./types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Check, Edit, Trash, X, Save } from "lucide-react";

interface SuggestionCardProps {
  suggestion: SuggestionViewModel;
  onUpdate: (id: string, data: Partial<SuggestionViewModel>) => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ suggestion, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedFront, setEditedFront] = useState(suggestion.front);
  const [editedBack, setEditedBack] = useState(suggestion.back);

  const handleSave = () => {
    onUpdate(suggestion.id, {
      front: editedFront,
      back: editedBack,
      status: "edited",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedFront(suggestion.front);
    setEditedBack(suggestion.back);
    setIsEditing(false);
  };

  const statusStyles = {
    new: "border-transparent",
    accepted: "border-green-500",
    edited: "border-blue-500",
    rejected: "border-red-500 opacity-60",
  };

  return (
    <div className={cn("p-4 rounded-lg border-2 bg-card shadow-sm transition-all", statusStyles[suggestion.status])}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isEditing ? (
          <>
            <Textarea value={editedFront} onChange={(e) => setEditedFront(e.target.value)} className="min-h-[100px]" />
            <Textarea value={editedBack} onChange={(e) => setEditedBack(e.target.value)} className="min-h-[100px]" />
          </>
        ) : (
          <>
            <p className="font-semibold">{suggestion.front}</p>
            <p>{suggestion.back}</p>
          </>
        )}
      </div>
      <div className="flex items-center justify-end space-x-2 mt-4">
        {isEditing ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Save className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" onClick={() => onUpdate(suggestion.id, { status: "accepted" })}>
              <Check className="h-4 w-4 text-green-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 text-blue-500" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onUpdate(suggestion.id, { status: "rejected" })}>
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default SuggestionCard;
