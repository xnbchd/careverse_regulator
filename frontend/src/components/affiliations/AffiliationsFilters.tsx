import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
import { cn } from "@/lib/utils"

interface AffiliationsFiltersProps {
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
  { value: "Pending", label: "Pending" },
  { value: "Inactive", label: "Inactive" },
  { value: "Rejected", label: "Rejected" },
]

const sortOptions = [
  { value: "recent", label: "Recent First" },
  { value: "asc", label: "Name A-Z" },
  { value: "desc", label: "Name Z-A" },
]

export default function AffiliationsFilters({
  searchText,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  activeFiltersCount,
  onClearFilters,
}: AffiliationsFiltersProps) {
  const handleStatusToggle = (value: string) => {
    if (value === "all") {
      onStatusChange(["all"])
    } else {
      const newStatuses = selectedStatuses.includes(value)
        ? selectedStatuses.filter((s) => s !== value && s !== "all")
        : [...selectedStatuses.filter((s) => s !== "all"), value]

      if (newStatuses.length === 0) {
        onStatusChange(["all"])
      } else {
        onStatusChange(newStatuses)
      }
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search professionals, facilities, or registration numbers..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="h-4 w-4" />
                Status
                {!selectedStatuses.includes("all") && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {selectedStatuses.length}
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

          {/* Sort Order */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
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

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <Button variant="ghost" onClick={onClearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
