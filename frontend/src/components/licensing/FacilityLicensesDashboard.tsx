import { useNavigate, getRouteApi } from "@tanstack/react-router"
import {
  MetricCard,
  StatusDistribution,
  PrioritySection,
  QuickActions,
} from "@/components/dashboard"
import {
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  FileText,
  List,
  ShieldCheck,
} from "lucide-react"
import { differenceInDays } from "date-fns"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { LicenseDashboardStats } from "@/api/licensingApi"

const routeApi = getRouteApi("/license-management/")

export function FacilityLicensesDashboard() {
  const navigate = useNavigate()
  const { dashboardStats: dashboardData } = routeApi.useLoaderData() as {
    dashboardStats: LicenseDashboardStats
  }

  const totalLicenses = dashboardData?.metrics.total || 0
  const activeLicenses = dashboardData?.metrics.active || 0
  const complianceRate = totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0

  // Quick actions
  const quickActions = [
    {
      label: "View All Licenses",
      onClick: () => navigate({ to: "/license-management/licenses" }),
      variant: "default" as const,
      icon: List,
    },
    {
      label: "Review Expiring",
      onClick: () => navigate({ to: "/license-management/licenses" }),
      variant: "secondary" as const,
      icon: Clock,
    },
    {
      label: "View Applications",
      onClick: () => navigate({ to: "/license-management/applications" }),
      variant: "outline" as const,
      icon: FileText,
    },
  ]

  const renderExpiringItem = (item: LicenseDashboardStats["expiring_licenses"][0]) => {
    const daysUntilExpiry = differenceInDays(
      dayjs(item.date_of_expiry, "YYYY-MM-DD").toDate(),
      new Date()
    )

    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{item.owner}</p>
          <p className="text-sm text-muted-foreground truncate">
            License #{item.license_number} • {item.facility_type}
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
            Expires in {daysUntilExpiry} day{daysUntilExpiry !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate({ to: `/license-management/${item.license_number}` })}
          >
            View Details
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <QuickActions actions={quickActions} title="Quick Actions" />

      {/* Overview Card */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md dark:from-green-950/40 dark:to-emerald-950/30 dark:border-green-800 dark:shadow-none">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                Total Licensed Facilities
              </p>
              <p className="text-4xl font-bold text-green-900 dark:text-green-200">
                {totalLicenses}
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                {complianceRate}% compliance rate • {activeLicenses} active
              </p>
            </div>
            <ShieldCheck className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
        </CardContent>
      </Card>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Expiring Soon (30 days)"
          value={dashboardData?.metrics.expiring_soon || 0}
          variant="warning"
          icon={AlertTriangle}
          onClick={() =>
            navigate({ to: "/license-management/licenses", search: { status: "Expiring" } })
          }
        />
        <MetricCard
          title="Active Licenses"
          value={activeLicenses}
          variant="success"
          icon={CheckCircle}
          onClick={() =>
            navigate({ to: "/license-management/licenses", search: { status: "Active" } })
          }
        />
        <MetricCard
          title="Suspended/Denied"
          value={dashboardData?.metrics.suspended_denied || 0}
          variant="danger"
          icon={XCircle}
        />
        <MetricCard
          title="Pending Renewals"
          value={dashboardData?.metrics.pending_renewals || 0}
          variant="info"
          icon={Clock}
        />
      </div>

      {/* Status Distribution and Priority Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution
          data={dashboardData?.status_distribution || []}
          title="License Status Distribution"
          type="bar"
          onSegmentClick={(status) =>
            navigate({ to: "/license-management/licenses", search: { status } })
          }
        />
        <PrioritySection
          title="Licenses Expiring Soon"
          items={dashboardData?.expiring_licenses || []}
          renderItem={renderExpiringItem}
          onViewAll={() =>
            navigate({ to: "/license-management/licenses", search: { status: "Expiring" } })
          }
          emptyMessage="No licenses expiring in the next 30 days"
        />
      </div>
    </div>
  )
}
