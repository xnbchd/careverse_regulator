import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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

export function QuickActions({ actions, title = "Quick Actions" }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || "default"}
                className="flex items-center gap-2"
              >
                {Icon && <Icon className="h-4 w-4" />}
                {action.label}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
