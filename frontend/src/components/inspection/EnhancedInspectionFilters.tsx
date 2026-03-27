import { useState } from "react"
import { Search, X, Filter, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import dayjs from "dayjs"

interface EnhancedInspectionFiltersProps {
  search: string
  status: string[]
  dateRange: { start: string; end: string } | null
  onSearchChange: (search: string) => void
  onStatusChange: (status: string[]) => void
  onDateRangeChange: (range: { start: string; end: string } | null) => void
  onClearFilters: () => void
}

export default function EnhancedInspectionFilters({
  search,
  status,
  dateRange,
  onSearchChange,
  onStatusChange,
  onDateRangeChange,
  onClearFilters,
}: EnhancedInspectionFiltersProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [customStart, setCustomStart] = useState<Date | undefined>()
  const [customEnd, setCustomEnd] = useState<Date | undefined>()

  const hasActiveFilters = search || status.length > 0 || dateRange !== null

  const handleStatusToggle = (value: string) => {
    if (status.includes(value)) {
      onStatusChange(status.filter((s) => s !== value))
    } else {
      onStatusChange([...status, value])
    }
  }

  const handleQuickDateRange = (days: number) => {
    const end = dayjs().format("YYYY-MM-DD")
    const start = dayjs().subtract(days, "day").format("YYYY-MM-DD")
    onDateRangeChange({ start, end })
    setIsDatePickerOpen(false)
  }

  const handleCustomDateRange = () => {
    if (customStart && customEnd) {
      onDateRangeChange({
        start: dayjs(customStart).format("YYYY-MM-DD"),
        end: dayjs(customEnd).format("YYYY-MM-DD"),
      })
      setIsDatePickerOpen(false)
    }
  }

  const getDateRangeLabel = () => {
    if (!dateRange) return "Date Range"
    const start = dayjs(dateRange.start).format("MMM D")
    const end = dayjs(dateRange.end).format("MMM D, YYYY")
    return `${start} - ${end}`
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search inspections..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status Filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="w-4 h-4 mr-2" />
              Status
              {status.length > 0 && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  {status.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" align="start">
            <div className="space-y-2">
              <p className="text-sm font-medium mb-2">Filter by Status</p>
              {["Pending", "Completed", "Non Compliant"].map((s) => (
                <label key={s} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={status.includes(s)}
                    onChange={() => handleStatusToggle(s)}
                    className="w-4 h-4 rounded border-border"
                  />
                  <span className="text-sm">{s}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Date Range Filter */}
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-9">
              <Calendar className="w-4 h-4 mr-2" />
              {getDateRangeLabel()}
              {dateRange && (
                <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                  1
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Quick Select</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleQuickDateRange(7)}>
                    Last 7 days
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleQuickDateRange(30)}>
                    Last 30 days
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const start = dayjs().startOf("month").format("YYYY-MM-DD")
                      const end = dayjs().endOf("month").format("YYYY-MM-DD")
                      onDateRangeChange({ start, end })
                      setIsDatePickerOpen(false)
                    }}
                  >
                    This Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const start = dayjs()
                        .subtract(1, "month")
                        .startOf("month")
                        .format("YYYY-MM-DD")
                      const end = dayjs().subtract(1, "month").endOf("month").format("YYYY-MM-DD")
                      onDateRangeChange({ start, end })
                      setIsDatePickerOpen(false)
                    }}
                  >
                    Last Month
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Custom Range</p>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-muted-foreground">Start Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={customStart}
                      onSelect={setCustomStart}
                      className="rounded-md border"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">End Date</label>
                    <CalendarComponent
                      mode="single"
                      selected={customEnd}
                      onSelect={setCustomEnd}
                      className="rounded-md border"
                      disabled={(date) => !customStart || date < customStart}
                    />
                  </div>
                  <Button
                    onClick={handleCustomDateRange}
                    disabled={!customStart || !customEnd}
                    className="w-full"
                    size="sm"
                  >
                    Apply Custom Range
                  </Button>
                </div>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="h-9 ml-auto">
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filter Tags */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="gap-1">
              Search: "{search}"
              <button
                onClick={() => onSearchChange("")}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
          {status.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1">
              Status: {s}
              <button
                onClick={() => handleStatusToggle(s)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {dateRange && (
            <Badge variant="secondary" className="gap-1">
              {getDateRangeLabel()}
              <button
                onClick={() => onDateRangeChange(null)}
                className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  )
}
