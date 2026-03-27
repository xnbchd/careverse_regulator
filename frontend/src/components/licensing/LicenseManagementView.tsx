import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useLicensingStore } from "@/stores/licensingStore"
import { useNotificationStore, createNotification } from "@/stores/notificationStore"
import { useResponsive } from "@/hooks/useResponsive"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ArrowLeft,
  Building2,
  UserRound,
  FileText,
  CheckCircle,
  XCircle,
  Ban,
  Scale,
} from "lucide-react"
import LicensesTable from "./LicensesTable"
import LicenseCard from "./LicenseCard"
import LicensesFilters from "./LicensesFilters"
import ApplicationsTable from "./ApplicationsTable"
import ApplicationCard from "./ApplicationCard"
import ApplicationsFilters from "./ApplicationsFilters"
import ProfessionalApplicationsTable from "./ProfessionalApplicationsTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import SavedFiltersManager from "@/components/shared/SavedFiltersManager"
import BulkActionsBar from "@/components/shared/BulkActionsBar"
import BulkActionConfirmDialog from "@/components/shared/BulkActionConfirmDialog"
import LicenseAppealsView from "./LicenseAppealsView"
import { LicenseAppealsOverview } from "./LicenseAppealsOverview"
import type {
  LicenseApplication,
  ProfessionalLicenseApplication,
  License,
  LicenseAction,
} from "@/types/license"
import type { ExportConfig } from "@/utils/exportUtils"
import { toast } from "sonner"
import dayjs from "dayjs"

interface LicenseManagementViewProps {
  company?: string | null
}

interface LicenseFiltersState {
  search?: string
  status?: string[]
  sortOrder?: "asc" | "desc" | "recent"
}

interface ApplicationFiltersState {
  search?: string
  status?: string[]
  types?: string[]
}

type TabValue = "facility-applications" | "professional-applications"

