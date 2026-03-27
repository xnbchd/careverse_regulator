import { useNavigate, getRouteApi } from "@tanstack/react-router"
import {
  MetricCard,
  StatusDistribution,
  PrioritySection,
  RecentActivity,
  QuickActions,
  ComplianceRateGauge,
  TrendChart,
} from "@/components/dashboard"
import { CheckCircle, Clock, AlertTriangle, FileText, List, Calendar } from "lucide-react"
import { differenceInDays } from "date-fns"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
import { Button } from "@/components/ui/button"
import type { DashboardStats } from "@/api/inspectionApi"

dayjs.extend(customParseFormat)

const routeApi = getRouteApi("/inspections/")

export function InspectionsDashboard() {
  const navigate = useNavigate()
  const dashboardData = routeApi.useLoaderData() as DashboardStats

  // Quick actions
  const quickActions = [
    {
      label: "View All Inspections",
      onClick: () => navigate({ to: "/inspections/list" }),
      variant: "default" as const,
      icon: List,
    },
    {
      label: "Review Overdue",
      onClick: () => navigate({ to: "/inspections/list", search: { status: "Pending" } }),
      variant: "secondary" as const,
      icon: AlertTriangle,
    },
    {
      label: "Schedule Inspection",
      onClick: () => navigate({ to: "/inspections/list", search: { modal: "schedule" } }),
      variant: "outline" as const,
      icon: Calendar,
    },
  ]

  const renderUpcomingItem = (item: DashboardStats["upcoming_inspections"][0]) => {
    const scheduledDate = dayjs(item.scheduled_date, "YYYY-MM-DD").toDate()
    const daysUntilDue = differenceInDays(scheduledDate, new Date())
    const isValidDate = !isNaN(daysUntilDue)

    return (
      <div className="flex items-center justify-between gap-4 py-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground truncate">{item.facility_name}</p>
            {isValidDate && (
              <span
                className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                  daysUntilDue === 0
                    ? "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                    : daysUntilDue <= 3
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50 dark:text-orange-400"
                    : "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400"
                }`}
              >
                {daysUntilDue === 0
                  ? "Today"
                  : daysUntilDue === 1
                  ? "Tomorrow"
                  : `${daysUntilDue}d`}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate({ to: "/inspections/list" })}
          className="shrink-0"
        >
          View
        </Button>
      </div>
    )
  }

  // Recent activity mapping
  const recentActivityItems =
    dashboardData?.recent_activity.map((item) => ({
      id: item.name,
      type: "completed" as const,
      description: `Inspection at ${item.facility_name} completed${
        item.finding_count > 0 ? ` with ${item.finding_count} finding(s)` : ""
      }`,
      timestamp: item.inspected_date || item.scheduled_date, // ISO format works with new Date()
      status: item.status,
    })) || []

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Inspections Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor facility inspections and track compliance status
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} title="Quick Actions" />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Due This Week"
          value={dashboardData?.metrics.due_soon || 0}
          variant="warning"
          icon={Clock}
          onClick={() => navigate({ to: "/inspections/list", search: { status: "Pending" } })}
        />
        <MetricCard
          title="Completed"
          value={dashboardData?.metrics.completed || 0}
          variant="success"
          icon={CheckCircle}
          onClick={() => navigate({ to: "/inspections/list", search: { status: "Completed" } })}
        />
        <MetricCard
          title="Non-Compliant"
          value={dashboardData?.metrics.non_compliant || 0}
          variant="danger"
          icon={AlertTriangle}
          onClick={() => navigate({ to: "/inspections/list", search: { status: "Non Compliant" } })}
        />
        <MetricCard
          title="Overdue"
          value={dashboardData?.metrics.overdue || 0}
          variant="danger"
          icon={Clock}
          onClick={() => navigate({ to: "/inspections/list", search: { status: "Pending" } })}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ComplianceRateGauge
          compliantCount={dashboardData?.compliance_rate.compliant || 0}
          totalCount={dashboardData?.compliance_rate.total || 0}
          title="Overall Compliance Rate"
          subtitle="Completed inspections without violations"
        />
        <div className="lg:col-span-2">
          <TrendChart
            data={dashboardData?.trend_data || []}
            title="Inspection Activity Trend"
            subtitle="Last 6 months"
            height={240}
          />
        </div>
      </div>

      {/* Upcoming Inspections */}
      <PrioritySection
        title="Next Upcoming Inspections"
        items={dashboardData?.upcoming_inspections || []}
        renderItem={renderUpcomingItem}
        onViewAll={() => navigate({ to: "/inspections/list", search: { status: "Pending" } })}
        emptyMessage="No upcoming inspections scheduled"
      />

      {/* Recent Activity */}
      {recentActivityItems.length > 0 && (
        <RecentActivity activities={recentActivityItems} title="Recent Activity" />
      )}
    </div>
  )
}
