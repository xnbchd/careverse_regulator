import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectionCountProps {
  count: number
  totalCount?: number
  onClear?: () => void
  className?: string
  showClear?: boolean
}

export function SelectionCount({
  count,
  totalCount,
  onClear,
  className,
  showClear = true,
}: SelectionCountProps) {
  if (count === 0) return null

  const displayText = totalCount ? `${count} of ${totalCount} selected` : `${count} selected`

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Badge variant="secondary" className="text-sm">
        {displayText}
      </Badge>
      {showClear && onClear && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-6 px-2"
          title="Clear selection"
        >
          <X className="w-3 h-3" />
        </Button>
      )}
    </div>
  )
}
