import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface TrendDataPoint {
  label: string
  value: number
  color?: string
}

interface TrendChartProps {
  data: TrendDataPoint[]
  title: string
  subtitle?: string
  height?: number
  showGrid?: boolean
  showTrendLine?: boolean
  showAverage?: boolean
}

const PADDING_LEFT = 50
const PADDING_RIGHT = 20
const PADDING_TOP = 20
const PADDING_BOTTOM = 40

export function TrendChart({
  data,
  title,
  subtitle,
  height = 280,
  showGrid = true,
  showTrendLine = true,
  showAverage = true,
}: TrendChartProps) {
  // Use a wider viewBox for responsive scaling
  const SVG_WIDTH = 900
  const chartWidth = SVG_WIDTH - PADDING_LEFT - PADDING_RIGHT
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM

  const { pointsStr, gridLines, dataPoints, avgY, trendLineStart, trendLineEnd } = useMemo(() => {
    if (data.length === 0) {
      return {
        pointsStr: "",
        gridLines: [],
        dataPoints: [],
        avgY: 0,
        trendLineStart: { x: 0, y: 0 },
        trendLineEnd: { x: 0, y: 0 },
      }
    }

    const values = data.map((d) => d.value)
    const max = Math.max(...values, 1)
    const avg = values.reduce((a, b) => a + b, 0) / values.length

    const step = chartWidth / Math.max(data.length - 1, 1)

    const pts = data.map((point, index) => {
      const x = PADDING_LEFT + index * step
      const y = PADDING_TOP + chartHeight - (point.value / max) * chartHeight
      return { x, y, ...point }
    })

    const polylinePoints = pts.map((p) => `${p.x},${p.y}`).join(" ")

    // Average line Y position
    const averageY = PADDING_TOP + chartHeight - (avg / max) * chartHeight

    // Linear regression for trend line
    const n = values.length
    const xIndices = values.map((_, i) => i)
    const sumX = xIndices.reduce((a, b) => a + b, 0)
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = xIndices.reduce((sum, xi, i) => sum + xi * values[i], 0)
    const sumXX = xIndices.reduce((sum, xi) => sum + xi * xi, 0)

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const trendStart = {
      x: pts[0]?.x || PADDING_LEFT,
      y: PADDING_TOP + chartHeight - (intercept / max) * chartHeight,
    }
    const trendEnd = {
      x: pts[pts.length - 1]?.x || SVG_WIDTH - PADDING_RIGHT,
      y: PADDING_TOP + chartHeight - ((slope * (n - 1) + intercept) / max) * chartHeight,
    }

    const numGridLines = 5
    const lines = Array.from({ length: numGridLines }, (_, i) => {
      const y = PADDING_TOP + (chartHeight / (numGridLines - 1)) * i
      const value = max - (max / (numGridLines - 1)) * i
      return { y, value: Math.round(value) }
    })

    return {
      pointsStr: polylinePoints,
      gridLines: lines,
      dataPoints: pts,
      avgY: averageY,
      trendLineStart: trendStart,
      trendLineEnd: trendEnd,
    }
  }, [data, chartWidth, chartHeight])

  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{title}</CardTitle>
          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height }}>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="px-2 pb-4">
        <svg
          width="100%"
          viewBox={`0 0 ${SVG_WIDTH} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible"
        >
          {/* Grid lines */}
          {showGrid &&
            gridLines.map((line, index) => (
              <g key={index}>
                <line
                  x1={PADDING_LEFT}
                  y1={line.y}
                  x2={SVG_WIDTH - PADDING_RIGHT}
                  y2={line.y}
                  className="stroke-border"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                  opacity="0.5"
                />
                <text
                  x={PADDING_LEFT - 8}
                  y={line.y + 4}
                  fontSize="11"
                  className="fill-muted-foreground"
                  textAnchor="end"
                >
                  {line.value}
                </text>
              </g>
            ))}

          {/* Area fill */}
          {dataPoints.length > 1 && (
            <polygon
              points={`${dataPoints[0].x},${PADDING_TOP + chartHeight} ${pointsStr} ${
                dataPoints[dataPoints.length - 1].x
              },${PADDING_TOP + chartHeight}`}
              fill="url(#trendAreaGradient)"
            />
          )}

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Average line */}
          {showAverage && data.length > 1 && (
            <g>
              <line
                x1={PADDING_LEFT}
                y1={avgY}
                x2={SVG_WIDTH - PADDING_RIGHT}
                y2={avgY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6,4"
                opacity="0.6"
              />
              <text
                x={SVG_WIDTH - PADDING_RIGHT + 4}
                y={avgY + 4}
                fontSize="10"
                fill="#f59e0b"
                textAnchor="start"
                opacity="0.8"
              >
                avg
              </text>
            </g>
          )}

          {/* Trend line (linear regression) */}
          {showTrendLine && data.length > 1 && (
            <line
              x1={trendLineStart.x}
              y1={trendLineStart.y}
              x2={trendLineEnd.x}
              y2={trendLineEnd.y}
              stroke="#10b981"
              strokeWidth="1.5"
              strokeDasharray="8,4"
              opacity="0.6"
            />
          )}

          {/* Main line */}
          <polyline
            points={pointsStr}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {dataPoints.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="5"
                fill="#3b82f6"
                stroke="white"
                strokeWidth="2.5"
                className="drop-shadow-sm"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="14"
                fill="transparent"
                style={{ cursor: "pointer" }}
              >
                <title>{`${point.label}: ${point.value}`}</title>
              </circle>
            </g>
          ))}

          {/* X-axis labels */}
          {dataPoints.map((point, index) => {
            if (data.length > 12 && index % 2 !== 0) return null

            return (
              <text
                key={`label-${index}`}
                x={point.x}
                y={height - 8}
                fontSize="11"
                className="fill-muted-foreground"
                textAnchor="middle"
              >
                {point.label}
              </text>
            )
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5 mt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 bg-blue-500 rounded" />
            <span>Activity</span>
          </div>
          {showTrendLine && data.length > 1 && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-0.5 bg-emerald-500 rounded"
                style={{ borderTop: "1.5px dashed #10b981" }}
              />
              <span>Trend</span>
            </div>
          )}
          {showAverage && data.length > 1 && (
            <div className="flex items-center gap-1.5">
              <div
                className="w-3 h-0.5 bg-amber-500 rounded"
                style={{ borderTop: "1.5px dashed #f59e0b" }}
              />
              <span>Average</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
