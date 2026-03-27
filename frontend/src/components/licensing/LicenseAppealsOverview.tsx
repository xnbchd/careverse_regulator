import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react"
import { fetchLicenseAppeals } from "@/api/licenseAppealsApi"

export function LicenseAppealsOverview() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    infoRequested: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setLoading(true)
      // Fetch all appeals (first page to get total count and calculate stats)
      const response = await fetchLicenseAppeals(1, 100) // Get more records for accurate stats

      const appeals = response.data
      const total = response.pagination.total_count

      // Calculate status counts
      const pending = appeals.filter((a) => a.status === "Pending").length
      const approved = appeals.filter((a) => a.status === "Approved").length
      const rejected = appeals.filter((a) => a.status === "Rejected").length
      const infoRequested = appeals.filter(
        (a) => a.status === "Additional Information Requested"
      ).length

      setStats({
        total,
        pending,
        approved,
        rejected,
        infoRequested,
      })
    } catch (error) {
      console.error("Failed to load appeals stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      label: "Total Appeals",
      value: stats.total,
      icon: FileText,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
      borderColor: "border-blue-100 dark:border-blue-800",
    },
    {
      label: "Pending",
      value: stats.pending,
      icon: Clock,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
      borderColor: "border-orange-100 dark:border-orange-800",
    },
    {
      label: "Approved",
      value: stats.approved,
      icon: CheckCircle,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950/30",
      borderColor: "border-green-100 dark:border-green-800",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      icon: XCircle,
      color: "text-red-600 dark:text-red-400",
      bgColor: "bg-red-50 dark:bg-red-950/30",
      borderColor: "border-red-100 dark:border-red-800",
    },
    {
      label: "Info Requested",
      value: stats.infoRequested,
      icon: AlertCircle,
      color: "text-yellow-600 dark:text-yellow-400",
      bgColor: "bg-yellow-50 dark:bg-yellow-950/30",
      borderColor: "border-yellow-100 dark:border-yellow-800",
    },
  ]

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">License Appeals Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">License Appeals Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {statCards.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`${stat.bgColor} rounded-lg p-4 border ${stat.borderColor}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-2 rounded-lg`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
