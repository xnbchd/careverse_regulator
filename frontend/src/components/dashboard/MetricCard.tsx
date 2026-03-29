import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type React from "react"

export interface MetricCardProps {
  title: string
  value: number | string
  trend?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: "success" | "warning" | "danger" | "info" | "neutral"
  onClick?: () => void
  className?: string
}

const variantStyles = {
  success:
    "bg-gradient-to-br from-green-50 to-emerald-100/60 border-green-200 hover:from-green-100 hover:to-emerald-100 shadow-md dark:from-green-950/40 dark:to-emerald-950/30 dark:border-green-800 dark:hover:from-green-950/60 dark:hover:to-emerald-950/50 dark:shadow-none",
  warning:
    "bg-gradient-to-br from-yellow-50 to-amber-100/60 border-yellow-200 hover:from-yellow-100 hover:to-amber-100 shadow-md dark:from-yellow-950/40 dark:to-amber-950/30 dark:border-yellow-800 dark:hover:from-yellow-950/60 dark:hover:to-amber-950/50 dark:shadow-none",
  danger:
    "bg-gradient-to-br from-red-50 to-rose-100/60 border-red-200 hover:from-red-100 hover:to-rose-100 shadow-md dark:from-red-950/40 dark:to-rose-950/30 dark:border-red-800 dark:hover:from-red-950/60 dark:hover:to-rose-950/50 dark:shadow-none",
  info: "bg-gradient-to-br from-blue-50 to-sky-100/60 border-blue-200 hover:from-blue-100 hover:to-sky-100 shadow-md dark:from-blue-950/40 dark:to-sky-950/30 dark:border-blue-800 dark:hover:from-blue-950/60 dark:hover:to-sky-950/50 dark:shadow-none",
  neutral:
    "bg-gradient-to-br from-gray-50 to-slate-100/60 border-gray-200 hover:from-gray-100 hover:to-slate-100 shadow-md dark:from-gray-900/40 dark:to-slate-900/30 dark:border-gray-700 dark:hover:from-gray-900/60 dark:hover:to-slate-900/50 dark:shadow-none",
}

const variantTextStyles = {
  success: "text-green-700 dark:text-green-400",
  warning: "text-yellow-700 dark:text-yellow-400",
  danger: "text-red-700 dark:text-red-400",
  info: "text-blue-700 dark:text-blue-400",
  neutral: "text-gray-700 dark:text-gray-300",
}

const variantIconStyles = {
  success: "text-green-600 dark:text-green-400",
  warning: "text-yellow-600 dark:text-yellow-400",
  danger: "text-red-600 dark:text-red-400",
  info: "text-blue-600 dark:text-blue-400",
  neutral: "text-gray-600 dark:text-gray-400",
}

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  variant = "neutral",
  onClick,
  className,
}: MetricCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        variantStyles[variant],
        isClickable && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
              <h3 className={cn("text-3xl font-bold", variantTextStyles[variant])}>{value}</h3>
              {trend && (
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend.startsWith("+")
                      ? "text-green-600"
                      : trend.startsWith("-")
                        ? "text-red-600"
                        : "text-muted-foreground"
                  )}
                >
                  {trend}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div className={cn("rounded-lg p-2", variantIconStyles[variant])}>
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
