import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useLicensingStore } from '@/stores/licensingStore'
import { useNotificationStore, createNotification } from '@/stores/notificationStore'
import { useResponsive } from '@/hooks/useResponsive'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { FileText, Plus, ArrowLeft, CheckCircle, XCircle, Ban } from 'lucide-react'
import LicensesTable from './LicensesTable'
import LicenseCard from './LicenseCard'
import LicensesFilters from './LicensesFilters'
import ApplicationsTable from './ApplicationsTable'
import ApplicationCard from './ApplicationCard'
import ApplicationsFilters from './ApplicationsFilters'
import ApplicationDetailModal from './ApplicationDetailModal'
import PaginationControls from './PaginationControls'
import ExportButton from '@/components/shared/ExportButton'
import SavedFiltersManager from '@/components/shared/SavedFiltersManager'
import BulkActionsBar from '@/components/shared/BulkActionsBar'
import LicenseAppealsView from './LicenseAppealsView'
import { LicenseAppealsOverview } from './LicenseAppealsOverview'
import BulkActionConfirmDialog from '@/components/shared/BulkActionConfirmDialog'
import { cn } from '@/lib/utils'
import type { LicenseApplication, License, LicenseAction } from '@/types/license'
import type { ExportConfig } from '@/utils/exportUtils'
import { toast } from 'sonner'
import dayjs from 'dayjs'

interface LicenseManagementViewProps {
  company?: string | null
}

interface LicenseFiltersState {
  search?: string
  status?: string[]
  sortOrder?: 'asc' | 'desc' | 'recent'
}

interface ApplicationFiltersState {
  search?: string
  status?: string[]
  types?: string[]
}

