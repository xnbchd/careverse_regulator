import { useMemo } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { useLicensingStore } from "@/stores/licensingStore"
import { useInspectionStore } from "@/stores/inspectionStore"
import { MetricCard, StatusDistribution, QuickActions } from "@/components/dashboard"
import {
  Clock,
  AlertTriangle,
  Users,
  FileText,
  Calendar,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { differenceInDays, isBefore } from "date-fns"

interface MainDashboardProps {
  onNavigate: (route: string) => void
  company?: string | null
}

export default function MainDashboard({}: MainDashboardProps) {
  const navigate = useNavigate()

  // Load data from all stores (fetched by route loader)
  const { affiliations, loading: affiliationsLoading } = useAffiliationStore()

  const { licenses, applications, licensesLoading, applicationsLoading } = useLicensingStore()

  const { inspections, loading: inspectionsLoading } = useInspectionStore()

  // Aggregate metrics across all sections
  const aggregateMetrics = useMemo(() => {
    const now = new Date()

    // Affiliations metrics
    const pendingAffiliations = affiliations.filter((a) => a.affiliationStatus === "Pending").length
    const activeAffiliations = affiliations.filter((a) => a.affiliationStatus === "Active").length

    // Licenses metrics
    const expiringSoonLicenses = licenses.filter((l) => {
      const daysUntilExpiry = differenceInDays(new Date(l.dateOfExpiry), now)
      return daysUntilExpiry > 0 && daysUntilExpiry <= 30 && l.status === "Active"
    }).length

    const activeLicenses = licenses.filter((l) => l.status === "Active").length
    const suspendedLicenses = licenses.filter((l) => l.status === "Suspended").length
    const deniedLicenses = licenses.filter((l) => l.status === "Denied").length

    // Applications metrics
    const pendingApplications = applications.filter((a) => a.applicationStatus === "Pending").length
    const inReviewApplications = applications.filter(
      (a) => a.applicationStatus === "In Review"
    ).length

    // Inspections metrics
    const overdueInspections = inspections.filter((i) => {
      const inspectionDate = new Date(i.date)
      return i.status === "Pending" && isBefore(inspectionDate, now)
    }).length

    const dueSoonInspections = inspections.filter((i) => {
      const inspectionDate = new Date(i.date)
      const daysUntilDue = differenceInDays(inspectionDate, now)
      return i.status === "Pending" && daysUntilDue >= 0 && daysUntilDue <= 7
    }).length

    const completedInspections = inspections.filter((i) => i.status === "Completed").length

    const nonCompliantInspections = inspections.filter((i) => i.status === "Non Compliant").length

    // Total items requiring attention
    const totalRequiringAttention =
      pendingAffiliations + expiringSoonLicenses + pendingApplications + overdueInspections

    // Compliance rate
    const totalLicenses = licenses.length
    const complianceRate =
      totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0

    return {
      pendingAffiliations,
      activeAffiliations,
      expiringSoonLicenses,
      activeLicenses,
      suspendedLicenses,
      deniedLicenses,
      pendingApplications,
      inReviewApplications,
      overdueInspections,
      dueSoonInspections,
      completedInspections,
      nonCompliantInspections,
      totalRequiringAttention,
      complianceRate,
      totalAffiliations: affiliations.length,
      totalLicenses: licenses.length,
      totalApplications: applications.length,
      totalInspections: inspections.length,
    }
  }, [affiliations, licenses, applications, inspections])

  // Status distribution across all sections
  const overallStatusDistribution = useMemo(() => {
    return [
      {
        status: "Pending Review",
        count: aggregateMetrics.pendingAffiliations + aggregateMetrics.pendingApplications,
        color: "#f59e0b",
      },
      {
        status: "Active/Compliant",
        count: aggregateMetrics.activeAffiliations + aggregateMetrics.activeLicenses,
        color: "#10b981",
      },
      {
        status: "Expiring Soon",
        count: aggregateMetrics.expiringSoonLicenses,
        color: "#ef4444",
      },
      {
        status: "Overdue",
        count: aggregateMetrics.overdueInspections,
        color: "#dc2626",
      },
    ].filter((item) => item.count > 0)
  }, [aggregateMetrics])

  // Quick actions for main dashboard
  const quickActions = useMemo(
    () => [
      {
        label: "Affiliations",
        onClick: () => navigate({ to: "/affiliations" }),
        variant: "default" as const,
        icon: Users,
      },
      {
        label: "Licenses",
        onClick: () => navigate({ to: "/license-management" }),
        variant: "default" as const,
        icon: FileText,
      },
      {
        label: "Inspections",
        onClick: () => navigate({ to: "/inspections" }),
        variant: "default" as const,
        icon: Calendar,
      },
    ],
    [navigate]
  )

  const isLoading =
    affiliationsLoading || licensesLoading || applicationsLoading || inspectionsLoading

  if (isLoading && aggregateMetrics.totalRequiringAttention === 0) {
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Regulator Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of all compliance activities and priority actions
          </p>
        </div>
        <Badge variant="outline" className="text-xs gap-1.5 py-1">
          <Activity className="h-3 w-3" />
          {aggregateMetrics.complianceRate}% compliance rate
        </Badge>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} title="Navigate to Sections" />

      {/* Priority Attention + Key Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Priority Actions Card */}
        <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-orange-200 shadow-md dark:from-orange-950/40 dark:to-yellow-950/30 dark:border-orange-800 dark:shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-orange-900 dark:text-orange-300 mb-1">
                  Priority Actions Required
                </p>
                <p className="text-4xl font-bold text-orange-900 dark:text-orange-200">
                  {aggregateMetrics.totalRequiringAttention}
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-400 mt-2">
                  {aggregateMetrics.pendingAffiliations} affiliations •{" "}
                  {aggregateMetrics.pendingApplications} applications •{" "}
                  {aggregateMetrics.expiringSoonLicenses} expiring •{" "}
                  {aggregateMetrics.overdueInspections} overdue
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        {/* Total Entities Card */}
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-md dark:from-blue-950/40 dark:to-indigo-950/30 dark:border-blue-800 dark:shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                  Total Regulated Entities
                </p>
                <p className="text-4xl font-bold text-blue-900 dark:text-blue-200">
                  {aggregateMetrics.totalLicenses + aggregateMetrics.totalAffiliations}
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-400 mt-2">
                  {aggregateMetrics.totalLicenses} licenses • {aggregateMetrics.totalAffiliations}{" "}
                  affiliations
                </p>
              </div>
              <ShieldCheck className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        {/* Inspections Overview Card */}
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-md dark:from-green-950/40 dark:to-emerald-950/30 dark:border-green-800 dark:shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-green-900 dark:text-green-300 mb-1">
                  Inspections Overview
                </p>
                <p className="text-4xl font-bold text-green-900 dark:text-green-200">
                  {aggregateMetrics.totalInspections}
                </p>
                <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                  {aggregateMetrics.completedInspections} completed •{" "}
                  {aggregateMetrics.dueSoonInspections} due soon
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Pending Affiliations"
          value={aggregateMetrics.pendingAffiliations}
          variant="warning"
          icon={Users}
          onClick={() => navigate({ to: "/affiliations/list", search: { status: "Pending" } })}
        />
        <MetricCard
          title="Expiring Licenses"
          value={aggregateMetrics.expiringSoonLicenses}
          variant="danger"
          icon={AlertTriangle}
          onClick={() => navigate({ to: "/license-management/licenses" })}
        />
        <MetricCard
          title="Pending Applications"
          value={aggregateMetrics.pendingApplications}
          variant="info"
          icon={FileText}
          onClick={() =>
            navigate({
              to: "/license-management/applications",
              search: { applicationStatus: "Pending" },
            })
          }
        />
        <MetricCard
          title="Overdue Inspections"
          value={aggregateMetrics.overdueInspections}
          variant="danger"
          icon={Clock}
          onClick={() => navigate({ to: "/inspections/list", search: { status: "Pending" } })}
        />
      </div>

      {/* Additional metrics row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Licenses"
          value={aggregateMetrics.activeLicenses}
          variant="success"
          icon={ShieldCheck}
          onClick={() =>
            navigate({ to: "/license-management/licenses", search: { status: "Active" } })
          }
        />
        <MetricCard
          title="Suspended Licenses"
          value={aggregateMetrics.suspendedLicenses}
          variant="warning"
          icon={AlertTriangle}
        />
        <MetricCard
          title="In Review Applications"
          value={aggregateMetrics.inReviewApplications}
          variant="info"
          icon={FileText}
        />
        <MetricCard
          title="Non-Compliant"
          value={aggregateMetrics.nonCompliantInspections}
          variant="danger"
          icon={AlertTriangle}
        />
      </div>

      {/* Section Summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Affiliations Summary */}
        <Card className="shadow-md border-border/60 dark:shadow-none dark:border-foreground/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Affiliations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{aggregateMetrics.totalAffiliations}</span>
            </div>
            <div className="space-y-2 min-h-[72px]">
              <div className="flex justify-between text-sm">
                <span>Pending Review</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {aggregateMetrics.pendingAffiliations}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {aggregateMetrics.activeAffiliations}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Professionals</span>
                <span className="font-medium">{aggregateMetrics.totalAffiliations}</span>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/affiliations" })}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground dark:text-background rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        {/* Licenses Summary */}
        <Card className="shadow-md border-border/60 dark:shadow-none dark:border-foreground/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Licenses
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{aggregateMetrics.totalLicenses}</span>
            </div>
            <div className="space-y-2 min-h-[72px]">
              <div className="flex justify-between text-sm">
                <span>Expiring Soon</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {aggregateMetrics.expiringSoonLicenses}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Active Licenses</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {aggregateMetrics.activeLicenses}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Pending Applications</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {aggregateMetrics.pendingApplications}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/license-management" })}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground dark:text-background rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>

        {/* Inspections Summary */}
        <Card className="shadow-md border-border/60 dark:shadow-none dark:border-foreground/15">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Inspections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span className="text-2xl font-bold">{aggregateMetrics.totalInspections}</span>
            </div>
            <div className="space-y-2 min-h-[72px]">
              <div className="flex justify-between text-sm">
                <span>Overdue</span>
                <span className="font-medium text-red-600 dark:text-red-400">
                  {aggregateMetrics.overdueInspections}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Due This Week</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">
                  {aggregateMetrics.dueSoonInspections}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completed</span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  {aggregateMetrics.completedInspections}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate({ to: "/inspections" })}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground dark:text-background rounded-md hover:bg-primary/90 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              View Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Overall Status Distribution */}
      <StatusDistribution
        data={overallStatusDistribution}
        title="Overall Compliance Status"
        type="bar"
      />
    </div>
  )
}
