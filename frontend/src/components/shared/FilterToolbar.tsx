import { useRef, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface FilterChip {
  label: string
  value: string
  count?: number
  active: boolean
}

export interface FilterToolbarProps {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: FilterChip[]
  onFilterChange?: (value: string) => void
  resultCount?: number
  className?: string
}

export function FilterToolbar({
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  filters = [],
  onFilterChange,
  resultCount,
  className,
}: FilterToolbarProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  // Cleanup pending debounce on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current)
  }, [])

  const handleSearch = (val: string) => {
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onSearchChange(val), 300)
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap py-3", className)}>
      {/* Search input — controlled: mirrors searchValue from parent */}
      <div className="relative">
        <Search
          className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-8 h-8 w-52 text-sm"
        />
      </div>

      {/* Filter chips */}
      {filters.map((chip) => (
        <button
          key={chip.value}
          type="button"
          aria-pressed={chip.active}
          onClick={() => onFilterChange?.(chip.value)}
          className={cn(
            "inline-flex items-center gap-1 h-8 px-3 rounded-full border text-xs font-medium transition-colors",
            chip.active
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-background text-muted-foreground border-border hover:bg-muted/60 hover:text-foreground"
          )}
        >
          {chip.label}
          {chip.count !== undefined && (
            <span className={cn("ml-0.5", chip.active ? "text-primary" : "text-muted-foreground")}>
              ({chip.count})
            </span>
          )}
        </button>
      ))}

      {/* Result count */}
      {resultCount !== undefined && (
        <span className="ml-auto text-xs text-muted-foreground">
          {resultCount.toLocaleString()} record{resultCount !== 1 ? "s" : ""}
        </span>
      )}
    </div>
  )
}