export default function LicenseManagementView({ company }: LicenseManagementViewProps) {
  const navigate = useNavigate()
  const {
    licenses,
    licensesLoading,
    licensesError,
    licensesPagination,
    licensesFilters,
    setLicensesFilters,
    setLicensesPage,
    applications,
    applicationsLoading,
    applicationsError,
    applicationsPagination,
    applicationsFilters,
    setApplicationsFilters,
    setApplicationsPage,
    selectedLicenseIds,
    bulkLicenseActionLoading,
    toggleLicenseSelection,
    selectAllLicenses,
    deselectAllLicenses,
    bulkUpdateLicenseStatus,
  } = useLicensingStore()
  const { addNotification } = useNotificationStore()

  const { isMobile, isTablet } = useResponsive()

  const [activeTab, setActiveTab] = useState<'licenses' | 'appeals' | 'applications'>('licenses')
  const [selectedApplication, setSelectedApplication] = useState<LicenseApplication | null>(null)
  const [showApplicationModal, setShowApplicationModal] = useState(false)

  // Bulk action dialog state
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<LicenseAction | null>(null)

  // Licenses filters state
  const [licenseSearchText, setLicenseSearchText] = useState(licensesFilters.search || '')
  const [selectedLicenseStatuses, setSelectedLicenseStatuses] = useState<string[]>(
    licensesFilters.status ? licensesFilters.status.split(',') : ['all']
  )
  const [licenseSortOrder, setLicenseSortOrder] = useState<'asc' | 'desc' | 'recent'>('recent')

  // Applications filters state
  const [appSearchText, setAppSearchText] = useState(applicationsFilters.search || '')
  const [selectedAppStatuses, setSelectedAppStatuses] = useState<string[]>(['all'])
  const [selectedAppTypes, setSelectedAppTypes] = useState<string[]>(['all'])

  // Debounce license search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLicensesFilters({ ...licensesFilters, search: licenseSearchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [licenseSearchText])

  // Debounce application search
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplicationsFilters({ ...applicationsFilters, search: appSearchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [appSearchText])

  // License filters handlers
  const handleLicenseStatusChange = (statuses: string[]) => {
    setSelectedLicenseStatuses(statuses)
    const statusFilter = statuses.includes('all') ? undefined : statuses.join(',')
    setLicensesFilters({ ...licensesFilters, status: statusFilter })
  }

  const handleLicenseSortChange = (order: 'asc' | 'desc' | 'recent') => {
    setLicenseSortOrder(order)
    if (order === 'asc') {
      setLicensesFilters({ ...licensesFilters, sortBy: 'license_number', sortOrder: 'asc' })
    } else if (order === 'desc') {
      setLicensesFilters({ ...licensesFilters, sortBy: 'license_number', sortOrder: 'desc' })
    } else {
      setLicensesFilters({ ...licensesFilters, sortBy: 'expiry_date', sortOrder: 'desc' })
    }
  }

  const handleClearLicenseFilters = () => {
    setLicenseSearchText('')
    setSelectedLicenseStatuses(['all'])
    setLicenseSortOrder('recent')
    setLicensesFilters({})
  }

  // Application filters handlers
  const handleAppStatusChange = (statuses: string[]) => {
    setSelectedAppStatuses(statuses)
    const statusFilter = statuses.includes('all') ? undefined : statuses.join(',')
    setApplicationsFilters({ ...applicationsFilters, applicationStatus: statusFilter })
  }

  const handleAppTypeChange = (types: string[]) => {
    setSelectedAppTypes(types)
    const typeFilter = types.includes('all') ? undefined : types[0]
    setApplicationsFilters({ ...applicationsFilters, applicationType: typeFilter })
  }

  const handleClearAppFilters = () => {
    setAppSearchText('')
    setSelectedAppStatuses(['all'])
    setSelectedAppTypes(['all'])
    setApplicationsFilters({})
  }

  // Row click handlers
  const handleLicenseRowClick = (licenseNumber: string) => {
    navigate({ to: `/license-management/${licenseNumber}` })
  }

  const handleApplicationRowClick = (applicationId: string) => {
    const app = applications.find((a) => a.licenseApplicationId === applicationId)
    if (app) {
      setSelectedApplication(app)
      setShowApplicationModal(true)
    }
  }

  // Bulk action handlers
  const handleBulkAction = (action: LicenseAction) => {
    setBulkActionType(action)
    setShowBulkActionDialog(true)
  }

  const handleBulkActionConfirm = async (reason?: string) => {
    if (!bulkActionType) return { succeeded: [], failed: [] }

    const licenseNumbers = Array.from(selectedLicenseIds)
    const result = await bulkUpdateLicenseStatus(licenseNumbers, bulkActionType)

    if (result.succeeded.length > 0) {
      toast.success(`Successfully updated ${result.succeeded.length} license(s)`)
      addNotification(
        createNotification.bulkActionCompleted(
          `Bulk ${getBulkActionLabel(bulkActionType)} Licenses`,
          result.succeeded.length,
          result.failed.length
        )
      )
    }
    if (result.failed.length > 0) {
      toast.error(`Failed to update ${result.failed.length} license(s)`)
    }

    return result
  }

  const getBulkActionLabel = (action: LicenseAction): string => {
    const labels: Record<LicenseAction, string> = {
      APPROVE: 'Approve',
      DENY: 'Deny',
      SUSPEND: 'Suspend',
      SET_EXPIRED: 'Set as Expired',
      REVIEW: 'Review',
      RENEWAL_REVIEW: 'Renewal Review',
      REQUEST_INFO: 'Request Info',
    }
    return labels[action]
  }

  // Calculate active filters
  const activeLicenseFiltersCount =
    (licenseSearchText ? 1 : 0) +
    (!selectedLicenseStatuses.includes('all') ? 1 : 0) +
    (licenseSortOrder !== 'recent' ? 1 : 0)

  const activeAppFiltersCount =
    (appSearchText ? 1 : 0) +
    (!selectedAppStatuses.includes('all') ? 1 : 0) +
    (!selectedAppTypes.includes('all') ? 1 : 0)

  // Saved filters state tracking
  const currentLicenseFilters: LicenseFiltersState = {
    search: licenseSearchText || undefined,
    status: selectedLicenseStatuses.includes('all') ? undefined : selectedLicenseStatuses,
    sortOrder: licenseSortOrder,
  }

  const currentApplicationFilters: ApplicationFiltersState = {
    search: appSearchText || undefined,
    status: selectedAppStatuses.includes('all') ? undefined : selectedAppStatuses,
    types: selectedAppTypes.includes('all') ? undefined : selectedAppTypes,
  }

  // Apply saved filters handlers
  const handleApplySavedLicenseFilters = (filters: LicenseFiltersState) => {
    setLicenseSearchText(filters.search || '')
    setSelectedLicenseStatuses(filters.status || ['all'])
    setLicenseSortOrder(filters.sortOrder || 'recent')

    const statusFilter = filters.status?.join(',')
    if (filters.sortOrder === 'asc') {
      setLicensesFilters({ search: filters.search, status: statusFilter, sortBy: 'license_number', sortOrder: 'asc' })
    } else if (filters.sortOrder === 'desc') {
      setLicensesFilters({ search: filters.search, status: statusFilter, sortBy: 'license_number', sortOrder: 'desc' })
    } else {
      setLicensesFilters({ search: filters.search, status: statusFilter, sortBy: 'expiry_date', sortOrder: 'desc' })
    }
  }

  const handleApplySavedApplicationFilters = (filters: ApplicationFiltersState) => {
    setAppSearchText(filters.search || '')
    setSelectedAppStatuses(filters.status || ['all'])
    setSelectedAppTypes(filters.types || ['all'])

    const statusFilter = filters.status?.join(',')
    const typeFilter = filters.types?.[0]
    setApplicationsFilters({
      search: filters.search,
      applicationStatus: statusFilter,
      applicationType: typeFilter
    })
  }

  // Filter summary functions
  const getLicenseFilterSummary = (filters: LicenseFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status && filters.status.length > 0) {
      parts.push(`Status: ${filters.status.join(', ')}`)
    }
    if (filters.sortOrder && filters.sortOrder !== 'recent') {
      parts.push(`Sort: ${filters.sortOrder === 'asc' ? 'A-Z' : 'Z-A'}`)
    }
    return parts.join(' • ')
  }

  const getApplicationFilterSummary = (filters: ApplicationFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status && filters.status.length > 0) {
      parts.push(`Status: ${filters.status.join(', ')}`)
    }
    if (filters.types && filters.types.length > 0) {
      parts.push(`Types: ${filters.types.join(', ')}`)
    }
    return parts.join(' • ')
  }

  // Export configurations
  const licenseExportConfig: ExportConfig<License> = {
    filename: `licenses-${dayjs().format('YYYY-MM-DD')}`,
    title: 'Facility Licenses Report',
    columns: [
      { key: 'licenseNumber', label: 'License Number' },
      { key: 'registrationNumber', label: 'Registration Number' },
      { key: 'facilityType', label: 'Facility Type' },
      { key: 'owner', label: 'Owner' },
      { key: 'dateOfIssuance', label: 'Date of Issuance' },
      { key: 'dateOfExpiry', label: 'Date of Expiry' },
      { key: 'paymentStatus', label: 'Payment Status' },
      { key: 'status', label: 'Status' },
    ],
  }

  const applicationExportConfig: ExportConfig<LicenseApplication> = {
    filename: `applications-${dayjs().format('YYYY-MM-DD')}`,
    title: 'License Applications Report',
    columns: [
      { key: 'licenseApplicationId', label: 'Application ID' },
      { key: 'facilityName', label: 'Facility Name' },
      { key: 'applicationType', label: 'Application Type' },
      { key: 'licenseTypeName', label: 'License Type' },
      { key: 'applicationDate', label: 'Application Date' },
      { key: 'licenseFee', label: 'License Fee (KES)' },
      { key: 'applicationStatus', label: 'Status' },
    ],
  }

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/license-management' })}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Button>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <TabsList>
            <TabsTrigger value="licenses">All Licenses</TabsTrigger>
            <TabsTrigger value="appeals">License Appeals</TabsTrigger>
            <TabsTrigger value="applications">Applications</TabsTrigger>
          </TabsList>
        </div>

        {/* All Licenses Tab */}
        <TabsContent value="licenses" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <LicensesFilters
              searchText={licenseSearchText}
              onSearchChange={setLicenseSearchText}
              selectedStatuses={selectedLicenseStatuses}
              onStatusChange={handleLicenseStatusChange}
              sortOrder={licenseSortOrder}
              onSortChange={handleLicenseSortChange}
              activeFiltersCount={activeLicenseFiltersCount}
              onClearFilters={handleClearLicenseFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="license-saved-filters"
                currentFilters={currentLicenseFilters}
                onApplyFilters={handleApplySavedLicenseFilters}
                getFilterSummary={getLicenseFilterSummary}
              />
              <ExportButton
                data={licenses}
                config={licenseExportConfig}
                size="default"
              />
            </div>
          </div>

          {licensesError && (
            <Card className="border-destructive">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">{licensesError}</p>
              </CardContent>
            </Card>
          )}

          {isMobile || isTablet ? (
            <div className="space-y-4">
              {licenses.map((license) => (
                <LicenseCard
                  key={license.id}
                  license={license}
                  onClick={() => handleLicenseRowClick(license.licenseNumber)}
                />
              ))}
            </div>
          ) : (
            <LicensesTable
              licenses={licenses}
              loading={licensesLoading}
              onRowClick={handleLicenseRowClick}
              selectedIds={selectedLicenseIds}
              onToggleSelection={toggleLicenseSelection}
              onSelectAll={selectAllLicenses}
              onDeselectAll={deselectAllLicenses}
            />
          )}

          {/* Bulk Actions Bar for Licenses */}
          {activeTab === 'licenses' && (
            <BulkActionsBar
              selectedCount={selectedLicenseIds.size}
              onClear={deselectAllLicenses}
              actions={[
                {
                  label: 'Approve',
                  onClick: () => handleBulkAction('APPROVE'),
                  variant: 'default',
                  icon: <CheckCircle className="w-4 h-4" />,
                  loading: bulkLicenseActionLoading,
                },
                {
                  label: 'Deny',
                  onClick: () => handleBulkAction('DENY'),
                  variant: 'destructive',
                  icon: <XCircle className="w-4 h-4" />,
                  loading: bulkLicenseActionLoading,
                },
                {
                  label: 'Suspend',
                  onClick: () => handleBulkAction('SUSPEND'),
                  variant: 'secondary',
                  icon: <Ban className="w-4 h-4" />,
                  loading: bulkLicenseActionLoading,
                },
              ]}
            />
          )}

          {licensesPagination && licensesPagination.total_pages > 1 && (
            <PaginationControls
              currentPage={licensesPagination.page}
              totalPages={licensesPagination.total_pages}
              onPageChange={setLicensesPage}
              totalCount={licensesPagination.total_count}
              pageSize={licensesPagination.page_size}
              isMobile={isMobile}
            />
          )}

          {!licensesLoading && licenses.length === 0 && activeLicenseFiltersCount === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Licenses Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  There are currently no facility licenses in the system.
                </p>
              </CardContent>
            </Card>
          )}

          {!licensesLoading && licenses.length === 0 && activeLicenseFiltersCount > 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
                  No licenses match your current filters.
                </p>
                <Button variant="outline" onClick={handleClearLicenseFilters}>
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* License Appeals Tab */}

        <TabsContent value="appeals" className="space-y-6">
          <LicenseAppealsOverview />
          <LicenseAppealsView />
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <ApplicationsFilters
              searchText={appSearchText}
              onSearchChange={setAppSearchText}
              selectedStatuses={selectedAppStatuses}
              onStatusChange={handleAppStatusChange}
              selectedTypes={selectedAppTypes}
              onTypeChange={handleAppTypeChange}
              activeFiltersCount={activeAppFiltersCount}
              onClearFilters={handleClearAppFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="application-saved-filters"
                currentFilters={currentApplicationFilters}
                onApplyFilters={handleApplySavedApplicationFilters}
                getFilterSummary={getApplicationFilterSummary}
              />
              <ExportButton
                data={applications}
                config={applicationExportConfig}
                size="default"
              />
            </div>
          </div>

          {applicationsError && (
            <Card className="border-destructive">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">{applicationsError}</p>
              </CardContent>
            </Card>
          )}

          {isMobile || isTablet ? (
            <div className="space-y-4">
              {applications.map((app) => (
                <ApplicationCard
                  key={app.id}
                  application={app}
                  onClick={() => handleApplicationRowClick(app.licenseApplicationId)}
                />
              ))}
            </div>
          ) : (
            <ApplicationsTable
              applications={applications}
              loading={applicationsLoading}
              onRowClick={handleApplicationRowClick}
            />
          )}

          {applicationsPagination && applicationsPagination.total_pages > 1 && (
            <PaginationControls
              currentPage={applicationsPagination.page}
              totalPages={applicationsPagination.total_pages}
              onPageChange={setApplicationsPage}
              totalCount={applicationsPagination.total_count}
              pageSize={applicationsPagination.page_size}
              isMobile={isMobile}
            />
          )}

          {!applicationsLoading && applications.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-6 mb-4">
                  <FileText className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Applications Found</h3>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  {activeAppFiltersCount > 0
                    ? 'No applications match your current filters.'
                    : 'There are currently no license applications.'}
                </p>
                {activeAppFiltersCount > 0 && (
                  <Button variant="outline" onClick={handleClearAppFilters} className="mt-4">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Application Detail Modal */}
      <ApplicationDetailModal
        isOpen={showApplicationModal}
        onClose={() => {
          setShowApplicationModal(false)
          setSelectedApplication(null)
        }}
        application={selectedApplication}
        loading={false}
      />

      {/* Bulk Action Confirmation Dialog */}
      <BulkActionConfirmDialog
        isOpen={showBulkActionDialog}
        onClose={() => {
          setShowBulkActionDialog(false)
          setBulkActionType(null)
        }}
        title={`${bulkActionType ? getBulkActionLabel(bulkActionType) : ''} Selected Licenses`}
        description={`You are about to ${bulkActionType ? getBulkActionLabel(bulkActionType).toLowerCase() : 'update'} the selected licenses. This action will change their status accordingly.`}
        selectedCount={selectedLicenseIds.size}
        actionLabel={`${bulkActionType ? getBulkActionLabel(bulkActionType) : 'Update'} All`}
        requiresReason={bulkActionType === 'DENY' || bulkActionType === 'SUSPEND'}
        onConfirm={handleBulkActionConfirm}
        variant={bulkActionType === 'DENY' || bulkActionType === 'SUSPEND' ? 'destructive' : 'default'}
      />
    </div>
  )
}
