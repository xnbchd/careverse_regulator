import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type React from "react"

export interface QuickAction {
  label: string
  onClick: () => void
  variant?: "default" | "secondary" | "outline" | "ghost"
  icon?: React.ComponentType<{ className?: string }>
}

export interface QuickActionsProps {
  actions: QuickAction[]
  title?: string
}

export function QuickActions({ actions, title }: QuickActionsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {title && (
        <>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground shrink-0">
            {title}
          </span>
          <Separator orientation="vertical" className="h-4 shrink-0" />
        </>
      )}
      {actions.map((action, index) => {
        const Icon = action.icon
        return (
          <Button
            key={index}
            size="sm"
            onClick={action.onClick}
            variant={action.variant || "outline"}
            className="flex items-center gap-1.5 h-8"
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {action.label}
          </Button>
        )
      })}
    </div>
  )
}
