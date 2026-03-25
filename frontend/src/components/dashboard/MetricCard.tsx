import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type React from 'react'

export interface MetricCardProps {
  title: string
  value: number | string
  trend?: string
  icon?: React.ComponentType<{ className?: string }>
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  onClick?: () => void
  className?: string
}

const variantStyles = {
  success: 'bg-green-50 border-green-200 hover:bg-green-100 shadow-md dark:bg-green-950/40 dark:border-green-800 dark:hover:bg-green-950/60 dark:shadow-none',
  warning: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100 shadow-md dark:bg-yellow-950/40 dark:border-yellow-800 dark:hover:bg-yellow-950/60 dark:shadow-none',
  danger: 'bg-red-50 border-red-200 hover:bg-red-100 shadow-md dark:bg-red-950/40 dark:border-red-800 dark:hover:bg-red-950/60 dark:shadow-none',
  info: 'bg-blue-50 border-blue-200 hover:bg-blue-100 shadow-md dark:bg-blue-950/40 dark:border-blue-800 dark:hover:bg-blue-950/60 dark:shadow-none',
  neutral: 'bg-gray-50 border-gray-200 hover:bg-gray-100 shadow-md dark:bg-gray-900/40 dark:border-gray-700 dark:hover:bg-gray-900/60 dark:shadow-none',
}

const variantTextStyles = {
  success: 'text-green-700 dark:text-green-400',
  warning: 'text-yellow-700 dark:text-yellow-400',
  danger: 'text-red-700 dark:text-red-400',
  info: 'text-blue-700 dark:text-blue-400',
  neutral: 'text-gray-700 dark:text-gray-300',
}

const variantIconStyles = {
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  danger: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
  neutral: 'text-gray-600 dark:text-gray-400',
}

export function MetricCard({
  title,
  value,
  trend,
  icon: Icon,
  variant = 'neutral',
  onClick,
  className,
}: MetricCardProps) {
  const isClickable = !!onClick

  return (
    <Card
      className={cn(
        'transition-all duration-200',
        variantStyles[variant],
        isClickable && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-2">
              <h3
                className={cn(
                  'text-3xl font-bold',
                  variantTextStyles[variant]
                )}
              >
                {value}
              </h3>
              {trend && (
                <span
                  className={cn(
                    'text-sm font-medium',
                    trend.startsWith('+')
                      ? 'text-green-600'
                      : trend.startsWith('-')
                        ? 'text-red-600'
                        : 'text-muted-foreground'
                  )}
                >
                  {trend}
                </span>
              )}
            </div>
          </div>
          {Icon && (
            <div
              className={cn(
                'rounded-lg p-2',
                variantIconStyles[variant]
              )}
            >
              <Icon className="h-6 w-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
