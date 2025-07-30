import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/hig/Select";
import type { FlashcardSource } from "@/types";

type SortBy = "created_at" | "updated_at";

interface FilterSortControlsProps {
  filterSource: FlashcardSource | "all";
  onFilterSourceChange: (value: FlashcardSource | "all") => void;
  sortBy: SortBy;
  onSortByChange: (value: SortBy) => void;
}

const FilterSortControls: React.FC<FilterSortControlsProps> = ({
  filterSource,
  onFilterSourceChange,
  sortBy,
  onSortByChange,
}) => {
  return (
    <div className="flex items-center gap-4 text-sm">
      <div className="flex items-center gap-2">
        <label htmlFor="filter-source" className="text-muted-foreground">
          Źródło:
        </label>
        <Select onValueChange={onFilterSourceChange} value={filterSource}>
          <SelectTrigger className="w-auto h-8 text-xs border-none bg-transparent shadow-none focus:ring-0">
            <SelectValue placeholder="Wybierz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="manual">Ręczne</SelectItem>
            <SelectItem value="ai-full">AI (pełne)</SelectItem>
            <SelectItem value="ai-edited">AI (edytowane)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label htmlFor="sort-by" className="text-muted-foreground">
          Sortuj:
        </label>
        <Select onValueChange={onSortByChange} value={sortBy}>
          <SelectTrigger className="w-auto h-8 text-xs border-none bg-transparent shadow-none focus:ring-0">
            <SelectValue placeholder="Wybierz" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">Data utworzenia</SelectItem>
            <SelectItem value="updated_at">Data modyfikacji</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default FilterSortControls;
