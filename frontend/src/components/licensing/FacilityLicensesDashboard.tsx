import { useNavigate, getRouteApi } from "@tanstack/react-router"
import { StatusDistribution, PrioritySection, QuickActions } from "@/components/dashboard"
import { ModuleStatStrip } from "@/components/dashboard/ModuleStatStrip"
import { Clock, FileText, List } from "lucide-react"
import { differenceInDays } from "date-fns"
import dayjs from "dayjs"
import { Button } from "@/components/ui/button"
import type { LicenseDashboardStats } from "@/api/licensingApi"

const routeApi = getRouteApi("/license-management/")

export function FacilityLicensesDashboard() {
  const navigate = useNavigate()
  const { dashboardStats: dashboardData } = routeApi.useLoaderData() as {
    dashboardStats: LicenseDashboardStats
  }

  const totalLicenses = dashboardData?.metrics.total || 0
  const activeLicenses = dashboardData?.metrics.active || 0

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
          <p className="text-xs [color:var(--status-expired-text)] font-medium mt-1">
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

      {/* Metrics Strip */}
      <ModuleStatStrip
        stats={[
          { label: "Total Licenses", value: totalLicenses },
          { label: "Active Licenses", value: activeLicenses, color: "primary" },
          {
            label: "Expiring Soon",
            value: dashboardData?.metrics.expiring_soon || 0,
            color: "amber",
          },
          {
            label: "Suspended / Denied",
            value: dashboardData?.metrics.suspended_denied || 0,
            color: "red",
          },
        ]}
      />

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
