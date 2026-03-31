import { useNavigate } from "@tanstack/react-router"
import { useLicensingStore } from "@/stores/licensingStore"
import { StatusDistribution, PrioritySection, QuickActions } from "@/components/dashboard"
import { ModuleStatStrip } from "@/components/dashboard/ModuleStatStrip"
import { Clock, List, FileQuestion } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat)
import { Button } from "@/components/ui/button"

type CombinedApplication = {
  id: string
  name: string
  applicationType: string
  licenseTypeName: string
  applicationStatus: string
  applicationDate: string
  source: "facility" | "professional"
}

export function ApplicationsDashboard() {
  const navigate = useNavigate()
  const {
    applications,
    applicationsLoading,
    professionalApplications,
    professionalApplicationsLoading,
  } = useLicensingStore()

  // Combine facility and professional applications into a unified list — inlined (no useMemo)
  const facilityApps: CombinedApplication[] = applications.map((a) => ({
    id: a.id,
    name: a.facilityName,
    applicationType: a.applicationType,
    licenseTypeName: a.licenseTypeName,
    applicationStatus: a.applicationStatus,
    applicationDate: a.applicationDate,
    source: "facility" as const,
  }))

  const profApps: CombinedApplication[] = professionalApplications.map((a) => ({
    id: a.id,
    name: a.fullName,
    applicationType: a.applicationType,
    licenseTypeName: a.licenseTypeName,
    applicationStatus: a.applicationStatus,
    applicationDate: a.applicationDate,
    source: "professional" as const,
  }))

  const allApplications: CombinedApplication[] = [...facilityApps, ...profApps]

  const isLoading = applicationsLoading || professionalApplicationsLoading

  // Compute metrics — inlined
  const newApps = allApplications.filter(
    (a) => a.applicationStatus === "Pending" && a.applicationType === "New"
  ).length

  const approvedThisMonth = allApplications.filter((a) => a.applicationStatus === "Issued").length

  const denied = allApplications.filter((a) => a.applicationStatus === "Denied").length

  const total = allApplications.length

  // Status distribution data — inlined
  const statusCounts = allApplications.reduce(
    (acc, app) => {
      const status = app.applicationStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  const statusColors: Record<string, string> = {
    Pending: "#f59e0b",
    Issued: "#10b981",
    "Info Requested": "#3b82f6",
    Denied: "#ef4444",
  }

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    color: statusColors[status] || "#6b7280",
  }))

  // Pending applications for priority section — inlined
  const pendingApplications = allApplications
    .filter((a) => a.applicationStatus === "Pending")
    .slice(0, 5)

  // Quick actions — inlined (no useMemo)
  const quickActions = [
    {
      label: "View All Applications",
      onClick: () => navigate({ to: "/license-management/applications" }),
      variant: "default" as const,
      icon: List,
    },
    {
      label: "Review Pending",
      onClick: () =>
        navigate({
          to: "/license-management/applications",
          search: { status: "Pending" },
        }),
      variant: "secondary" as const,
      icon: Clock,
    },
    {
      label: "Info Requested",
      onClick: () =>
        navigate({
          to: "/license-management/applications",
          search: { status: "Info Requested" },
        }),
      variant: "outline" as const,
      icon: FileQuestion,
    },
  ]

  const renderPendingItem = (app: CombinedApplication) => {
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{app.name}</p>
          <p className="text-sm text-muted-foreground truncate">
            {app.applicationType} • {app.licenseTypeName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted{" "}
            {app.applicationDate
              ? formatDistanceToNow(dayjs(app.applicationDate, "DD/MM/YYYY").toDate(), {
                  addSuffix: true,
                })
              : "—"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate({ to: "/license-management/applications" })}
          >
            Review
          </Button>
        </div>
      </div>
    )
  }

  if (isLoading && allApplications.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
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
          { label: "Total Applications", value: total },
          { label: "Approved (Issued)", value: approvedThisMonth, color: "primary" },
          { label: "New / Pending", value: newApps, color: "amber" },
          { label: "Denied", value: denied, color: "red" },
        ]}
      />

      {/* Status Distribution and Priority Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution
          data={statusDistribution}
          title="Application Status Distribution"
          onSegmentClick={(status) =>
            navigate({ to: "/license-management/applications", search: { status } })
          }
        />
        <PrioritySection
          title="Applications Requiring Review"
          items={pendingApplications}
          renderItem={renderPendingItem}
          onViewAll={() =>
            navigate({
              to: "/license-management/applications",
              search: { status: "Pending" },
            })
          }
          emptyMessage="No pending applications to review"
        />
      </div>
    </div>
  )
}
