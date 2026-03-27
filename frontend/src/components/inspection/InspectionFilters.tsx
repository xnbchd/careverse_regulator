import { useState } from "react"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import DateRangeSelector, { type DateRange } from "./DateRangeSelector"
import FilterTags, { type FilterTag } from "./FilterTags"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface InspectionFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortOrder: "asc" | "desc" | "recent"
  onSortChange: (order: "asc" | "desc" | "recent") => void
  dateRange: DateRange | null
  onDateRangeChange: (range: DateRange | null) => void
  activeFilterCount?: number
}

export default function InspectionFilters({
  searchText,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount = 0,
}: InspectionFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses)
  const { isMobile } = useResponsive()

  // Build filter tags
  const filterTags: FilterTag[] = []

  // Status filter tag
  if (!selectedStatuses.includes("all")) {
    const statusLabel =
      selectedStatuses[0] === "completed"
        ? "Completed"
        : selectedStatuses[0] === "non compliant"
        ? "Non Compliant"
        : "Pending"
    filterTags.push({
      key: "status",
      label: `Status: ${statusLabel}`,
      onRemove: () => onStatusChange(["all"]),
    })
  }

  // Date range filter tag
  if (dateRange) {
    filterTags.push({
      key: "date",
      label: dateRange.label,
      onRemove: () => onDateRangeChange(null),
    })
  }

  // Search filter tag
  if (searchText) {
    filterTags.push({
      key: "search",
      label: `Search: "${searchText}"`,
      onRemove: () => onSearchChange(""),
    })
  }

  const handleClearAllFilters = () => {
    onStatusChange(["all"])
    onDateRangeChange(null)
    onSearchChange("")
  }

  const handleApplyFilter = () => {
    onStatusChange(tempStatuses)
    setFilterOpen(false)
  }

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempStatuses(selectedStatuses)
    }
    setFilterOpen(open)
  }

  const filterContent = (
    <div className="w-[280px] p-2">
      <div className="mb-3">
        <div className="text-sm font-semibold mb-3 text-start">Filter by Status</div>
        <RadioGroup
          value={tempStatuses.includes("all") ? "all" : tempStatuses[0]}
          onValueChange={(value) => {
            if (value === "all") {
              setTempStatuses(["all"])
            } else {
              setTempStatuses([value])
            }
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex items-center gap-2">
            <RadioGroupItem value="all" id="status-all" />
            <Label htmlFor="status-all" className="cursor-pointer text-sm font-normal">
              All Statuses
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="completed" id="status-completed" />
            <Label htmlFor="status-completed" className="cursor-pointer text-sm font-normal">
              Completed
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="non compliant" id="status-non-compliant" />
            <Label htmlFor="status-non-compliant" className="cursor-pointer text-sm font-normal">
              Non Compliant
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="pending" id="status-pending" />
            <Label htmlFor="status-pending" className="cursor-pointer text-sm font-normal">
              Pending
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div className="flex gap-2 pt-2 border-t">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setTempStatuses(["all"])
            onStatusChange(["all"])
            setFilterOpen(false)
          }}
        >
          Clear
        </Button>
        <Button className="flex-1" onClick={handleApplyFilter}>
          Apply
        </Button>
      </div>
    </div>
  )

  const sortContent = (
    <div className="w-[220px] p-2">
      <div className="text-sm font-semibold mb-3 text-start">Sort by</div>
      <RadioGroup
        value={sortOrder}
        onValueChange={(value) => {
          onSortChange(value as "asc" | "desc" | "recent")
          setSortOpen(false)
        }}
        className="flex flex-col gap-3"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="asc" id="sort-asc" />
          <Label htmlFor="sort-asc" className="cursor-pointer text-sm font-normal">
            Facility Name (A-Z)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="desc" id="sort-desc" />
          <Label htmlFor="sort-desc" className="cursor-pointer text-sm font-normal">
            Facility Name (Z-A)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="recent" id="sort-recent" />
          <Label htmlFor="sort-recent" className="cursor-pointer text-sm font-normal">
            Most Recent
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  return (
    <div className={cn("w-full", !isMobile && "w-auto")}>
      {/* Filter Controls */}
      <div
        className={cn(
          "flex gap-2 items-center",
          isMobile ? "flex-col items-stretch" : "flex-row flex-wrap",
          filterTags.length > 0 && "mb-3"
        )}
      >
        <div className={cn("relative", isMobile ? "w-full" : "w-full sm:w-[400px]")}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            placeholder="Search by facility name"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9"
          />
        </div>
        <div className={cn("flex items-center", isMobile ? "gap-2 w-full" : "gap-2")}>
          <Popover open={filterOpen} onOpenChange={handleFilterOpenChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("gap-2 whitespace-nowrap", isMobile && "flex-1")}
              >
                <Filter className="w-4 h-4 shrink-0" />
                {!isMobile && <span>Filters</span>}
                {isMobile && <span className="text-xs">Filter</span>}
                {activeFilterCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-1 px-1.5 py-0 text-xs h-5 min-w-[20px] rounded-full"
                  >
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0">
              {filterContent}
            </PopoverContent>
          </Popover>

          <DateRangeSelector
            value={dateRange}
            onChange={onDateRangeChange}
            showLabel={false}
            className={isMobile ? "flex-1" : ""}
          />

          <Popover open={sortOpen} onOpenChange={setSortOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("gap-2 whitespace-nowrap", isMobile && "flex-1")}
              >
                <ArrowUpDown className="w-4 h-4 shrink-0" />
                {!isMobile && <span>Sort</span>}
                {isMobile && <span className="text-xs">Sort</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="p-0">
              {sortContent}
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Active Filter Tags */}
      <FilterTags
        tags={filterTags}
        onClearAll={filterTags.length > 1 ? handleClearAllFilters : undefined}
      />
    </div>
  )
}
