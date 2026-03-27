import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  isMobile?: boolean
}

export default function PaginationControls({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  isMobile,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null
  }

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  const pageNumbers = []
  const maxVisible = isMobile ? 3 : 5
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2))
  const end = Math.min(totalPages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i)
  }

  const startItem = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-border",
        isMobile ? "mt-6 pt-3" : "mt-6 pt-4"
      )}
    >
      <div className={cn("text-muted-foreground", isMobile ? "text-xs" : "text-sm")}>
        Showing {startItem} to {endItem} of {totalCount} results
      </div>

      <div className="flex gap-2 items-center">
        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          disabled={!hasPrev}
          onClick={() => onPageChange(currentPage - 1)}
          className={cn("px-2", isMobile ? "h-8" : "h-9")}
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        {start > 1 && (
          <>
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => onPageChange(1)}
              className={cn("min-w-8", isMobile ? "h-8" : "h-9")}
            >
              1
            </Button>
            {start > 2 && <span className="px-1">...</span>}
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            variant={pageNum === currentPage ? "default" : "outline"}
            size={isMobile ? "sm" : "default"}
            onClick={() => onPageChange(pageNum)}
            className={cn("min-w-8", isMobile ? "h-8" : "h-9")}
          >
            {pageNum}
          </Button>
        ))}

        {end < totalPages && (
          <>
            {end < totalPages - 1 && <span className="px-1">...</span>}
            <Button
              variant="outline"
              size={isMobile ? "sm" : "default"}
              onClick={() => onPageChange(totalPages)}
              className={cn("min-w-8", isMobile ? "h-8" : "h-9")}
            >
              {totalPages}
            </Button>
          </>
        )}

        <Button
          variant="outline"
          size={isMobile ? "sm" : "default"}
          disabled={!hasNext}
          onClick={() => onPageChange(currentPage + 1)}
          className={cn("px-2", isMobile ? "h-8" : "h-9")}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
