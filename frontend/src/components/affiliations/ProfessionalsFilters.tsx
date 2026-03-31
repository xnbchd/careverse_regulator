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
import { Search, Filter, X, ArrowUpDown } from "lucide-react"

interface ProfessionalsFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedStatus: "all" | "active" | "inactive"
  onStatusChange: (status: "all" | "active" | "inactive") => void
  sortOrder: "asc" | "desc"
  onSortChange: (order: "asc" | "desc") => void
  activeFiltersCount: number
  onClearFilters: () => void
}

const statusLabels: Record<string, string> = {
  active: "Active",
  inactive: "Inactive",
}

const sortOptions = [
  { value: "asc", label: "Name A-Z" },
  { value: "desc", label: "Name Z-A" },
]

export default function ProfessionalsFilters({
  searchText,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  sortOrder,
  onSortChange,
  activeFiltersCount,
  onClearFilters,
}: ProfessionalsFiltersProps) {
  const activeStatusChip = selectedStatus !== "all" ? statusLabels[selectedStatus] : null
  const activeSortChip = sortOptions.find((o) => o.value === sortOrder) ?? null

  return (
    <div className="w-auto min-w-0">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search professionals..."
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2 shrink-0">
              <Filter className="h-4 w-4" />
              Status
              {selectedStatus !== "all" && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  1
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "all"}
              onCheckedChange={() => onStatusChange("all")}
            >
              All
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "active"}
              onCheckedChange={() => onStatusChange("active")}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={selectedStatus === "inactive"}
              onCheckedChange={() => onStatusChange("inactive")}
            >
              Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

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
                onCheckedChange={() => onSortChange(option.value as "asc" | "desc")}
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

      {/* Active filter chips */}
      {(activeStatusChip || activeSortChip) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {activeStatusChip && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 rounded-md"
            >
              {activeStatusChip}
              <button
                type="button"
                onClick={() => onStatusChange("all")}
                className="ml-0.5 hover:text-primary/70 transition-colors"
                aria-label="Remove status filter"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {activeSortChip && (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-muted text-muted-foreground border-border rounded-md"
            >
              Sort: {activeSortChip.label}
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
