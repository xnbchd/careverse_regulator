import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useLicensingStore } from '@/stores/licensingStore'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import StatusBadge from '@/components/licensing/StatusBadge'
import { ArrowLeft, FileText, Building2, Calendar, CreditCard, CheckCircle, XCircle, AlertCircle, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { showSuccess, showError } from '@/utils/toast'
import type { License, LicenseAction } from '@/types/license'

function LicenseDetailPage() {
  const { licenseNumber } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { getLicense, updateLicense } = useLicensingStore()

  const loaderData = Route.useLoaderData()
  const [license, setLicense] = useState<License | null>(loaderData)
  const [actionLoading, setActionLoading] = useState(false)

  const handleNavigate = (route: string) => {
    navigate({ to: `/${route}` as any })
  }

  const handleLogout = () => {
    window.location.href = '/logout?redirect-to=/'
  }

  const handleSwitchToDesk = () => {
    window.location.href = '/app'
  }

  const handleBack = () => {
    navigate({ to: '/license-management' })
  }

  const handleAction = async (action: LicenseAction, actionName: string) => {
    if (!license) return

    setActionLoading(true)
    try {
      await updateLicense(license.licenseNumber, action)
      showSuccess(`License ${actionName.toLowerCase()} successfully`)
      // Refresh the license
      const updated = await getLicense(licenseNumber)
      setLicense(updated)
    } catch (err) {
      showError(err instanceof Error ? err.message : `Failed to ${actionName.toLowerCase()} license`)
    } finally {
      setActionLoading(false)
    }
  }

  const canPerformActions = license && ['Pending', 'In Review'].includes(license.status)

  return (
    <AppLayout
      currentRoute="license-management"
      pageTitle="License Details"
      pageSubtitle="View and manage facility license"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to License Management
          </Button>
        </div>

        {license && (
          <div className="space-y-6">
            {/* Header Card with Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2 font-mono">{license.licenseNumber}</CardTitle>
                    <StatusBadge status={license.status} className="text-sm" />
                  </div>
                  {canPerformActions && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button disabled={actionLoading}>
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => handleAction('APPROVE', 'Approved')}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('DENY', 'Denied')}>
                          <XCircle className="h-4 w-4 mr-2" />
                          Deny
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('REVIEW', 'Under Review')}>
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('REQUEST_INFO', 'Info Requested')}>
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Info
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction('SUSPEND', 'Suspended')} className="text-orange-600">
                          <XCircle className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction('SET_EXPIRED', 'Expired')} className="text-muted-foreground">
                          <XCircle className="h-4 w-4 mr-2" />
                          Set Expired
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* License Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Number</label>
                    <p className="mt-1 text-base font-mono">{license.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="mt-1 text-base font-mono">{license.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">License Type</label>
                    <p className="mt-1 text-base">{license.licenseType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="mt-1 text-base">{license.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facility Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Owner</label>
                    <p className="mt-1 text-base">{license.owner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facility Type</label>
                    <p className="mt-1 text-base">{license.facilityType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates and Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Validity and Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Issuance</label>
                    <p className="mt-1 text-base">{license.dateOfIssuance}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Date of Expiry</label>
                    <p className="mt-1 text-base">{license.dateOfExpiry}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Payment Status</label>
                    <p className="mt-1 text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="capitalize">{license.paymentStatus}</span>
                    </p>
                  </div>
                  {license.isArchived && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Archived</label>
                      <p className="mt-1 text-base text-orange-600">Yes</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute('/license-management/$licenseNumber')({
  loader: async ({ params }) =>
    useLicensingStore.getState().getLicense(params.licenseNumber),
  component: LicenseDetailPage,
})
