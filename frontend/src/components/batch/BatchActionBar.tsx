import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export interface BatchAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
  variant?: "default" | "destructive" | "outline" | "secondary"
  disabled?: boolean
}

interface BatchActionBarProps {
  selectedCount: number
  actions: BatchAction[]
  onClearSelection: () => void
  className?: string
  position?: "top" | "bottom"
}

export function BatchActionBar({
  selectedCount,
  actions,
  onClearSelection,
  className,
  position = "bottom",
}: BatchActionBarProps) {
  const isVisible = selectedCount > 0

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: position === "bottom" ? 100 : -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: position === "bottom" ? 100 : -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className={cn(
            "fixed left-1/2 transform -translate-x-1/2 z-50",
            position === "bottom" ? "bottom-6" : "top-20",
            "bg-background border border-border rounded-lg shadow-lg",
            "flex items-center gap-3 px-4 py-3",
            className
          )}
        >
          {/* Selection count */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedCount} selected
            </Badge>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant || "default"}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className="gap-2"
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Clear selection button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="gap-2"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
            Clear
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