export default function LicenseManagementView({}: LicenseManagementViewProps) {
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
    professionalApplications,
    professionalApplicationsLoading,
    professionalApplicationsError,
    professionalApplicationsPagination,
    professionalApplicationsFilters,
    setProfessionalApplicationsFilters,
    setProfessionalApplicationsPage,
    selectedLicenseIds,
    bulkLicenseActionLoading,
    toggleLicenseSelection,
    selectAllLicenses,
    deselectAllLicenses,
    bulkUpdateLicenseStatus,
  } = useLicensingStore()
  const { addNotification } = useNotificationStore()

  const { isMobile, isTablet } = useResponsive()

  const [activeTab, setActiveTab] = useState<TabValue>("facility-applications")

  // Bulk action dialog state
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<LicenseAction | null>(null)

  // Selection state for application tables
  const [selectedFacilityAppIds, setSelectedFacilityAppIds] = useState<Set<string>>(new Set())
  const [selectedProfAppIds, setSelectedProfAppIds] = useState<Set<string>>(new Set())

  // --- Licenses Filters ---
  const [licenseSearchText, setLicenseSearchText] = useState(licensesFilters.search || "")
  const [selectedLicenseStatuses, setSelectedLicenseStatuses] = useState<string[]>(
    licensesFilters.status ? licensesFilters.status.split(",") : ["all"]
  )
  const [licenseSortOrder, setLicenseSortOrder] = useState<"asc" | "desc" | "recent">("recent")

  // --- Facility Applications Filters ---
  const [facilityAppSearchText, setFacilityAppSearchText] = useState(
    applicationsFilters.search || ""
  )
  const [selectedFacilityAppStatuses, setSelectedFacilityAppStatuses] = useState<string[]>(["all"])
  const [selectedFacilityAppTypes, setSelectedFacilityAppTypes] = useState<string[]>(["all"])

  // --- Professional Applications Filters ---
  const [profAppSearchText, setProfAppSearchText] = useState(
    professionalApplicationsFilters.search || ""
  )
  const [selectedProfAppStatuses, setSelectedProfAppStatuses] = useState<string[]>(["all"])
  const [selectedProfAppTypes, setSelectedProfAppTypes] = useState<string[]>(["all"])

  // Debounce license search
  useEffect(() => {
    const timer = setTimeout(() => {
      setLicensesFilters({ ...licensesFilters, search: licenseSearchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [licenseSearchText])

  // Debounce facility application search
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplicationsFilters({ ...applicationsFilters, search: facilityAppSearchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [facilityAppSearchText])

  // Debounce professional application search
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfessionalApplicationsFilters({
        ...professionalApplicationsFilters,
        search: profAppSearchText || undefined,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [profAppSearchText])

  // --- License Handlers ---
  const handleLicenseStatusChange = (statuses: string[]) => {
    setSelectedLicenseStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setLicensesFilters({ ...licensesFilters, status: statusFilter })
  }

  const handleLicenseSortChange = (order: "asc" | "desc" | "recent") => {
    setLicenseSortOrder(order)
    if (order === "asc") {
      setLicensesFilters({ ...licensesFilters, sortBy: "license_number", sortOrder: "asc" })
    } else if (order === "desc") {
      setLicensesFilters({ ...licensesFilters, sortBy: "license_number", sortOrder: "desc" })
    } else {
      setLicensesFilters({ ...licensesFilters, sortBy: "expiry_date", sortOrder: "desc" })
    }
  }

  const handleClearLicenseFilters = () => {
    setLicenseSearchText("")
    setSelectedLicenseStatuses(["all"])
    setLicenseSortOrder("recent")
    setLicensesFilters({})
  }

  const handleLicenseRowClick = (licenseNumber: string) => {
    navigate({ to: `/license-management/${licenseNumber}` })
  }

  // --- Facility Application Handlers ---
  const handleFacilityAppStatusChange = (statuses: string[]) => {
    setSelectedFacilityAppStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setApplicationsFilters({ ...applicationsFilters, applicationStatus: statusFilter })
  }

  const handleFacilityAppTypeChange = (types: string[]) => {
    setSelectedFacilityAppTypes(types)
    const typeFilter = types.includes("all") ? undefined : types[0]
    setApplicationsFilters({ ...applicationsFilters, applicationType: typeFilter })
  }

  const handleClearFacilityAppFilters = () => {
    setFacilityAppSearchText("")
    setSelectedFacilityAppStatuses(["all"])
    setSelectedFacilityAppTypes(["all"])
    setApplicationsFilters({})
  }

  const handleFacilityAppRowClick = (applicationId: string) => {
    navigate({
      to: "/license-management/facility-application/$applicationId",
      params: { applicationId },
    } as any)
  }

  // --- Professional Application Handlers ---
  const handleProfAppStatusChange = (statuses: string[]) => {
    setSelectedProfAppStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setProfessionalApplicationsFilters({
      ...professionalApplicationsFilters,
      applicationStatus: statusFilter,
    })
  }

  const handleProfAppTypeChange = (types: string[]) => {
    setSelectedProfAppTypes(types)
    const typeFilter = types.includes("all") ? undefined : types[0]
    setProfessionalApplicationsFilters({
      ...professionalApplicationsFilters,
      applicationType: typeFilter,
    })
  }

  const handleClearProfAppFilters = () => {
    setProfAppSearchText("")
    setSelectedProfAppStatuses(["all"])
    setSelectedProfAppTypes(["all"])
    setProfessionalApplicationsFilters({})
  }

  const handleProfAppRowClick = (applicationId: string) => {
    navigate({
      to: "/license-management/professional-application/$applicationId",
      params: { applicationId },
    } as any)
  }

  // Selection helpers
  const toggleSelection = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFn(next)
  }

  // Bulk action handlers
  const handleBulkAction = (action: LicenseAction) => {
    setBulkActionType(action)
    setShowBulkActionDialog(true)
  }

  const handleBulkActionConfirm = async () => {
    if (!bulkActionType) return { succeeded: [] as string[], failed: [] as string[] }

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
      APPROVE: "Approve",
      DENY: "Deny",
      SUSPEND: "Suspend",
      SET_EXPIRED: "Set as Expired",
      REVIEW: "Review",
      RENEWAL_REVIEW: "Renewal Review",
      REQUEST_INFO: "Request Info",
    }
    return labels[action]
  }

  // Active filter counts
  const activeLicenseFiltersCount =
    (licenseSearchText ? 1 : 0) +
    (!selectedLicenseStatuses.includes("all") ? 1 : 0) +
    (licenseSortOrder !== "recent" ? 1 : 0)

  const activeFacilityAppFilters =
    (facilityAppSearchText ? 1 : 0) +
    (!selectedFacilityAppStatuses.includes("all") ? 1 : 0) +
    (!selectedFacilityAppTypes.includes("all") ? 1 : 0)

  const activeProfAppFilters =
    (profAppSearchText ? 1 : 0) +
    (!selectedProfAppStatuses.includes("all") ? 1 : 0) +
    (!selectedProfAppTypes.includes("all") ? 1 : 0)

  // Saved filter state
  const currentLicenseFilters: LicenseFiltersState = {
    search: licenseSearchText || undefined,
    status: selectedLicenseStatuses.includes("all") ? undefined : selectedLicenseStatuses,
    sortOrder: licenseSortOrder,
  }

  const currentFacilityAppFilters: ApplicationFiltersState = {
    search: facilityAppSearchText || undefined,
    status: selectedFacilityAppStatuses.includes("all") ? undefined : selectedFacilityAppStatuses,
    types: selectedFacilityAppTypes.includes("all") ? undefined : selectedFacilityAppTypes,
  }

  const currentProfAppFilters: ApplicationFiltersState = {
    search: profAppSearchText || undefined,
    status: selectedProfAppStatuses.includes("all") ? undefined : selectedProfAppStatuses,
    types: selectedProfAppTypes.includes("all") ? undefined : selectedProfAppTypes,
  }

  // Apply saved filters handlers
  const handleApplySavedLicenseFilters = (filters: LicenseFiltersState) => {
    setLicenseSearchText(filters.search || "")
    setSelectedLicenseStatuses(filters.status || ["all"])
    setLicenseSortOrder(filters.sortOrder || "recent")

    const statusFilter = filters.status?.join(",")
    if (filters.sortOrder === "asc") {
      setLicensesFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "license_number",
        sortOrder: "asc",
      })
    } else if (filters.sortOrder === "desc") {
      setLicensesFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "license_number",
        sortOrder: "desc",
      })
    } else {
      setLicensesFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "expiry_date",
        sortOrder: "desc",
      })
    }
  }

  const handleApplySavedAppFilters = (
    filters: ApplicationFiltersState,
    setSearch: (v: string) => void,
    setStatuses: (v: string[]) => void,
    setTypes: (v: string[]) => void,
    setStoreFilters: (f: any) => void
  ) => {
    setSearch(filters.search || "")
    setStatuses(filters.status || ["all"])
    setTypes(filters.types || ["all"])
    const statusFilter = filters.status?.join(",")
    const typeFilter = filters.types?.[0]
    setStoreFilters({
      search: filters.search,
      applicationStatus: statusFilter,
      applicationType: typeFilter,
    })
  }

  // Filter summary functions
  const getLicenseFilterSummary = (filters: LicenseFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status?.length) parts.push(`Status: ${filters.status.join(", ")}`)
    if (filters.sortOrder && filters.sortOrder !== "recent")
      parts.push(`Sort: ${filters.sortOrder === "asc" ? "A-Z" : "Z-A"}`)
    return parts.join(" • ")
  }

  const getAppFilterSummary = (filters: ApplicationFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status?.length) parts.push(`Status: ${filters.status.join(", ")}`)
    if (filters.types?.length) parts.push(`Types: ${filters.types.join(", ")}`)
    return parts.join(" • ")
  }

  // Export configs
  const licenseExportConfig: ExportConfig<License> = {
    filename: `licenses-${dayjs().format("YYYY-MM-DD")}`,
    title: "Facility Licenses Report",
    columns: [
      { key: "licenseNumber", label: "License Number" },
      { key: "registrationNumber", label: "Registration Number" },
      { key: "facilityType", label: "Facility Type" },
      { key: "owner", label: "Owner" },
      { key: "dateOfIssuance", label: "Date of Issuance" },
      { key: "dateOfExpiry", label: "Date of Expiry" },
      { key: "paymentStatus", label: "Payment Status" },
      { key: "status", label: "Status" },
    ],
  }

  const facilityAppExportConfig: ExportConfig<LicenseApplication> = {
    filename: `facility-applications-${dayjs().format("YYYY-MM-DD")}`,
    title: "Facility License Applications Report",
    columns: [
      { key: "licenseApplicationId", label: "Application ID" },
      { key: "facilityName", label: "Facility Name" },
      { key: "applicationType", label: "Application Type" },
      { key: "licenseTypeName", label: "License Type" },
      { key: "applicationDate", label: "Application Date" },
      { key: "licenseFee", label: "License Fee (KES)" },
      { key: "applicationStatus", label: "Status" },
    ],
  }

  const profAppExportConfig: ExportConfig<ProfessionalLicenseApplication> = {
    filename: `professional-applications-${dayjs().format("YYYY-MM-DD")}`,
    title: "Professional License Applications Report",
    columns: [
      { key: "licenseApplicationId", label: "Application ID" },
      { key: "fullName", label: "Name" },
      { key: "registrationNumber", label: "Registration Number" },
      { key: "applicationType", label: "Application Type" },
      { key: "licenseTypeName", label: "License Type" },
      { key: "applicationDate", label: "Application Date" },
      { key: "licenseFee", label: "License Fee (KES)" },
      { key: "applicationStatus", label: "Status" },
    ],
  }

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/license-management" })}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Button>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
        <div className="mb-6">
          <TabsList>
            <TabsTrigger value="facility-applications">
              <Building2 className="h-4 w-4 mr-1.5" />
              Facility Applications
            </TabsTrigger>
            <TabsTrigger value="professional-applications">
              <UserRound className="h-4 w-4 mr-1.5" />
              Professional Applications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ==================== Facility Applications ==================== */}
        <TabsContent value="facility-applications" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <ApplicationsFilters
              searchText={facilityAppSearchText}
              onSearchChange={setFacilityAppSearchText}
              selectedStatuses={selectedFacilityAppStatuses}
              onStatusChange={handleFacilityAppStatusChange}
              selectedTypes={selectedFacilityAppTypes}
              onTypeChange={handleFacilityAppTypeChange}
              activeFiltersCount={activeFacilityAppFilters}
              onClearFilters={handleClearFacilityAppFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="facility-application-saved-filters"
                currentFilters={currentFacilityAppFilters}
                onApplyFilters={(f) =>
                  handleApplySavedAppFilters(
                    f,
                    setFacilityAppSearchText,
                    setSelectedFacilityAppStatuses,
                    setSelectedFacilityAppTypes,
                    setApplicationsFilters
                  )
                }
                getFilterSummary={getAppFilterSummary}
              />
              <ExportButton data={applications} config={facilityAppExportConfig} size="default" />
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
                  onClick={() => handleFacilityAppRowClick(app.licenseApplicationId)}
                />
              ))}
            </div>
          ) : (
            <ApplicationsTable
              applications={applications}
              loading={applicationsLoading}
              onRowClick={handleFacilityAppRowClick}
              selectedIds={selectedFacilityAppIds}
              onToggleSelection={(id) =>
                toggleSelection(selectedFacilityAppIds, setSelectedFacilityAppIds, id)
              }
              onSelectAll={() =>
                setSelectedFacilityAppIds(new Set(applications.map((a) => a.licenseApplicationId)))
              }
              onDeselectAll={() => setSelectedFacilityAppIds(new Set())}
              emptyState={
                <EmptyStateInline
                  icon={Building2}
                  title="No Facility Applications Found"
                  description={
                    activeFacilityAppFilters > 0
                      ? "No facility applications match your current filters."
                      : "There are currently no facility license applications."
                  }
                  onClear={activeFacilityAppFilters > 0 ? handleClearFacilityAppFilters : undefined}
                />
              }
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
        </TabsContent>

        {/* ==================== Professional Applications ==================== */}
        <TabsContent value="professional-applications" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <ApplicationsFilters
              searchText={profAppSearchText}
              onSearchChange={setProfAppSearchText}
              selectedStatuses={selectedProfAppStatuses}
              onStatusChange={handleProfAppStatusChange}
              selectedTypes={selectedProfAppTypes}
              onTypeChange={handleProfAppTypeChange}
              activeFiltersCount={activeProfAppFilters}
              onClearFilters={handleClearProfAppFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="professional-application-saved-filters"
                currentFilters={currentProfAppFilters}
                onApplyFilters={(f) =>
                  handleApplySavedAppFilters(
                    f,
                    setProfAppSearchText,
                    setSelectedProfAppStatuses,
                    setSelectedProfAppTypes,
                    setProfessionalApplicationsFilters
                  )
                }
                getFilterSummary={getAppFilterSummary}
              />
              <ExportButton
                data={professionalApplications}
                config={profAppExportConfig}
                size="default"
              />
            </div>
          </div>

          {professionalApplicationsError && (
            <Card className="border-destructive">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">{professionalApplicationsError}</p>
              </CardContent>
            </Card>
          )}

          <ProfessionalApplicationsTable
            applications={professionalApplications}
            loading={professionalApplicationsLoading}
            onRowClick={handleProfAppRowClick}
            selectedIds={selectedProfAppIds}
            onToggleSelection={(id) =>
              toggleSelection(selectedProfAppIds, setSelectedProfAppIds, id)
            }
            onSelectAll={() =>
              setSelectedProfAppIds(
                new Set(professionalApplications.map((a) => a.licenseApplicationId))
              )
            }
            onDeselectAll={() => setSelectedProfAppIds(new Set())}
            emptyState={
              <EmptyStateInline
                icon={UserRound}
                title="No Professional Applications Found"
                description={
                  activeProfAppFilters > 0
                    ? "No professional applications match your current filters."
                    : "There are currently no professional license applications."
                }
                onClear={activeProfAppFilters > 0 ? handleClearProfAppFilters : undefined}
              />
            }
          />

          {professionalApplicationsPagination &&
            professionalApplicationsPagination.total_pages > 1 && (
              <PaginationControls
                currentPage={professionalApplicationsPagination.page}
                totalPages={professionalApplicationsPagination.total_pages}
                onPageChange={setProfessionalApplicationsPage}
                totalCount={professionalApplicationsPagination.total_count}
                pageSize={professionalApplicationsPagination.page_size}
                isMobile={isMobile}
              />
            )}
        </TabsContent>
      </Tabs>

      {/* Bulk Action Confirmation Dialog */}
      <BulkActionConfirmDialog
        isOpen={showBulkActionDialog}
        onClose={() => {
          setShowBulkActionDialog(false)
          setBulkActionType(null)
        }}
        title={`${bulkActionType ? getBulkActionLabel(bulkActionType) : ""} Selected Licenses`}
        description={`You are about to ${
          bulkActionType ? getBulkActionLabel(bulkActionType).toLowerCase() : "update"
        } the selected licenses. This action will change their status accordingly.`}
        selectedCount={selectedLicenseIds.size}
        actionLabel={`${bulkActionType ? getBulkActionLabel(bulkActionType) : "Update"} All`}
        requiresReason={bulkActionType === "DENY" || bulkActionType === "SUSPEND"}
        onConfirm={handleBulkActionConfirm}
        variant={
          bulkActionType === "DENY" || bulkActionType === "SUSPEND" ? "destructive" : "default"
        }
      />
    </div>
  )
}

function EmptyStateInline({
  icon: Icon,
  title,
  description,
  onClear,
}: {
  icon: any
  title: string
  description: string
  onClear?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-4">
      <div className="rounded-full bg-muted p-4 mb-3">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-base font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground text-center max-w-md mb-3">{description}</p>
      {onClear && (
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Filters
        </Button>
      )}
    </div>
  )
}
