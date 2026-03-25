import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useMemo } from 'react'

export interface StatusData {
  status: string
  count: number
  color: string
}

export interface StatusDistributionProps {
  data: StatusData[]
  title?: string
  type?: 'pie' | 'bar'
  onSegmentClick?: (status: string) => void
}

export function StatusDistribution({
  data,
  title = 'Status Distribution',
  type = 'pie',
  onSegmentClick,
}: StatusDistributionProps) {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.count, 0),
    [data]
  )

  const maxCount = useMemo(
    () => Math.max(...data.map((item) => item.count)),
    [data]
  )

  if (type === 'bar') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.map((item) => {
              const percentage =
                total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
              const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0

              return (
                <div
                  key={item.status}
                  className={onSegmentClick ? 'cursor-pointer' : ''}
                  onClick={() => onSegmentClick?.(item.status)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{item.status}</span>
                    <span className="text-sm text-muted-foreground">
                      {item.count} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div
                      className="h-2.5 rounded-full transition-all duration-300"
                      style={{
                        width: `${width}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Pie chart implementation
  const segments = useMemo(() => {
    let currentAngle = -90 // Start from top
    return data.map((item) => {
      const percentage = total > 0 ? item.count / total : 0
      const angle = percentage * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      // Calculate path for pie slice
      const x1 = 100 + 80 * Math.cos((Math.PI * startAngle) / 180)
      const y1 = 100 + 80 * Math.sin((Math.PI * startAngle) / 180)
      const x2 = 100 + 80 * Math.cos((Math.PI * endAngle) / 180)
      const y2 = 100 + 80 * Math.sin((Math.PI * endAngle) / 180)
      const largeArc = angle > 180 ? 1 : 0

      return {
        ...item,
        percentage: (percentage * 100).toFixed(1),
        path:
          angle > 0
            ? `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
            : '',
      }
    })
  }, [data, total])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Pie Chart */}
          <svg viewBox="0 0 200 200" className="w-48 h-48">
            {segments.map((segment, index) =>
              segment.path ? (
                <path
                  key={index}
                  d={segment.path}
                  fill={segment.color}
                  className={
                    onSegmentClick
                      ? 'cursor-pointer hover:opacity-80 transition-opacity'
                      : ''
                  }
                  onClick={() => onSegmentClick?.(segment.status)}
                />
              ) : null
            )}
            {/* Center circle for donut effect */}
            <circle cx="100" cy="100" r="50" fill="white" />
            <text
              x="100"
              y="95"
              textAnchor="middle"
              className="text-2xl font-bold fill-foreground"
            >
              {total}
            </text>
            <text
              x="100"
              y="110"
              textAnchor="middle"
              className="text-xs fill-muted-foreground"
            >
              Total
            </text>
          </svg>

          {/* Legend */}
          <div className="flex-1 space-y-2">
            {segments.map((segment, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded ${
                  onSegmentClick
                    ? 'cursor-pointer hover:bg-muted/50'
                    : ''
                }`}
                onClick={() => onSegmentClick?.(segment.status)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: segment.color }}
                  />
                  <span className="text-sm font-medium">{segment.status}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {segment.count} ({segment.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
