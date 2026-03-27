import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export interface FilterTag {
  key: string
  label: string
  onRemove: () => void
}

interface FilterTagsProps {
  tags: FilterTag[]
  onClearAll?: () => void
}

export default function FilterTags({ tags, onClearAll }: FilterTagsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag.key}
          variant="outline"
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-sm bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-400"
        >
          {tag.label}
          <button
            onClick={(e) => {
              e.preventDefault()
              tag.onRemove()
            }}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove filter"
          >
            <X className="w-3 h-3" />
          </button>
        </Badge>
      ))}
      {onClearAll && tags.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-3 text-sm text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Clear All
        </Button>
      )}
    </div>
  )
}
