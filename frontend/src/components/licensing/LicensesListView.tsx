import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useLicensingStore } from "@/stores/licensingStore"
import { useNotificationStore, createNotification } from "@/stores/notificationStore"
import { useResponsive } from "@/hooks/useResponsive"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Building2, UserRound, CheckCircle, XCircle, Ban } from "lucide-react"
import LicensesTable from "./LicensesTable"
import LicenseCard from "./LicenseCard"
import LicensesFilters from "./LicensesFilters"
import ProfessionalLicensesTable from "./ProfessionalLicensesTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import SavedFiltersManager from "@/components/shared/SavedFiltersManager"
import BulkActionsBar from "@/components/shared/BulkActionsBar"
import BulkActionConfirmDialog from "@/components/shared/BulkActionConfirmDialog"
import type { License, ProfessionalLicenseRecord, LicenseAction } from "@/types/license"
import type { ExportConfig } from "@/utils/exportUtils"
import { toast } from "sonner"
import dayjs from "dayjs"

interface LicensesListViewProps {
  company?: string | null
}

interface LicenseFiltersState {
  search?: string
  status?: string[]
  sortOrder?: "asc" | "desc" | "recent"
}

type TabValue = "facility-licenses" | "professional-licenses"

export default function LicensesListView({ company }: LicensesListViewProps) {
  const navigate = useNavigate()
  const {
    licenses,
    licensesLoading,
    licensesError,
    licensesPagination,
    licensesFilters,
    setLicensesFilters,
    setLicensesPage,
    professionalLicenses,
    professionalLicensesLoading,
    professionalLicensesError,
    professionalLicensesPagination,
    professionalLicensesFilters,
    setProfessionalLicensesFilters,
    setProfessionalLicensesPage,
    selectedLicenseIds,
    bulkLicenseActionLoading,
    toggleLicenseSelection,
    selectAllLicenses,
    deselectAllLicenses,
    bulkUpdateLicenseStatus,
  } = useLicensingStore()
  const { addNotification } = useNotificationStore()

  const { isMobile, isTablet } = useResponsive()

  const [activeTab, setActiveTab] = useState<TabValue>("facility-licenses")

  // Bulk action dialog state
  const [showBulkActionDialog, setShowBulkActionDialog] = useState(false)
  const [bulkActionType, setBulkActionType] = useState<LicenseAction | null>(null)

  // Selection state for professional licenses (no store-level selection)
  const [selectedProfLicIds, setSelectedProfLicIds] = useState<Set<string>>(new Set())

  // --- Facility Licenses Filters ---
  const [facilitySearchText, setFacilitySearchText] = useState(licensesFilters.search || "")
  const [selectedFacilityStatuses, setSelectedFacilityStatuses] = useState<string[]>(
    licensesFilters.status ? licensesFilters.status.split(",") : ["all"]
  )
  const [facilitySortOrder, setFacilitySortOrder] = useState<"asc" | "desc" | "recent">("recent")

  // --- Professional Licenses Filters ---
  const [profLicSearchText, setProfLicSearchText] = useState(
    professionalLicensesFilters.search || ""
  )
  const [selectedProfLicStatuses, setSelectedProfLicStatuses] = useState<string[]>(["all"])
  const [profLicSortOrder, setProfLicSortOrder] = useState<"asc" | "desc" | "recent">("recent")

  // Debounce searches
  useEffect(() => {
    const timer = setTimeout(() => {
      setLicensesFilters({ ...licensesFilters, search: facilitySearchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [facilitySearchText])

  useEffect(() => {
    const timer = setTimeout(() => {
      setProfessionalLicensesFilters({
        ...professionalLicensesFilters,
        search: profLicSearchText || undefined,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [profLicSearchText])

  // --- Facility License Handlers ---
  const handleFacilityStatusChange = (statuses: string[]) => {
    setSelectedFacilityStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setLicensesFilters({ ...licensesFilters, status: statusFilter })
  }

  const handleFacilitySortChange = (order: "asc" | "desc" | "recent") => {
    setFacilitySortOrder(order)
    if (order === "asc") {
      setLicensesFilters({ ...licensesFilters, sortBy: "license_number", sortOrder: "asc" })
    } else if (order === "desc") {
      setLicensesFilters({ ...licensesFilters, sortBy: "license_number", sortOrder: "desc" })
    } else {
      setLicensesFilters({ ...licensesFilters, sortBy: "expiry_date", sortOrder: "desc" })
    }
  }

  const handleClearFacilityFilters = () => {
    setFacilitySearchText("")
    setSelectedFacilityStatuses(["all"])
    setFacilitySortOrder("recent")
    setLicensesFilters({})
  }

  // --- Professional License Handlers ---
  const handleProfLicStatusChange = (statuses: string[]) => {
    setSelectedProfLicStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setProfessionalLicensesFilters({ ...professionalLicensesFilters, status: statusFilter })
  }

  const handleProfLicSortChange = (order: "asc" | "desc" | "recent") => {
    setProfLicSortOrder(order)
    if (order === "asc") {
      setProfessionalLicensesFilters({
        ...professionalLicensesFilters,
        sortBy: "license_number",
        sortOrder: "asc",
      })
    } else if (order === "desc") {
      setProfessionalLicensesFilters({
        ...professionalLicensesFilters,
        sortBy: "license_number",
        sortOrder: "desc",
      })
    } else {
      setProfessionalLicensesFilters({
        ...professionalLicensesFilters,
        sortBy: "expiry_date",
        sortOrder: "desc",
      })
    }
  }

  const handleClearProfLicFilters = () => {
    setProfLicSearchText("")
    setSelectedProfLicStatuses(["all"])
    setProfLicSortOrder("recent")
    setProfessionalLicensesFilters({})
  }

  // Selection helpers
  const toggleSelection = (set: Set<string>, setFn: (s: Set<string>) => void, id: string) => {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setFn(next)
  }

  // Row click handler
  const handleLicenseRowClick = (licenseNumber: string) => {
    navigate({ to: `/license-management/${licenseNumber}` })
  }

  // Bulk action handlers
  const handleBulkAction = (action: LicenseAction) => {
    setBulkActionType(action)
    setShowBulkActionDialog(true)
  }

  const handleBulkActionConfirm = async (_reason?: string) => {
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
  const activeFacilityLicFilters =
    (facilitySearchText ? 1 : 0) +
    (!selectedFacilityStatuses.includes("all") ? 1 : 0) +
    (facilitySortOrder !== "recent" ? 1 : 0)

  const activeProfLicFilters =
    (profLicSearchText ? 1 : 0) +
    (!selectedProfLicStatuses.includes("all") ? 1 : 0) +
    (profLicSortOrder !== "recent" ? 1 : 0)

  // Saved filter helpers
  const currentFacilityLicFilters: LicenseFiltersState = {
    search: facilitySearchText || undefined,
    status: selectedFacilityStatuses.includes("all") ? undefined : selectedFacilityStatuses,
    sortOrder: facilitySortOrder,
  }

  const currentProfLicFilters: LicenseFiltersState = {
    search: profLicSearchText || undefined,
    status: selectedProfLicStatuses.includes("all") ? undefined : selectedProfLicStatuses,
    sortOrder: profLicSortOrder,
  }

  const handleApplySavedLicenseFilters = (
    filters: LicenseFiltersState,
    setSearch: (v: string) => void,
    setStatuses: (v: string[]) => void,
    setSort: (v: "asc" | "desc" | "recent") => void,
    setStoreFilters: (f: any) => void
  ) => {
    setSearch(filters.search || "")
    setStatuses(filters.status || ["all"])
    setSort(filters.sortOrder || "recent")
    const statusFilter = filters.status?.join(",")
    if (filters.sortOrder === "asc") {
      setStoreFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "license_number",
        sortOrder: "asc",
      })
    } else if (filters.sortOrder === "desc") {
      setStoreFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "license_number",
        sortOrder: "desc",
      })
    } else {
      setStoreFilters({
        search: filters.search,
        status: statusFilter,
        sortBy: "expiry_date",
        sortOrder: "desc",
      })
    }
  }

  const getLicenseFilterSummary = (filters: LicenseFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status?.length) parts.push(`Status: ${filters.status.join(", ")}`)
    if (filters.sortOrder && filters.sortOrder !== "recent")
      parts.push(`Sort: ${filters.sortOrder === "asc" ? "A-Z" : "Z-A"}`)
    return parts.join(" • ")
  }

  // Export configs
  const facilityLicenseExportConfig: ExportConfig<License> = {
    filename: `facility-licenses-${dayjs().format("YYYY-MM-DD")}`,
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

  const profLicenseExportConfig: ExportConfig<ProfessionalLicenseRecord> = {
    filename: `professional-licenses-${dayjs().format("YYYY-MM-DD")}`,
    title: "Professional Licenses Report",
    columns: [
      { key: "licenseNumber", label: "License Number" },
      { key: "name", label: "Name" },
      { key: "registrationNumber", label: "Registration Number" },
      { key: "category", label: "Category" },
      { key: "licenseType", label: "License Type" },
      { key: "dateOfIssuance", label: "Date of Issuance" },
      { key: "dateOfExpiry", label: "Date of Expiry" },
      { key: "paymentStatus", label: "Payment Status" },
      { key: "licenseStatus", label: "Status" },
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
            <TabsTrigger value="facility-licenses">
              <Building2 className="h-4 w-4 mr-1.5" />
              Facility Licenses
            </TabsTrigger>
            <TabsTrigger value="professional-licenses">
              <UserRound className="h-4 w-4 mr-1.5" />
              Professional Licenses
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ==================== Facility Licenses ==================== */}
        <TabsContent value="facility-licenses" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <LicensesFilters
              searchText={facilitySearchText}
              onSearchChange={setFacilitySearchText}
              selectedStatuses={selectedFacilityStatuses}
              onStatusChange={handleFacilityStatusChange}
              sortOrder={facilitySortOrder}
              onSortChange={handleFacilitySortChange}
              activeFiltersCount={activeFacilityLicFilters}
              onClearFilters={handleClearFacilityFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="facility-license-saved-filters"
                currentFilters={currentFacilityLicFilters}
                onApplyFilters={(f) =>
                  handleApplySavedLicenseFilters(
                    f,
                    setFacilitySearchText,
                    setSelectedFacilityStatuses,
                    setFacilitySortOrder,
                    setLicensesFilters
                  )
                }
                getFilterSummary={getLicenseFilterSummary}
              />
              <ExportButton data={licenses} config={facilityLicenseExportConfig} size="default" />
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
              emptyState={
                <EmptyStateInline
                  icon={Building2}
                  title="No Facility Licenses Found"
                  description={
                    activeFacilityLicFilters > 0
                      ? "No facility licenses match your current filters."
                      : "There are currently no health facility licenses in the system."
                  }
                  onClear={activeFacilityLicFilters > 0 ? handleClearFacilityFilters : undefined}
                />
              }
            />
          )}

          <BulkActionsBar
            selectedCount={selectedLicenseIds.size}
            onClear={deselectAllLicenses}
            actions={[
              {
                label: "Approve",
                onClick: () => handleBulkAction("APPROVE"),
                variant: "default",
                icon: <CheckCircle className="w-4 h-4" />,
                loading: bulkLicenseActionLoading,
              },
              {
                label: "Deny",
                onClick: () => handleBulkAction("DENY"),
                variant: "destructive",
                icon: <XCircle className="w-4 h-4" />,
                loading: bulkLicenseActionLoading,
              },
              {
                label: "Suspend",
                onClick: () => handleBulkAction("SUSPEND"),
                variant: "secondary",
                icon: <Ban className="w-4 h-4" />,
                loading: bulkLicenseActionLoading,
              },
            ]}
          />

          {licensesPagination && (
            <PaginationControls
              currentPage={licensesPagination.page}
              totalPages={licensesPagination.total_pages}
              onPageChange={setLicensesPage}
              totalCount={licensesPagination.total_count}
              pageSize={licensesPagination.page_size}
              isMobile={isMobile}
            />
          )}
        </TabsContent>

        {/* ==================== Professional Licenses ==================== */}
        <TabsContent value="professional-licenses" className="space-y-6">
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <LicensesFilters
              searchText={profLicSearchText}
              onSearchChange={setProfLicSearchText}
              selectedStatuses={selectedProfLicStatuses}
              onStatusChange={handleProfLicStatusChange}
              sortOrder={profLicSortOrder}
              onSortChange={handleProfLicSortChange}
              activeFiltersCount={activeProfLicFilters}
              onClearFilters={handleClearProfLicFilters}
            />
            <div className="flex gap-2">
              <SavedFiltersManager
                storageKey="professional-license-saved-filters"
                currentFilters={currentProfLicFilters}
                onApplyFilters={(f) =>
                  handleApplySavedLicenseFilters(
                    f,
                    setProfLicSearchText,
                    setSelectedProfLicStatuses,
                    setProfLicSortOrder,
                    setProfessionalLicensesFilters
                  )
                }
                getFilterSummary={getLicenseFilterSummary}
              />
              <ExportButton
                data={professionalLicenses}
                config={profLicenseExportConfig}
                size="default"
              />
            </div>
          </div>

          {professionalLicensesError && (
            <Card className="border-destructive">
              <CardContent className="py-4">
                <p className="text-sm text-destructive">{professionalLicensesError}</p>
              </CardContent>
            </Card>
          )}

          <ProfessionalLicensesTable
            licenses={professionalLicenses}
            loading={professionalLicensesLoading}
            onRowClick={handleLicenseRowClick}
            selectedIds={selectedProfLicIds}
            onToggleSelection={(id) =>
              toggleSelection(selectedProfLicIds, setSelectedProfLicIds, id)
            }
            onSelectAll={() =>
              setSelectedProfLicIds(new Set(professionalLicenses.map((l) => l.licenseNumber)))
            }
            onDeselectAll={() => setSelectedProfLicIds(new Set())}
            emptyState={
              <EmptyStateInline
                icon={UserRound}
                title="No Professional Licenses Found"
                description={
                  activeProfLicFilters > 0
                    ? "No professional licenses match your current filters."
                    : "There are currently no health professional licenses in the system."
                }
                onClear={activeProfLicFilters > 0 ? handleClearProfLicFilters : undefined}
              />
            }
          />

          {professionalLicensesPagination && (
            <PaginationControls
              currentPage={professionalLicensesPagination.page}
              totalPages={professionalLicensesPagination.total_pages}
              onPageChange={setProfessionalLicensesPage}
              totalCount={professionalLicensesPagination.total_count}
              pageSize={professionalLicensesPagination.page_size}
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
        } the selected licenses.`}
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
