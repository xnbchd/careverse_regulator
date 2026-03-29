import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface ComplianceRateGaugeProps {
  compliantCount: number
  totalCount: number
  title?: string
  subtitle?: string
}

export function ComplianceRateGauge({
  compliantCount,
  totalCount,
  title = "Compliance Rate",
  subtitle,
}: ComplianceRateGaugeProps) {
  const rate = useMemo(() => {
    if (totalCount === 0) return 0
    return Math.round((compliantCount / totalCount) * 100)
  }, [compliantCount, totalCount])

  // Color based on compliance rate
  const color = useMemo(() => {
    if (rate >= 90) return "#10b981" // green
    if (rate >= 75) return "#f59e0b" // yellow
    return "#ef4444" // red
  }, [rate])

  const strokeDasharray = useMemo(() => {
    const circumference = 2 * Math.PI * 80
    const progress = (rate / 100) * circumference
    return `${progress} ${circumference}`
  }, [rate])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-6">
        <div className="relative w-48 h-48">
          {/* Background circle */}
          <svg className="transform -rotate-90 w-48 h-48">
            <circle cx="96" cy="96" r="80" stroke="#e5e7eb" strokeWidth="12" fill="none" />
            {/* Progress circle */}
            <circle
              cx="96"
              cy="96"
              r="80"
              stroke={color}
              strokeWidth="12"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              style={{
                transition: "stroke-dasharray 0.6s ease",
              }}
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color }}>
              {rate}%
            </span>
            <span className="text-sm text-muted-foreground mt-1">
              {compliantCount} of {totalCount}
            </span>
          </div>
        </div>
        {/* Legend */}
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground">
            {rate >= 90
              ? "Excellent compliance"
              : rate >= 75
                ? "Good compliance"
                : rate >= 50
                  ? "Needs improvement"
                  : "Critical attention required"}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
