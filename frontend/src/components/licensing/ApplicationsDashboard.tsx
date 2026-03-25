import { useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLicensingStore } from '@/stores/licensingStore'
import {
  MetricCard,
  StatusDistribution,
  PrioritySection,
  QuickActions,
  TrendChart,
} from '@/components/dashboard'
import {
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  List,
  FileQuestion,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import type { LicenseApplication } from '@/types/license'

export function ApplicationsDashboard() {
  const navigate = useNavigate()
  const { applications, applicationsLoading } = useLicensingStore()

  // Compute metrics
  const metrics = useMemo(() => {
    const newApps = applications.filter(
      (a) => a.applicationStatus === 'Pending' && a.applicationType === 'New'
    ).length

    const inReview = applications.filter(
      (a) => a.applicationStatus === 'Info Requested'
    ).length

    const approvedThisMonth = applications.filter(
      (a) => a.applicationStatus === 'Issued'
    ).length

    const denied = applications.filter(
      (a) => a.applicationStatus === 'Denied'
    ).length

    const total = applications.length

    return { newApps, inReview, approvedThisMonth, denied, total }
  }, [applications])

  // Status distribution data
  const statusDistribution = useMemo(() => {
    const statusCounts = applications.reduce(
      (acc, app) => {
        const status = app.applicationStatus
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    const statusColors: Record<string, string> = {
      Pending: '#f59e0b',
      Issued: '#10b981',
      'Info Requested': '#3b82f6',
      Denied: '#ef4444',
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6b7280',
    }))
  }, [applications])

  // Pending applications for priority section
  const pendingApplications = useMemo(
    () =>
      applications
        .filter((a) => a.applicationStatus === 'Pending')
        .slice(0, 5),
    [applications]
  )

  // Quick actions
  const quickActions = useMemo(
    () => [
      {
        label: 'View All Applications',
        onClick: () => navigate({ to: '/license-management/applications' }),
        variant: 'default' as const,
        icon: List,
      },
      {
        label: 'Review Pending',
        onClick: () =>
          navigate({
            to: '/license-management/applications',
            search: { status: 'Pending' },
          }),
        variant: 'secondary' as const,
        icon: Clock,
      },
      {
        label: 'Info Requested',
        onClick: () =>
          navigate({
            to: '/license-management/applications',
            search: { status: 'Info Requested' },
          }),
        variant: 'outline' as const,
        icon: FileQuestion,
      },
    ],
    [navigate]
  )

  const renderPendingItem = (app: LicenseApplication) => {
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">
            {app.facilityName}
          </p>
          <p className="text-sm text-muted-foreground truncate">
            {app.applicationType} • {app.licenseTypeName}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Submitted{' '}
            {formatDistanceToNow(new Date(app.applicationDate), { addSuffix: true })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="default"
            onClick={() => navigate({ to: '/license-management/applications' })}
          >
            Review
          </Button>
        </div>
      </div>
    )
  }

  if (applicationsLoading && applications.length === 0) {
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
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="New Applications"
          value={metrics.newApps}
          variant="info"
          icon={FileText}
          onClick={() =>
            navigate({
              to: '/license-management/applications',
              search: { status: 'Pending', type: 'New' },
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
              to: '/license-management/applications',
              search: { status: 'Info Requested' },
            })
          }
        />
        <MetricCard
          title="Approved This Month"
          value={metrics.approvedThisMonth}
          variant="success"
          icon={CheckCircle}
        />
        <MetricCard
          title="Denied"
          value={metrics.denied}
          variant="danger"
          icon={XCircle}
        />
      </div>

      {/* Status Distribution and Priority Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution
          data={statusDistribution}
          title="Application Status Distribution"
          onSegmentClick={(status) =>
            navigate({ to: '/license-management/applications', search: { status } })
          }
        />
        <PrioritySection
          title="Applications Requiring Review"
          items={pendingApplications}
          renderItem={renderPendingItem}
          onViewAll={() =>
            navigate({
              to: '/license-management/applications',
              search: { status: 'Pending' },
            })
          }
          emptyMessage="No pending applications to review"
        />
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} title="Quick Actions" />
    </div>
  )
}
