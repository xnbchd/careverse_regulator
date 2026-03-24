import { useEffect } from 'react'
import { useAuditStore } from '@/stores/auditStore'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  Activity,
  AlertTriangle,
  TrendingUp,
  Users,
  Shield,
} from 'lucide-react'
import {
  getActionLabel,
  getEntityLabel,
  getSeverityColor,
  getSeverityLabel,
} from '@/types/audit'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

export function AuditStats() {
  const { stats, isLoadingStats, fetchStats } = useAuditStore()

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (isLoadingStats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No audit statistics available</p>
        </CardContent>
      </Card>
    )
  }

  // Calculate top actions
  const topActions = Object.entries(stats.logsByAction)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Calculate top entities
  const topEntities = Object.entries(stats.logsByEntity)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Calculate severity distribution
  const severityData = Object.entries(stats.logsBySeverity)

  // Calculate high-risk percentage
  const highRiskCount =
    (stats.logsBySeverity.high || 0) + (stats.logsBySeverity.critical || 0)
  const highRiskPercentage = stats.totalLogs > 0
    ? ((highRiskCount / stats.totalLogs) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Activity className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">All audit events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
              <AlertTriangle className="w-4 h-4 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{highRiskCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {highRiskPercentage}% of total events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.topUsers.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Users with activity</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <TrendingUp className="w-4 h-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.recentActivity.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              <CardTitle>Top Actions</CardTitle>
            </div>
            <CardDescription>Most frequent audit actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topActions.map(([action, count]) => {
                const percentage = ((count / stats.totalLogs) * 100).toFixed(1)
                return (
                  <div key={action} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {getActionLabel(action as any)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Entities */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <CardTitle>Top Entities</CardTitle>
            </div>
            <CardDescription>Most frequently accessed entities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topEntities.map(([entity, count]) => {
                const percentage = ((count / stats.totalLogs) * 100).toFixed(1)
                return (
                  <div key={entity} className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {getEntityLabel(entity as any)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {count.toLocaleString()} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Severity Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Severity Distribution</CardTitle>
            <CardDescription>Events grouped by severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {severityData.map(([severity, count]) => {
                const percentage = ((count / stats.totalLogs) * 100).toFixed(1)
                return (
                  <div key={severity} className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={cn('w-24 justify-center', getSeverityColor(severity as any))}
                    >
                      {getSeverityLabel(severity as any)}
                    </Badge>
                    <div className="flex-1 mx-4">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full transition-all',
                            severity === 'critical' && 'bg-red-500',
                            severity === 'high' && 'bg-orange-500',
                            severity === 'medium' && 'bg-blue-500',
                            severity === 'low' && 'bg-gray-500'
                          )}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium w-20 text-right">
                      {count.toLocaleString()} ({percentage}%)
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Most Active Users</CardTitle>
            <CardDescription>Users with highest activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.topUsers.slice(0, 5).map((user, index) => {
                const percentage = ((user.count / stats.totalLogs) * 100).toFixed(1)
                return (
                  <div key={user.userId} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.userName}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {user.count} ({percentage}%)
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest audit events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentActivity.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <div className="mt-1">
                  <Badge
                    variant="outline"
                    className={cn('text-xs', getSeverityColor(log.severity))}
                  >
                    {getSeverityLabel(log.severity)}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{getActionLabel(log.action)}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {log.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">{log.userName}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                        </span>
                      </div>
                    </div>
                    <Badge variant={log.success ? 'default' : 'destructive'} className="text-xs">
                      {log.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
