import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DocumentCategory, DocumentStatus, getCategoryLabel } from "@/types/document"
import type { DocumentSearchParams } from "@/types/document"

interface DocumentFiltersProps {
  searchParams: DocumentSearchParams
  onSearchChange: (params: Partial<DocumentSearchParams>) => void
  onClearFilters: () => void
}

export default function DocumentFilters({
  searchParams,
  onSearchChange,
  onClearFilters,
}: DocumentFiltersProps) {
  const hasFilters = searchParams.query || searchParams.category || searchParams.status

  return (
    <div className="flex flex-col md:flex-row gap-4">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search documents..."
          value={searchParams.query || ""}
          onChange={(e) => onSearchChange({ query: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Category Filter */}
      <Select
        value={searchParams.category || "all"}
        onValueChange={(val) =>
          onSearchChange({ category: val === "all" ? undefined : (val as DocumentCategory) })
        }
      >
        <SelectTrigger className="w-full md:w-[200px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {Object.values(DocumentCategory).map((cat) => (
            <SelectItem key={cat} value={cat}>
              {getCategoryLabel(cat)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status Filter */}
      <Select
        value={searchParams.status || "all"}
        onValueChange={(val) =>
          onSearchChange({ status: val === "all" ? undefined : (val as DocumentStatus) })
        }
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value={DocumentStatus.ACTIVE}>Active</SelectItem>
          <SelectItem value={DocumentStatus.ARCHIVED}>Archived</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select
        value={`${searchParams.sortBy || "uploadedAt"}_${searchParams.sortOrder || "desc"}`}
        onValueChange={(val) => {
          const [sortBy, sortOrder] = val.split("_")
          onSearchChange({
            sortBy: sortBy as any,
            sortOrder: sortOrder as "asc" | "desc",
          })
        }}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="uploadedAt_desc">Newest First</SelectItem>
          <SelectItem value="uploadedAt_asc">Oldest First</SelectItem>
          <SelectItem value="name_asc">Name (A-Z)</SelectItem>
          <SelectItem value="name_desc">Name (Z-A)</SelectItem>
          <SelectItem value="fileSize_desc">Largest First</SelectItem>
          <SelectItem value="fileSize_asc">Smallest First</SelectItem>
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button variant="outline" onClick={onClearFilters} className="shrink-0">
          <X className="w-4 h-4 mr-2" />
          Clear
        </Button>
      )}
    </div>
  )
}
