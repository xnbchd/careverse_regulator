import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  type TooltipProps,
} from "recharts"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export interface ChartRow {
  module: string
  active: number
  pending: number
  expired: number
  suspended: number
  inactive: number
}

export interface StatusDistributionChartProps {
  data: ChartRow[]
  loading?: boolean
  className?: string
}

// All colors via CSS custom properties — light + dark handled by index.css
const SEGMENTS = [
  { key: "active" as const, label: "Active", color: "var(--primary)" },
  { key: "pending" as const, label: "Pending", color: "var(--status-pending-dot)" },
  { key: "expired" as const, label: "Expired", color: "var(--status-expired-dot)" },
  { key: "suspended" as const, label: "Suspended", color: "var(--status-suspended-dot)" },
  { key: "inactive" as const, label: "Inactive", color: "var(--status-inactive-dot)" },
]

// Look up segment color by dataKey string — avoids relying on p.fill which is unreliable
// in stacked bar tooltip payloads
const segmentColorByKey = Object.fromEntries(SEGMENTS.map((s) => [s.key, s.color])) as Record<
  string,
  string
>

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null
  const total = payload.reduce((sum, p) => sum + (p.value ?? 0), 0)
  return (
    <div className="bg-popover border border-border rounded-md shadow-md px-3 py-2 text-xs min-w-[140px]">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p) => {
        const key = typeof p.dataKey === "string" ? p.dataKey : ""
        const color = segmentColorByKey[key] ?? "var(--muted-foreground)"
        return (
          <div key={key} className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: color }} />
            {p.name}: <span className="text-foreground font-medium ml-auto pl-2">{p.value}</span>
          </div>
        )
      })}
      <div className="border-t border-border mt-1 pt-1 text-foreground font-semibold">
        Total: {total}
      </div>
    </div>
  )
}

const CHART_ROW_HEIGHT = 36
const CHART_MIN_HEIGHT = 120

function truncateLabel(label: string, maxLen = 14): string {
  return label.length > maxLen ? `${label.slice(0, maxLen - 1)}…` : label
}

export function StatusDistributionChart({
  data,
  loading = false,
  className,
}: StatusDistributionChartProps) {
  // Derive height from number of rows to avoid cramping or dead space
  const chartHeight = Math.max(CHART_MIN_HEIGHT, data.length * CHART_ROW_HEIGHT)

  if (loading) {
    return (
      <div className={cn("space-y-3 py-2", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-3 w-20 flex-shrink-0" />
            <Skeleton className="h-5 flex-1 rounded" />
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <p className={cn("text-sm text-muted-foreground py-8 text-center", className)}>
        No data available
      </p>
    )
  }

  return (
    <div
      className={cn("w-full", className)}
      role="img"
      aria-label="Compliance status distribution by module"
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 8, bottom: 0, left: 0 }}
          barSize={20}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="module"
            width={96}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            tickFormatter={truncateLabel}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--muted)", opacity: 0.4 }} />
          {SEGMENTS.map((seg, index) => {
            // Apply right-side radius only to the last segment in the array
            // so the last rendered (rightmost) stack segment has rounded ends
            const isLast = index === SEGMENTS.length - 1
            return (
              <Bar
                key={seg.key}
                dataKey={seg.key}
                name={seg.label}
                stackId="a"
                fill={seg.color}
                radius={isLast ? [0, 3, 3, 0] : [0, 0, 0, 0]}
              />
            )
          })}
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
        {SEGMENTS.map((seg) => (
          <div key={seg.key} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-sm flex-shrink-0"
              style={{ background: seg.color }}
              aria-hidden="true"
            />
            <span className="text-[11px] text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
