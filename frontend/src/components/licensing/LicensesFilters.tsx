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

interface LicensesFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortOrder: "asc" | "desc" | "recent"
  onSortChange: (order: "asc" | "desc" | "recent") => void
  activeFiltersCount: number
  onClearFilters: () => void
}

const statusOptions = [
  { value: "all", label: "All Statuses" },
  { value: "Active", label: "Active" },
  { value: "Expired", label: "Expired" },
  { value: "Suspended", label: "Suspended" },
  { value: "Denied", label: "Denied" },
  { value: "Pending", label: "Pending" },
  { value: "In Review", label: "In Review" },
  { value: "Renewal Reviewed", label: "Renewal Reviewed" },
  { value: "Approved", label: "Approved" },
  { value: "Info Requested", label: "Info Requested" },
]

const sortOptions = [
  { value: "recent", label: "Expiring Soon" },
  { value: "asc", label: "License # A-Z" },
  { value: "desc", label: "License # Z-A" },
]

export default function LicensesFilters({
  searchText,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  activeFiltersCount,
  onClearFilters,
}: LicensesFiltersProps) {
  const handleStatusToggle = (value: string) => {
    if (value === "all") {
      onStatusChange(["all"])
    } else {
      const newStatuses = selectedStatuses.includes(value)
        ? selectedStatuses.filter((s) => s !== value && s !== "all")
        : [...selectedStatuses.filter((s) => s !== "all"), value]
      onStatusChange(newStatuses.length === 0 ? ["all"] : newStatuses)
    }
  }

  const activeStatusChips = selectedStatuses.filter((s) => s !== "all")
  const activeSortChip =
    sortOrder !== "recent" ? sortOptions.find((o) => o.value === sortOrder) : null

  return (
    <div className="w-auto min-w-0">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search licenses, facilities, or owners..."
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
              {activeStatusChips.length > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                  {activeStatusChips.length}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={selectedStatuses.includes(option.value)}
                onCheckedChange={() => handleStatusToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
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

      {/* Active filter chips */}
      {(activeStatusChips.length > 0 || activeSortChip) && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {activeStatusChips.map((status) => (
            <Badge
              key={status}
              variant="outline"
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-primary/10 text-primary border-primary/20 rounded-md"
            >
              {status}
              <button
                type="button"
                onClick={() => handleStatusToggle(status)}
                className="ml-0.5 hover:text-primary/70 transition-colors"
                aria-label={`Remove ${status} filter`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
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
