import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { PaginationMeta } from "@/types/inspection"

interface PaginationControlsProps {
  pagination: PaginationMeta | null
  onPageChange: (page: number) => void
  isMobile?: boolean
}

export default function PaginationControls({
  pagination,
  onPageChange,
  isMobile,
}: PaginationControlsProps) {
  if (!pagination || pagination.total_pages <= 1) {
    return null
  }

  const { page, total_pages, has_prev, has_next, total_count } = pagination

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Showing {total_count > 0 ? (page - 1) * pagination.page_size + 1 : 0} to{" "}
        {Math.min(page * pagination.page_size, total_count)} of {total_count} results
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          Page {page} of {total_pages}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(1)}
            disabled={!has_prev}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(page - 1)}
            disabled={!has_prev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(page + 1)}
            disabled={!has_next}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => onPageChange(total_pages)}
            disabled={!has_next}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
