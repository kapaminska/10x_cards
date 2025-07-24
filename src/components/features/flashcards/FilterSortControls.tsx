import * as React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    <div className="flex items-center space-x-4">
      <div>
        <label htmlFor="filter-source" className="text-sm font-medium mr-2">
          Źródło
        </label>
        <Select onValueChange={onFilterSourceChange} value={filterSource}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtruj wg źródła" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Wszystkie</SelectItem>
            <SelectItem value="manual">Ręczne</SelectItem>
            <SelectItem value="ai-full">AI (pełne)</SelectItem>
            <SelectItem value="ai-edited">AI (edytowane)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label htmlFor="sort-by" className="text-sm font-medium mr-2">
          Sortuj wg
        </label>
        <Select onValueChange={onSortByChange} value={sortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sortuj wg" />
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
