import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface VisualFindingsBadgeProps {
  critical: number
  major: number
  minor: number
  className?: string
}

export default function VisualFindingsBadge({
  critical,
  major,
  minor,
  className,
}: VisualFindingsBadgeProps) {
  const total = critical + major + minor

  if (total === 0) {
    return <span className={cn("text-sm text-muted-foreground", className)}>No findings</span>
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("flex items-center gap-1", className)}>
            {/* Critical bars */}
            {Array.from({ length: Math.min(critical, 5) }).map((_, i) => (
              <div key={`critical-${i}`} className="w-1.5 h-4 bg-red-500 rounded-sm" />
            ))}
            {/* Major bars */}
            {Array.from({ length: Math.min(major, 5) }).map((_, i) => (
              <div key={`major-${i}`} className="w-1.5 h-4 bg-orange-500 rounded-sm" />
            ))}
            {/* Minor bars */}
            {Array.from({ length: Math.min(minor, 5) }).map((_, i) => (
              <div key={`minor-${i}`} className="w-1.5 h-4 bg-yellow-500 rounded-sm" />
            ))}
            <span className="text-sm ml-1">{total}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            {critical > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-sm" />
                <span>{critical} Critical</span>
              </div>
            )}
            {major > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-sm" />
                <span>{major} Major</span>
              </div>
            )}
            {minor > 0 && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-sm" />
                <span>{minor} Minor</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
