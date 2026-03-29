import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import type { ComplianceMetrics } from "@/stores/analyticsStore"
import { Clock, AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

interface ComplianceOverviewProps {
  metrics: ComplianceMetrics
}

export default function ComplianceOverview({ metrics }: ComplianceOverviewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Compliance Overview</CardTitle>
        <CardDescription>Key performance indicators and compliance status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Compliance Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">Overall Compliance Rate</span>
            </div>
            <span className="text-lg font-bold">{metrics.complianceRate}%</span>
          </div>
          <Progress value={metrics.complianceRate} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {metrics.complianceRate >= 90
              ? "Excellent compliance performance"
              : metrics.complianceRate >= 75
                ? "Good compliance performance"
                : "Needs improvement"}
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Avg Processing Time</span>
            </div>
            <div className="text-2xl font-bold">{metrics.averageProcessingTime} days</div>
            <p className="text-xs text-muted-foreground">Target: ≤ 14 days</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-medium">Pending Actions</span>
            </div>
            <div className="text-2xl font-bold">{metrics.pendingActions}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Overdue Inspections</span>
            </div>
            <div className="text-2xl font-bold">{metrics.overdueInspections}</div>
            <p className="text-xs text-muted-foreground">Immediate action needed</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Compliance Score</span>
            </div>
            <div className="text-2xl font-bold">
              {metrics.complianceRate >= 90
                ? "A"
                : metrics.complianceRate >= 80
                  ? "B"
                  : metrics.complianceRate >= 70
                    ? "C"
                    : "D"}
            </div>
            <p className="text-xs text-muted-foreground">
              {metrics.complianceRate >= 90
                ? "Excellent"
                : metrics.complianceRate >= 80
                  ? "Good"
                  : metrics.complianceRate >= 70
                    ? "Fair"
                    : "Poor"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
