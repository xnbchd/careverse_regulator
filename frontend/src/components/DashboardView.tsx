import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Progress } from "@/components/ui/progress"
import { useDashboardStore } from "@/stores/dashboardStore"
import { cn } from "@/lib/utils"

interface DashboardViewProps {
  emptyState: boolean
  onNavigate: (route: string) => void
  company?: string | null
}

function trendIcon(trend: "up" | "down" | "neutral") {
  if (trend === "up") return <ArrowUp className="w-4 h-4" />
  if (trend === "down") return <ArrowDown className="w-4 h-4" />
  return <ArrowRight className="w-4 h-4" />
}

function queueToneClass(tone: "critical" | "attention" | "steady") {
  if (tone === "critical") return "critical"
  if (tone === "attention") return "attention"
  return "steady"
}

function countyToneClass(level: "Critical" | "High" | "Moderate" | "Stable") {
  if (level === "Critical") return "critical"
  if (level === "High") return "high"
  if (level === "Moderate") return "moderate"
  return "stable"
}

export default function DashboardView({ emptyState, onNavigate, company }: DashboardViewProps) {
  const { priorityQueues, recentActivity, companyBoards, countyRiskItems } = useDashboardStore()

  const visibleQueues = priorityQueues.slice(0, 4)
  const visibleActivity = recentActivity.slice(0, 4)
  const activeBoard = companyBoards[0]
  const visibleCountyRisk = countyRiskItems.slice(0, 3)

  const tenantLabel = company || activeBoard?.unitName || "Company not configured"
  const companyMetrics = [
    {
      id: "renewals",
      title: "Renewals pending",
      value: activeBoard?.pendingRenewals || "--",
      delta: `${visibleQueues.length} queue items`,
      trend: "up" as const,
    },
    {
      id: "cases",
      title: "Active cases",
      value: activeBoard?.activeCases || "--",
      delta: "Enforcement and discipline",
      trend: "neutral" as const,
    },
    {
      id: "sla",
      title: "SLA compliance",
      value: activeBoard ? `${activeBoard.slaCompliance}%` : "--",
      delta: activeBoard ? `${activeBoard.inspectionBacklog} inspection backlog` : "No board data",
      trend: activeBoard && activeBoard.slaCompliance < 75 ? ("down" as const) : ("up" as const),
    },
  ]

  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-6">
            <div className="space-y-2 min-w-0 flex-1">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                Active company
              </span>
              <h3 className="text-2xl font-semibold tracking-tight truncate">{tenantLabel}</h3>
              <p className="text-sm text-muted-foreground">
                Licensing, inspection, and enforcement queues in one operational view.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => onNavigate("license-management")}>Open licensing queue</Button>
              <Button variant="outline" onClick={() => onNavigate("affiliations")}>
                Review affiliations
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              className="flex flex-col items-start p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors text-left min-w-0"
              onClick={() => onNavigate(activeBoard?.route || "license-management")}
            >
              <span className="text-sm text-muted-foreground mb-1 truncate w-full">
                Pending renewals
              </span>
              <strong className="text-2xl font-bold mb-1">
                {activeBoard?.pendingRenewals || "--"}
              </strong>
              <em className="text-xs text-muted-foreground not-italic truncate w-full">
                {activeBoard?.unitName || "Active company unit"}
              </em>
            </button>
            <button
              type="button"
              className="flex flex-col items-start p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors text-left min-w-0"
              onClick={() => onNavigate("users-roles")}
            >
              <span className="text-sm text-muted-foreground mb-1 truncate w-full">
                Active cases
              </span>
              <strong className="text-2xl font-bold mb-1">
                {activeBoard?.activeCases || "--"}
              </strong>
              <em className="text-xs text-muted-foreground not-italic truncate w-full">
                Enforcement and discipline
              </em>
            </button>
            <button
              type="button"
              className="flex flex-col items-start p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors text-left min-w-0"
              onClick={() => onNavigate("dashboard")}
            >
              <span className="text-sm text-muted-foreground mb-1 truncate w-full">
                SLA compliance
              </span>
              <strong className="text-2xl font-bold mb-1">
                {activeBoard ? `${activeBoard.slaCompliance}%` : "--"}
              </strong>
              <em className="text-xs text-muted-foreground not-italic truncate w-full">
                Operational throughput
              </em>
            </button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {companyMetrics.map((metric) => (
          <Card key={metric.id} className="bg-card/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground truncate">{metric.title}</p>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-sm",
                    metric.trend === "up" && "text-green-600 dark:text-green-400",
                    metric.trend === "down" && "text-red-600 dark:text-red-400",
                    metric.trend === "neutral" && "text-muted-foreground"
                  )}
                >
                  {trendIcon(metric.trend)}
                  <span className="truncate">{metric.delta}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {emptyState ? (
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </EmptyMedia>
                <EmptyTitle>No dashboard data connected yet</EmptyTitle>
                <EmptyDescription>Connect your data sources to see insights here.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-3">
            <Card className="xl:col-span-3 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Priority queues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {visibleQueues.length > 0 ? (
                  visibleQueues.map((queue) => (
                    <button
                      key={queue.id}
                      type="button"
                      className={cn(
                        "w-full flex items-center justify-between p-4 rounded-lg border transition-colors text-left",
                        queue.tone === "critical" &&
                          "border-red-500/50 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30",
                        queue.tone === "attention" &&
                          "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30",
                        queue.tone === "steady" && "border-border bg-background hover:bg-accent"
                      )}
                      onClick={() => onNavigate(queue.route)}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">{queue.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{queue.detail}</p>
                      </div>
                      <span className="text-lg font-bold shrink-0 ml-2">{queue.value}</span>
                    </button>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border border-border bg-background">
                    <p className="font-semibold text-sm mb-1">
                      No queue items in this company context
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Once applications are loaded for this company, queue items will appear here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="xl:col-span-2 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Risk watch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {visibleCountyRisk.length > 0 ? (
                  visibleCountyRisk.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "w-full p-4 rounded-lg border transition-colors text-left space-y-2",
                        item.riskLevel === "Critical" &&
                          "border-red-500/50 bg-red-50 dark:bg-red-950/20 hover:bg-red-100 dark:hover:bg-red-950/30",
                        item.riskLevel === "High" &&
                          "border-orange-500/50 bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30",
                        item.riskLevel === "Moderate" &&
                          "border-yellow-500/50 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30",
                        item.riskLevel === "Stable" &&
                          "border-green-500/50 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/30"
                      )}
                      onClick={() => onNavigate(item.route)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm truncate min-w-0 flex-1">
                          {item.county}
                        </p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-background/50 shrink-0">
                          {item.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.openInvestigations}
                      </p>
                      <Progress value={item.complianceRate} className="h-1.5" />
                    </button>
                  ))
                ) : (
                  <div className="p-4 rounded-lg border border-border bg-background">
                    <p className="font-semibold text-sm mb-1">
                      No county risk items for this company
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Risk watch will populate once company data is linked.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-lg">Recent activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {visibleActivity.length > 0 ? (
                visibleActivity.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="w-full flex items-center justify-between p-4 rounded-lg border border-border bg-background hover:bg-accent transition-colors text-left"
                    onClick={() => onNavigate(item.route)}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="font-semibold text-sm truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0 ml-2">{item.time}</span>
                  </button>
                ))
              ) : (
                <div className="p-4 rounded-lg border border-border bg-background">
                  <p className="font-semibold text-sm mb-1">
                    No recent activity in this company context
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Operational events will appear here once this company starts processing cases.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
