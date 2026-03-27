import { useAnalyticsStore } from "@/stores/analyticsStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import StatCard from "./StatCard"
import ExpiryWarningsTable from "./ExpiryWarningsTable"
import TrendChart from "./TrendChart"
import ComplianceOverview from "./ComplianceOverview"
import { FileText, Users, ClipboardCheck, AlertTriangle, RefreshCw, TrendingUp } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"

export default function AnalyticsDashboard() {
  const navigate = useNavigate()
  const {
    licenseStats,
    affiliationStats,
    inspectionStats,
    complianceMetrics,
    expiryWarnings,
    trendData,
    loading,
    error,
    fetchDashboardData,
    refreshData,
  } = useAnalyticsStore()

  if (loading && !licenseStats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-[100px]" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-[80px]" />
                <Skeleton className="h-3 w-[120px] mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-[300px]" />
          <Skeleton className="h-[300px]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={refreshData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of compliance metrics and operational performance
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Licenses"
          value={licenseStats?.total || 0}
          icon={FileText}
          description={`${licenseStats?.active || 0} active, ${
            licenseStats?.expiringSoon || 0
          } expiring soon`}
          trend={{
            value: 2.5,
            label: "from last month",
            isPositive: true,
          }}
        />
        <StatCard
          title="Affiliations"
          value={affiliationStats?.total || 0}
          icon={Users}
          description={`${affiliationStats?.active || 0} active, ${
            affiliationStats?.pending || 0
          } pending`}
          trend={{
            value: 4.2,
            label: "from last month",
            isPositive: true,
          }}
        />
        <StatCard
          title="Inspections"
          value={inspectionStats?.total || 0}
          icon={ClipboardCheck}
          description={`${inspectionStats?.completed || 0} completed, ${
            inspectionStats?.scheduled || 0
          } scheduled`}
          trend={{
            value: 1.8,
            label: "from last month",
            isPositive: true,
          }}
        />
        <StatCard
          title="Compliance Rate"
          value={`${complianceMetrics?.complianceRate || 0}%`}
          icon={TrendingUp}
          description={`${complianceMetrics?.pendingActions || 0} pending actions`}
          trend={{
            value: 0.5,
            label: "from last month",
            isPositive: true,
          }}
        />
      </div>

      {/* License Status Breakdown */}
      {licenseStats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate({ to: "/license-management" })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {((licenseStats.active / licenseStats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate({ to: "/license-management" })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-amber-600">Expiring Soon</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.expiringSoon}</div>
              <p className="text-xs text-muted-foreground mt-1">Within 30 days</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate({ to: "/license-management" })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.expired}</div>
              <p className="text-xs text-muted-foreground mt-1">Requires renewal</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate({ to: "/license-management" })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-orange-600">Suspended</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.suspended}</div>
              <p className="text-xs text-muted-foreground mt-1">Under review</p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate({ to: "/license-management" })}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-600">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{licenseStats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts and Tables */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Trend Chart */}
        {trendData.length > 0 && <TrendChart data={trendData} />}

        {/* Compliance Overview */}
        {complianceMetrics && <ComplianceOverview metrics={complianceMetrics} />}
      </div>

      {/* Expiry Warnings */}
      {expiryWarnings.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  License Expiry Warnings
                </CardTitle>
                <CardDescription>Licenses expiring in the next 30 days</CardDescription>
              </div>
              <Button variant="outline" onClick={() => navigate({ to: "/license-management" })}>
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ExpiryWarningsTable warnings={expiryWarnings} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
