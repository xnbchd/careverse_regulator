import { useState } from "react"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import DateRangeSelector, { type DateRange } from "./DateRangeSelector"
import FilterTags, { type FilterTag } from "./FilterTags"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FindingsFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedSeverities: string[]
  onSeverityChange: (severities: string[]) => void
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortOrder: "asc" | "desc" | "recent"
  onSortChange: (order: "asc" | "desc" | "recent") => void
  dateRange: DateRange | null
  onDateRangeChange: (range: DateRange | null) => void
  activeFilterCount?: number
}

export default function FindingsFilters({
  searchText,
  onSearchChange,
  selectedSeverities,
  onSeverityChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount = 0,
}: FindingsFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [tempSeverities, setTempSeverities] = useState(selectedSeverities)
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses)
  const { isMobile } = useResponsive()

  // Build filter tags
  const filterTags: FilterTag[] = []

  // Severity filter tags
  if (!selectedSeverities.includes("all")) {
    selectedSeverities.forEach((severity) => {
      if (severity !== "all") {
        const label = severity.charAt(0).toUpperCase() + severity.slice(1)
        filterTags.push({
          key: `severity-${severity}`,
          label: `Severity: ${label}`,
          onRemove: () => {
            const newSeverities = selectedSeverities.filter((s) => s !== severity)
            onSeverityChange(newSeverities.length === 0 ? ["all"] : newSeverities)
          },
        })
      }
    })
  }

  // Status filter tags
  if (!selectedStatuses.includes("all")) {
    selectedStatuses.forEach((status) => {
      if (status !== "all") {
        const label = status.charAt(0).toUpperCase() + status.slice(1)
        filterTags.push({
          key: `status-${status}`,
          label: `Status: ${label}`,
          onRemove: () => {
            const newStatuses = selectedStatuses.filter((s) => s !== status)
            onStatusChange(newStatuses.length === 0 ? ["all"] : newStatuses)
          },
        })
      }
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
    onSeverityChange(["all"])
    onStatusChange(["all"])
    onDateRangeChange(null)
    onSearchChange("")
  }

  const handleApplyFilter = () => {
    onSeverityChange(tempSeverities)
    onStatusChange(tempStatuses)
    setFilterOpen(false)
  }

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempSeverities(selectedSeverities)
      setTempStatuses(selectedStatuses)
    }
    setFilterOpen(open)
  }

  const handleSeverityToggle = (severity: string) => {
    if (severity === "all") {
      setTempSeverities(["all"])
    } else {
      const newSeverities = tempSeverities.includes(severity)
        ? tempSeverities.filter((s) => s !== severity)
        : [...tempSeverities.filter((s) => s !== "all"), severity]
      setTempSeverities(newSeverities.length === 0 ? ["all"] : newSeverities)
    }
  }

  const handleStatusToggle = (status: string) => {
    if (status === "all") {
      setTempStatuses(["all"])
    } else {
      const newStatuses = tempStatuses.includes(status)
        ? tempStatuses.filter((s) => s !== status)
        : [...tempStatuses.filter((s) => s !== "all"), status]
      setTempStatuses(newStatuses.length === 0 ? ["all"] : newStatuses)
    }
  }

  const filterContent = (
    <div className="w-[280px] p-2">
      <div className="mb-4">
        <div className="text-sm font-semibold mb-3 text-start">Filter by Severity</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="severity-all"
              checked={tempSeverities.includes("all")}
              onCheckedChange={() => handleSeverityToggle("all")}
            />
            <Label htmlFor="severity-all" className="cursor-pointer text-sm font-normal">
              All Severities
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="severity-critical"
              checked={tempSeverities.includes("critical")}
              onCheckedChange={() => handleSeverityToggle("critical")}
            />
            <Label htmlFor="severity-critical" className="cursor-pointer text-sm font-normal">
              Critical
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="severity-major"
              checked={tempSeverities.includes("major")}
              onCheckedChange={() => handleSeverityToggle("major")}
            />
            <Label htmlFor="severity-major" className="cursor-pointer text-sm font-normal">
              Major
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="severity-minor"
              checked={tempSeverities.includes("minor")}
              onCheckedChange={() => handleSeverityToggle("minor")}
            />
            <Label htmlFor="severity-minor" className="cursor-pointer text-sm font-normal">
              Minor
            </Label>
          </div>
        </div>
      </div>

      <div className="mb-3 pt-3 border-t">
        <div className="text-sm font-semibold mb-3 text-start">Filter by Status</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-all"
              checked={tempStatuses.includes("all")}
              onCheckedChange={() => handleStatusToggle("all")}
            />
            <Label htmlFor="status-all" className="cursor-pointer text-sm font-normal">
              All Statuses
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-open"
              checked={tempStatuses.includes("open")}
              onCheckedChange={() => handleStatusToggle("open")}
            />
            <Label htmlFor="status-open" className="cursor-pointer text-sm font-normal">
              Open
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-in-progress"
              checked={tempStatuses.includes("in progress")}
              onCheckedChange={() => handleStatusToggle("in progress")}
            />
            <Label htmlFor="status-in-progress" className="cursor-pointer text-sm font-normal">
              In Progress
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="status-resolved"
              checked={tempStatuses.includes("resolved")}
              onCheckedChange={() => handleStatusToggle("resolved")}
            />
            <Label htmlFor="status-resolved" className="cursor-pointer text-sm font-normal">
              Resolved
            </Label>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-3 border-t">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => {
            setTempSeverities(["all"])
            setTempStatuses(["all"])
            onSeverityChange(["all"])
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
          <RadioGroupItem value="asc" id="findings-sort-asc" />
          <Label htmlFor="findings-sort-asc" className="cursor-pointer text-sm font-normal">
            Facility Name (A-Z)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="desc" id="findings-sort-desc" />
          <Label htmlFor="findings-sort-desc" className="cursor-pointer text-sm font-normal">
            Facility Name (Z-A)
          </Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="recent" id="findings-sort-recent" />
          <Label htmlFor="findings-sort-recent" className="cursor-pointer text-sm font-normal">
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

          <div className={cn(isMobile && "flex-1")}>
            <DateRangeSelector value={dateRange} onChange={onDateRangeChange} showLabel={false} />
          </div>

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
