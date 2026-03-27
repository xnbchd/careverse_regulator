import { useState, useEffect } from "react"
import { useNavigate } from "@tanstack/react-router"
import { MetricCard, StatusDistribution, QuickActions } from "@/components/dashboard"
import { FileText, Clock, CheckCircle, XCircle, AlertCircle, List } from "lucide-react"
import { fetchLicenseAppeals, type LicenseAppeal } from "@/api/licenseAppealsApi"

export function LicenseAppealsDashboard() {
  const navigate = useNavigate()
  const [appeals, setAppeals] = useState<LicenseAppeal[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadAppeals()
  }, [])

  const loadAppeals = async () => {
    try {
      setLoading(true)
      const response = await fetchLicenseAppeals(1, 100)
      setAppeals(response?.data || [])
      setTotalCount(response?.pagination?.total_count || 0)
    } catch (error) {
      console.error("Failed to load appeals:", error)
    } finally {
      setLoading(false)
    }
  }

  const pendingCount = appeals.filter((a) => !a.status || a.status === "Pending").length
  const approvedCount = appeals.filter((a) => a.status === "Approved").length
  const rejectedCount = appeals.filter((a) => a.status === "Rejected").length
  const infoRequestedCount = appeals.filter(
    (a) => a.status === "Additional Information Requested"
  ).length

  const facilityAppeals = appeals.filter((a) => a.appeal_type === "facility").length
  const professionalAppeals = appeals.filter((a) => a.appeal_type === "professional").length

  const quickActions = [
    {
      label: "View All Appeals",
      onClick: () => navigate({ to: "/license-management/applications" }),
      variant: "default" as const,
      icon: List,
    },
    {
      label: "Review Pending",
      onClick: () => navigate({ to: "/license-management/applications" }),
      variant: "secondary" as const,
      icon: Clock,
    },
  ]

  const statusDistribution = [
    { status: "Pending", count: pendingCount, color: "#f59e0b" },
    { status: "Approved", count: approvedCount, color: "#10b981" },
    { status: "Rejected", count: rejectedCount, color: "#ef4444" },
    { status: "Info Requested", count: infoRequestedCount, color: "#6366f1" },
  ].filter((item) => item.count > 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading appeals data...</p>
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
        <MetricCard title="Total Appeals" value={totalCount} variant="info" icon={FileText} />
        <MetricCard title="Pending Review" value={pendingCount} variant="warning" icon={Clock} />
        <MetricCard title="Approved" value={approvedCount} variant="success" icon={CheckCircle} />
        <MetricCard title="Rejected" value={rejectedCount} variant="danger" icon={XCircle} />
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Info Requested"
          value={infoRequestedCount}
          variant="info"
          icon={AlertCircle}
        />
        <MetricCard
          title="Facility Appeals"
          value={facilityAppeals}
          variant="info"
          icon={FileText}
        />
        <MetricCard
          title="Professional Appeals"
          value={professionalAppeals}
          variant="info"
          icon={FileText}
        />
      </div>

      {/* Status Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution
          data={statusDistribution}
          title="Appeal Status Distribution"
          type="bar"
        />
      </div>
    </div>
  )
}
