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
  return (
    <Card className="p-3">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search facilities..."
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>

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
