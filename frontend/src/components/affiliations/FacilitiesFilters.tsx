import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Search, X, ArrowUpDown } from "lucide-react"

interface FacilitiesFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  sortOrder: "asc" | "desc" | "recent"
  onSortChange: (order: "asc" | "desc" | "recent") => void
  activeFiltersCount: number
  onClearFilters: () => void
}

const sortOptions = [
  { value: "recent", label: "Recently Updated" },
  { value: "asc", label: "Name A-Z" },
  { value: "desc", label: "Name Z-A" },
]

export default function FacilitiesFilters({
  searchText,
  onSearchChange,
  sortOrder,
  onSortChange,
  activeFiltersCount,
  onClearFilters,
}: FacilitiesFiltersProps) {
  const activeSortChip =
    sortOrder !== "recent" ? sortOptions.find((o) => o.value === sortOrder) : null

  return (
    <div className="w-auto min-w-0">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search facilities..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 shrink-0">
              <ArrowUpDown className="h-4 w-4" />
              {sortOptions.find((o) => o.value === sortOrder)?.label}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Sort By</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {sortOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={sortOrder === option.value}
                onCheckedChange={() => onSortChange(option.value as "asc" | "desc" | "recent")}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {activeFiltersCount > 0 && (
          <Button variant="ghost" onClick={onClearFilters} className="gap-2 shrink-0">
            <X className="h-4 w-4" />
            Clear ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Active sort chip */}
      {activeSortChip && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground border-border rounded-md"
          >
            Sort: {activeSortChip.label}
          </Badge>
        </div>
      )}
    </div>
  )
}
