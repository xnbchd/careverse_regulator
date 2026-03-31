import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, type TooltipProps } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export interface DonutSegment {
  label: string
  value: number
  color: string
}

export interface ModuleStatusDonutProps {
  title: string
  segments: DonutSegment[]
  loading?: boolean
  className?: string
}

function DonutTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const item = payload[0]
  return (
    <div className="bg-popover border border-border rounded-md shadow-md px-3 py-2 text-xs min-w-[120px]">
      <div className="flex items-center gap-1.5">
        <span
          className="w-2 h-2 rounded-sm flex-shrink-0"
          style={{ background: item.payload?.color }}
        />
        <span className="text-foreground font-semibold">{item.name}</span>
      </div>
      <div className="text-muted-foreground mt-0.5">
        {(item.value ?? 0).toLocaleString()} record{item.value !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

export function ModuleStatusDonut({
  title,
  segments,
  loading = false,
  className,
}: ModuleStatusDonutProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)

  // When all values are 0, show a placeholder ring so the chart isn't empty
  const chartData =
    total === 0
      ? [{ label: "No data", value: 1, color: "var(--border)" }]
      : segments.filter((s) => s.value > 0)

  if (loading) {
    return (
      <Card className={cn("border border-border/60", className)}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-36 w-36 rounded-full mx-auto mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("border border-border/60", className)}>
      <CardHeader className="pb-0 pt-4 px-4">
        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-2">
        {/* Donut chart */}
        <div className="relative">
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={62}
                dataKey="value"
                nameKey="label"
                strokeWidth={2}
                stroke="var(--card)"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`${entry.label}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Centre total */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xl font-bold text-foreground tracking-tight leading-none">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wide">
              Total
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 mt-1">
          {segments
            .filter((s) => s.value > 0 || total === 0)
            .map((seg) => (
              <div key={seg.label} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="w-2 h-2 rounded-sm flex-shrink-0"
                    style={{ background: seg.color }}
                    aria-hidden="true"
                  />
                  <span className="text-xs text-muted-foreground truncate">{seg.label}</span>
                </div>
                <span className="text-xs font-semibold text-foreground tabular-nums flex-shrink-0">
                  {seg.value.toLocaleString()}
                </span>
              </div>
            ))}
          {total === 0 && (
            <p className="text-xs text-muted-foreground text-center pt-1">No data loaded</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
