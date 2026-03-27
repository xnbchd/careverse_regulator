import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { BookmarkPlus, Bookmark, Trash2, Save } from "lucide-react"
import { toast } from "sonner"

export interface SavedFilter<T = any> {
  id: string
  name: string
  filters: T
  createdAt: string
}

interface SavedFiltersManagerProps<T> {
  storageKey: string
  currentFilters: T
  onApplyFilters: (filters: T) => void
  getFilterSummary: (filters: T) => string
}

export default function SavedFiltersManager<T>({
  storageKey,
  currentFilters,
  onApplyFilters,
  getFilterSummary,
}: SavedFiltersManagerProps<T>) {
  const [savedFilters, setSavedFilters] = useState<SavedFilter<T>[]>([])
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [filterName, setFilterName] = useState("")

  // Load saved filters from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setSavedFilters(JSON.parse(stored))
      }
    } catch (error) {
      console.error("Failed to load saved filters:", error)
    }
  }, [storageKey])

  // Save filters to localStorage
  const persistFilters = (filters: SavedFilter<T>[]) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(filters))
      setSavedFilters(filters)
    } catch (error) {
      console.error("Failed to save filters:", error)
      toast.error("Could not save filter preset. Please try again.")
    }
  }

  const handleSaveFilter = () => {
    if (!filterName.trim()) {
      toast.error("Please enter a name for this filter preset.")
      return
    }

    const newFilter: SavedFilter<T> = {
      id: Date.now().toString(),
      name: filterName.trim(),
      filters: currentFilters,
      createdAt: new Date().toISOString(),
    }

    const updated = [...savedFilters, newFilter]
    persistFilters(updated)

    toast.success(`Filter preset "${filterName}" has been saved.`)

    setFilterName("")
    setShowSaveDialog(false)
  }

  const handleApplyFilter = (filter: SavedFilter<T>) => {
    onApplyFilters(filter.filters)
    toast.success(`Applied filter preset "${filter.name}".`)
  }

  const handleDeleteFilter = (filterId: string) => {
    const updated = savedFilters.filter((f) => f.id !== filterId)
    persistFilters(updated)
    toast.success("Filter preset has been removed.")
  }

  const hasActiveFilters = () => {
    const summary = getFilterSummary(currentFilters)
    return summary.trim().length > 0
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="default" className="gap-2 whitespace-nowrap">
            <Bookmark className="w-4 h-4" />
            <span>Saved Filters</span>
            {savedFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs h-5">
                {savedFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[300px]">
          {savedFilters.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No saved filter presets
            </div>
          ) : (
            <>
              {savedFilters.map((filter) => (
                <DropdownMenuItem
                  key={filter.id}
                  className="flex items-start justify-between gap-2 p-3 cursor-pointer"
                  onSelect={(e) => {
                    e.preventDefault()
                  }}
                >
                  <div className="flex-1 min-w-0" onClick={() => handleApplyFilter(filter)}>
                    <div className="font-medium text-sm mb-1">{filter.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {getFilterSummary(filter.filters)}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteFilter(filter.id)
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </Button>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onSelect={() => setShowSaveDialog(true)}
            disabled={!hasActiveFilters()}
            className="cursor-pointer"
          >
            <BookmarkPlus className="w-4 h-4 mr-2" />
            Save Current Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Save Filter Preset</DialogTitle>
            <DialogDescription>
              Give this filter preset a name to save it for future use.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filter-name">Preset Name</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="e.g., Pending Inspections Last 30 Days"
                maxLength={50}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveFilter()
                  }
                }}
              />
              <p className="text-xs text-muted-foreground">{filterName.length}/50 characters</p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-1">Current Filters:</p>
              <p className="text-sm">{getFilterSummary(currentFilters) || "No filters applied"}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFilter} disabled={!filterName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
