import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useAffiliationStore } from '@/stores/affiliationStore'
import { useAuthStore } from '@/stores/authStore'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import StatusBadge from '@/components/affiliations/StatusBadge'
import { ArrowLeft, Building2, User, Briefcase, Calendar, IdCard, Mail, Phone, MapPin, CheckCircle, XCircle } from 'lucide-react'
import { showSuccess, showError } from '@/utils/toast'
import type { Affiliation } from '@/types/affiliation'

function AffiliationDetailPage() {
  const { affiliationId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const { getAffiliation, approveAffiliation, rejectAffiliation } = useAffiliationStore()

  const loaderData = Route.useLoaderData()
  const [affiliation, setAffiliation] = useState<Affiliation | null>(loaderData)
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
    navigate({ to: '/affiliations' })
  }

  const handleApprove = async () => {
    if (!affiliation) return

    setActionLoading(true)
    try {
      await approveAffiliation(affiliation.id)
      showSuccess('Affiliation approved successfully')
      // Refresh the affiliation
      const updated = await getAffiliation(affiliationId)
      setAffiliation(updated)
    } catch (err) {
      // The API doesn't have approve/reject endpoints yet
      showError(err instanceof Error ? err.message : 'Failed to approve affiliation')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async () => {
    if (!affiliation) return

    setActionLoading(true)
    try {
      await rejectAffiliation(affiliation.id)
      showSuccess('Affiliation rejected successfully')
      // Refresh the affiliation
      const updated = await getAffiliation(affiliationId)
      setAffiliation(updated)
    } catch (err) {
      // The API doesn't have approve/reject endpoints yet
      showError(err instanceof Error ? err.message : 'Failed to reject affiliation')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <AppLayout
      currentRoute="affiliations"
      pageTitle="Affiliation Details"
      pageSubtitle="View and manage professional affiliation"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Affiliations
          </Button>
        </div>

        {/* Affiliation Details */}
        {affiliation && (
          <div className="space-y-6">
            {/* Header Card with Actions */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">Professional Affiliation</CardTitle>
                    <StatusBadge status={affiliation.affiliationStatus} className="text-sm" />
                  </div>
                  {affiliation.affiliationStatus === 'Pending' && (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={handleReject}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </Card>

            {/* Professional Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Health Professional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                    <p className="mt-1 text-base">{affiliation.healthProfessional.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="mt-1 text-base font-mono">{affiliation.healthProfessional.registrationNumber}</p>
                  </div>
                  {affiliation.healthProfessional.professionalCadre && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Professional Cadre</label>
                      <p className="mt-1 text-base">{affiliation.healthProfessional.professionalCadre}</p>
                    </div>
                  )}
                  {affiliation.healthProfessional.specialty && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Specialty</label>
                      <p className="mt-1 text-base">{affiliation.healthProfessional.specialty}</p>
                    </div>
                  )}
                  {affiliation.healthProfessional.typeOfPractice && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Type of Practice</label>
                      <p className="mt-1 text-base">{affiliation.healthProfessional.typeOfPractice}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Facility Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Health Facility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Facility Name</label>
                    <p className="mt-1 text-base">{affiliation.healthFacility.facilityName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Registration Number</label>
                    <p className="mt-1 text-base font-mono">{affiliation.healthFacility.registrationNumber}</p>
                  </div>
                  {affiliation.healthFacility.facilityCode && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Facility Code</label>
                      <p className="mt-1 text-base">{affiliation.healthFacility.facilityCode}</p>
                    </div>
                  )}
                  {affiliation.healthFacility.facilityType && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Facility Type</label>
                      <p className="mt-1 text-base">{affiliation.healthFacility.facilityType}</p>
                    </div>
                  )}
                  {affiliation.healthFacility.kephLevel && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">KEPH Level</label>
                      <p className="mt-1 text-base">{affiliation.healthFacility.kephLevel}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Affiliation Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Affiliation Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Role</label>
                    <p className="mt-1 text-base">{affiliation.role}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Employment Type</label>
                    <p className="mt-1 text-base capitalize">{affiliation.employmentType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Start Date</label>
                    <p className="mt-1 text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {affiliation.startDate}
                    </p>
                  </div>
                  {affiliation.endDate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">End Date</label>
                      <p className="mt-1 text-base flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {affiliation.endDate}
                      </p>
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

export const Route = createFileRoute('/affiliations/$affiliationId')({
  loader: async ({ params }) =>
    useAffiliationStore.getState().getAffiliation(params.affiliationId),
  component: AffiliationDetailPage,
})
