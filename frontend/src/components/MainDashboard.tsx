import { useNavigate } from "@tanstack/react-router"
import { differenceInDays, isBefore } from "date-fns"
import { Clock, AlertTriangle, Users, FileText, Calendar, Activity } from "lucide-react"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { useLicensingStore } from "@/stores/licensingStore"
import { useInspectionStore } from "@/stores/inspectionStore"
import { useAuthStore } from "@/stores/authStore"
import { PageHeader } from "@/components/shared/PageHeader"
import { ActivityFeed, type ActivityItem } from "@/components/shared/ActivityFeed"
import { AttentionCard } from "@/components/dashboard/AttentionCard"
import { ModuleStatStrip } from "@/components/dashboard/ModuleStatStrip"
import { ModuleStatusDonut } from "@/components/dashboard/ModuleStatusDonut"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

function getGreeting(fullName: string | null | undefined): string {
  const firstName = fullName?.trim().split(" ")[0] || null
  const hour = new Date().getHours()
  const salutation = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening"
  return firstName ? `${salutation}, ${firstName}` : salutation
}

function formatDate(): string {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

// Typed route paths — validated against routeTree.gen.ts
const MODULE_ROUTES = {
  affiliationsList: "/affiliations/list",
  licenses: "/license-management/licenses",
  inspectionsList: "/inspections/list",
  affiliations: "/affiliations",
  licenseManagement: "/license-management",
  inspections: "/inspections",
} as const satisfies Record<string, string>

// ── Per-module status color palettes ─────────────────────────────────────────
// CSS custom properties used where a semantic token exists; raw hex only for
// statuses that have no semantic equivalent in the design token system.

const AFFILIATION_COLORS: Record<string, string> = {
  Active: "var(--primary)",
  Pending: "var(--status-pending-dot)",
  Inactive: "var(--status-inactive-dot)",
  Rejected: "var(--status-expired-dot)",
}

const LICENSE_COLORS: Record<string, string> = {
  Active: "var(--primary)",
  Pending: "var(--status-pending-dot)",
  "In Review": "#60a5fa", // blue-400
  "Info Requested": "#a78bfa", // violet-400
  Approved: "#34d399", // emerald-400
  "Renewal Reviewed": "#2dd4bf", // teal-400 (lighter)
  Expired: "var(--status-expired-dot)",
  Suspended: "var(--status-suspended-dot)",
  Denied: "#f43f5e", // rose-500
}

const INSPECTION_COLORS: Record<string, string> = {
  Assigned: "var(--status-pending-dot)", // amber — awaiting action
  "In Progress": "var(--primary)", // teal — active
  Submitted: "#60a5fa", // blue-400
  Reviewed: "#34d399", // emerald-400 — complete
  Cancelled: "var(--status-inactive-dot)", // neutral
}

export default function MainDashboard() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const { affiliations, loading: affiliationsLoading } = useAffiliationStore()
  const { licenses, licensesLoading } = useLicensingStore()
  const { inspections, loading: inspectionsLoading } = useInspectionStore()

  const isLoading = affiliationsLoading || licensesLoading || inspectionsLoading

  const now = new Date()

  // ── Attention counts ─────────────────────────────────────────────────────────
  const pendingAffiliations = affiliations.filter((a) => a.affiliationStatus === "Pending").length

  const expiringSoonLicenses = licenses.filter((l) => {
    const days = differenceInDays(new Date(l.dateOfExpiry), now)
    return days >= 0 && days <= 30 && l.status === "Active"
  }).length

  const expiredLicenses = licenses.filter((l) => l.status === "Expired").length

  // Inspections due — use real statuses (Assigned | In Progress), not phantom "Pending"
  const overdueInspections = inspections.filter(
    (i) =>
      (i.status === "Assigned" || i.status === "In Progress") && isBefore(new Date(i.date), now)
  ).length

  const dueSoonInspections = inspections.filter((i) => {
    if (i.status !== "Assigned" && i.status !== "In Progress") return false
    const days = differenceInDays(new Date(i.date), now)
    return days >= 0 && days <= 7
  }).length

  // ── KPI snapshot ─────────────────────────────────────────────────────────────
  const activeLicenses = licenses.filter((l) => l.status === "Active").length
  const totalLicenses = licenses.length
  const complianceRate = totalLicenses > 0 ? Math.round((activeLicenses / totalLicenses) * 100) : 0

  const activeAffiliations = affiliations.filter((a) => a.affiliationStatus === "Active").length
  // "Reviewed" is the real terminal status for completed inspections
  const reviewedInspections = inspections.filter((i) => i.status === "Reviewed").length

  const kpiStats = [
    { label: "Total Affiliations", value: affiliations.length },
    { label: "Active Licenses", value: activeLicenses, color: "primary" as const },
    { label: "Total Inspections", value: inspections.length },
    {
      label: "Compliance Rate",
      value: `${complianceRate}%`,
      color: complianceRate >= 80 ? ("primary" as const) : ("amber" as const),
    },
  ]

  // ── Donut chart segments — per module, per real status ───────────────────────

  // Affiliations: 4 real statuses
  const affiliationSegments = (["Active", "Pending", "Inactive", "Rejected"] as const).map(
    (status) => ({
      label: status,
      value: affiliations.filter((a) => a.affiliationStatus === status).length,
      color: AFFILIATION_COLORS[status],
    })
  )

  // Licenses: 9 real statuses, ordered most relevant first
  const licenseStatuses = [
    "Active",
    "Pending",
    "In Review",
    "Info Requested",
    "Approved",
    "Renewal Reviewed",
    "Expired",
    "Suspended",
    "Denied",
  ] as const
  const licenseSegments = licenseStatuses.map((status) => ({
    label: status,
    value: licenses.filter((l) => l.status === status).length,
    color: LICENSE_COLORS[status],
  }))

  // Inspections: 5 real statuses
  const inspectionStatuses = [
    "Assigned",
    "In Progress",
    "Submitted",
    "Reviewed",
    "Cancelled",
  ] as const
  const inspectionSegments = inspectionStatuses.map((status) => ({
    label: status,
    value: inspections.filter((i) => i.status === status).length,
    color: INSPECTION_COLORS[status],
  }))

  // ── Activity feed — synthesised from store data ───────────────────────────────
  const activityItems: ActivityItem[] = []

  // Overdue inspections → red
  inspections
    .filter(
      (i) =>
        (i.status === "Assigned" || i.status === "In Progress") && isBefore(new Date(i.date), now)
    )
    .slice(0, 2)
    .forEach((i) => {
      activityItems.push({
        id: `insp-overdue-${i.id}`,
        text: (
          <>
            Inspection overdue: <strong className="text-foreground">{i.facilityName}</strong>
          </>
        ),
        timestamp: `Due ${new Date(i.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        datetime: i.date,
        color: "red",
      })
    })

  // Expiring licenses → amber
  licenses
    .filter((l) => {
      const days = differenceInDays(new Date(l.dateOfExpiry), now)
      return days >= 0 && days <= 30 && l.status === "Active"
    })
    .slice(0, 2)
    .forEach((l) => {
      const days = differenceInDays(new Date(l.dateOfExpiry), now)
      activityItems.push({
        id: `lic-expiring-${l.id}`,
        text: (
          <>
            <strong className="text-foreground">{l.facilityName ?? l.owner}</strong> license expires
            in {days} day{days !== 1 ? "s" : ""}
          </>
        ),
        timestamp: `Expires ${new Date(l.dateOfExpiry).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`,
        datetime: l.dateOfExpiry,
        color: "amber",
      })
    })

  // Pending affiliations → amber
  affiliations
    .filter((a) => a.affiliationStatus === "Pending")
    .slice(0, 2)
    .forEach((a) => {
      activityItems.push({
        id: `aff-pending-${a.id}`,
        text: (
          <>
            <strong className="text-foreground">{a.healthFacility.facilityName}</strong> affiliation
            awaiting review
          </>
        ),
        timestamp: "Recently submitted",
        color: "amber",
      })
    })

  return (
    <div className="space-y-5 p-6">
      {/* Page header */}
      <PageHeader
        breadcrumbs={[{ label: "Dashboard" }]}
        title={getGreeting(user?.fullName)}
        subtitle={`${formatDate()}${user?.companyDisplayName ? ` · ${user.companyDisplayName}` : ""}`}
      />

      {/* Attention strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <AttentionCard
          count={pendingAffiliations}
          label="Affiliations Pending Review"
          sublabel={
            pendingAffiliations > 0
              ? `${pendingAffiliations} awaiting your action`
              : "No pending affiliations"
          }
          variant="amber"
          icon={Users}
          href={MODULE_ROUTES.affiliationsList}
          loading={affiliationsLoading}
        />
        <AttentionCard
          count={expiringSoonLicenses + expiredLicenses}
          label="Licenses Requiring Attention"
          sublabel={
            expiredLicenses > 0
              ? `${expiredLicenses} expired · ${expiringSoonLicenses} expiring soon`
              : expiringSoonLicenses > 0
                ? `${expiringSoonLicenses} expiring within 30 days`
                : "All licenses current"
          }
          variant="red"
          icon={AlertTriangle}
          href={MODULE_ROUTES.licenses}
          loading={licensesLoading}
        />
        <AttentionCard
          count={overdueInspections + dueSoonInspections}
          label="Inspections This Week"
          sublabel={
            overdueInspections > 0
              ? `${overdueInspections} overdue · ${dueSoonInspections} due this week`
              : dueSoonInspections > 0
                ? `${dueSoonInspections} due this week`
                : "No inspections due"
          }
          variant="teal"
          icon={Calendar}
          href={MODULE_ROUTES.inspectionsList}
          loading={inspectionsLoading}
        />
      </div>

      {/* KPI snapshot */}
      <ModuleStatStrip stats={kpiStats} loading={isLoading} />

      {/* Module status donuts — one per module, each showing its own real status set */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ModuleStatusDonut
          title="Affiliations"
          segments={affiliationSegments}
          loading={affiliationsLoading}
        />
        <ModuleStatusDonut title="Licenses" segments={licenseSegments} loading={licensesLoading} />
        <ModuleStatusDonut
          title="Inspections"
          segments={inspectionSegments}
          loading={inspectionsLoading}
        />
      </div>

      {/* Attention items feed — full-width below donuts */}
      <Card className="border border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Attention Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activityItems.length === 0 && !isLoading ? (
            <div className="py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground">All clear</p>
              <p className="text-xs text-muted-foreground mt-1">
                No items requiring immediate attention
              </p>
            </div>
          ) : (
            <ActivityFeed items={activityItems.slice(0, 6)} loading={isLoading} />
          )}
        </CardContent>
      </Card>

      {/* Module navigation row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(
          [
            {
              label: "Affiliations",
              icon: Users,
              to: MODULE_ROUTES.affiliations,
              count: affiliations.length,
              sub: `${activeAffiliations} active`,
            },
            {
              label: "License Management",
              icon: FileText,
              to: MODULE_ROUTES.licenseManagement,
              count: totalLicenses,
              sub: `${activeLicenses} active`,
            },
            {
              label: "Inspections",
              icon: Calendar,
              to: MODULE_ROUTES.inspections,
              count: inspections.length,
              sub: `${reviewedInspections} reviewed`,
            },
          ] as const
        ).map((mod) => (
          <button
            key={mod.label}
            type="button"
            onClick={() => navigate({ to: mod.to })}
            className="group flex items-center gap-3 p-4 rounded-lg border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 transition-all duration-150 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="shrink-0 w-9 h-9 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <mod.icon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">{mod.label}</p>
              <p className="text-xs text-muted-foreground">
                {mod.count} total · {mod.sub}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
