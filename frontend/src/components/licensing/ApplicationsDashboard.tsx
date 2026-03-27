import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useLicensingStore } from "@/stores/licensingStore"
import {
  MetricCard,
  StatusDistribution,
  PrioritySection,
  QuickActions,
  TrendChart,
} from "@/components/dashboard"
import { CheckCircle, Clock, XCircle, FileText, List, FileQuestion } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import dayjs from "dayjs"
import customParseFormat from "dayjs/plugin/customParseFormat"
dayjs.extend(customParseFormat)
import { Button } from "@/components/ui/button"
import type { LicenseApplication, ProfessionalLicenseApplication } from "@/types/license"

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

  // Combine facility and professional applications into a unified list
  const allApplications = useMemo(() => {
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

    return [...facilityApps, ...profApps]
  }, [applications, professionalApplications])

  const isLoading = applicationsLoading || professionalApplicationsLoading

  // Compute metrics
  const metrics = useMemo(() => {
    const newApps = allApplications.filter(
      (a) => a.applicationStatus === "Pending" && a.applicationType === "New"
    ).length

    const inReview = allApplications.filter((a) => a.applicationStatus === "Info Requested").length

    const approvedThisMonth = allApplications.filter((a) => a.applicationStatus === "Issued").length

    const denied = allApplications.filter((a) => a.applicationStatus === "Denied").length

    const total = allApplications.length

    return { newApps, inReview, approvedThisMonth, denied, total }
  }, [allApplications])

  // Status distribution data
  const statusDistribution = useMemo(() => {
    const statusCounts = allApplications.reduce((acc, app) => {
      const status = app.applicationStatus
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusColors: Record<string, string> = {
      Pending: "#f59e0b",
      Issued: "#10b981",
      "Info Requested": "#3b82f6",
      Denied: "#ef4444",
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || "#6b7280",
    }))
  }, [allApplications])

  // Pending applications for priority section
  const pendingApplications = useMemo(
    () => allApplications.filter((a) => a.applicationStatus === "Pending").slice(0, 5),
    [allApplications]
  )

  // Quick actions
  const quickActions = useMemo(
    () => [
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
    ],
    [navigate]
  )

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

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="New Applications"
          value={metrics.newApps}
          variant="info"
          icon={FileText}
          onClick={() =>
            navigate({
              to: "/license-management/applications",
              search: { status: "Pending", type: "New" },
            })
          }
        />
        <MetricCard
          title="Info Requested"
          value={metrics.inReview}
          variant="warning"
          icon={FileQuestion}
          onClick={() =>
            navigate({
              to: "/license-management/applications",
              search: { status: "Info Requested" },
            })
          }
        />
        <MetricCard
          title="Approved This Month"
          value={metrics.approvedThisMonth}
          variant="success"
          icon={CheckCircle}
        />
        <MetricCard title="Denied" value={metrics.denied} variant="danger" icon={XCircle} />
      </div>

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
