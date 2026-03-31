import { useEffect, useState } from "react"
import { useNavigate, useSearch } from "@tanstack/react-router"
import { useInspectionStore } from "@/stores/inspectionStore"
import type { Inspection, Finding } from "@/types/inspection"
import { useFindingsStore } from "@/stores/findingsStore"
import * as inspectionApi from "@/api/inspectionApi"
import { useResponsive } from "@/hooks/useResponsive"
import { showSuccess, showError, extractErrorMessage } from "@/utils/toast"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import InspectionTable from "./InspectionTable"
import InspectionCard from "./InspectionCard"
import InspectionFilters from "./InspectionFilters"
import type { DateRange } from "./DateRangeSelector"
import ScheduleInspectionModal from "./ScheduleInspectionModal"
import FindingsTable from "./FindingsTable"
import FindingCard from "./FindingCard"
import FindingsFilters from "./FindingsFilters"
import FindingsDrawer from "./FindingsDrawer"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import SavedFiltersManager from "@/components/shared/SavedFiltersManager"
import { PageHeader } from "@/components/shared/PageHeader"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Calendar, Search as SearchIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import dayjs from "dayjs"
import type { ExportConfig } from "@/utils/exportUtils"

interface InspectionFiltersState {
  search?: string
  status?: string[]
  dateRange?: DateRange | null
  sortOrder?: "asc" | "desc" | "recent"
}

interface InspectionViewProps {
  company?: string | null
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function InspectionView(_: InspectionViewProps) {
  const navigate = useNavigate({ from: "/inspections/list" })
  const searchParams = useSearch({ from: "/inspections/list" })
  const { openDrawer } = useEntityDrawer()

  const { inspections, facilities, pagination, setPage, fetchInspections, createInspection } =
    useInspectionStore()
  const { findings, fetchFindings } = useFindingsStore()
  const { isMobile, isTablet } = useResponsive()

  // Get filter values from URL params — inlined (no useMemo per React Compiler rules)
  const activeTab = searchParams.activeTab || "scheduled"
  const searchText = searchParams.search || ""
  const modalParam = searchParams.modal

  // Stable string key for selectedStatuses — avoids new array reference every render
  // which would re-trigger the fetch useEffect on every render (infinite loop)
  const selectedStatusesKey = searchParams.status
    ? Array.isArray(searchParams.status)
      ? searchParams.status.join(",")
      : searchParams.status
    : "all"
  // Array form kept for passing to child components
  const selectedStatuses = selectedStatusesKey === "all" ? ["all"] : selectedStatusesKey.split(",")

  // Stable primitives for dateRange — avoids new object reference every render
  const dateRangeStart = searchParams.startDate ?? null
  const dateRangeEnd = searchParams.endDate ?? null
  // Object form kept for passing to child components
  const dateRange: DateRange | null =
    dateRangeStart && dateRangeEnd ? { start: dateRangeStart, end: dateRangeEnd } : null

  const sortOrder =
    searchParams.sortOrder === "desc" ? "desc" : searchParams.sortOrder === "asc" ? "asc" : "recent"

  // Local state for search input debouncing
  const [localSearchText, setLocalSearchText] = useState(searchText)

  // Modal and UI state (not in URL)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [formData, setFormData] = useState({
    facility: "",
    inspector: "",
    date: dayjs().format("DD/MM/YYYY"),
    note: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Findings tab state (could be moved to URL params in the future)
  const [findingsSearchText, setFindingsSearchText] = useState("")
  const [findingsDateRange, setFindingsDateRange] = useState<DateRange | null>(null)
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(["all"])
  const [selectedFindingStatuses, setSelectedFindingStatuses] = useState<string[]>(["all"])
  const [findingsSortOrder, setFindingsSortOrder] = useState<"asc" | "desc" | "recent">("asc")
  const [selectedFindingRowKeys, setSelectedFindingRowKeys] = useState<React.Key[]>([])
  const [selectedInspectionForDrawer, setSelectedInspectionForDrawer] = useState<Inspection | null>(
    null
  )
  const [loadingInspectionDetails, setLoadingInspectionDetails] = useState(false)
  const [isFindingModalVisible, setIsFindingModalVisible] = useState(false)

  // Debounce search text input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchText !== searchText) {
        navigate({
          search: (prev) => ({ ...prev, search: localSearchText || undefined }),
        })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [localSearchText, searchText, navigate])

  // Sync local search with URL on mount/change
  useEffect(() => {
    setLocalSearchText(searchText)
  }, [searchText])

  // Handle modal URL param
  useEffect(() => {
    if (modalParam === "schedule") {
      setIsModalVisible(true)
    }
  }, [modalParam])

  // Calculate active findings filter count
  const activeFindingsFiltersCount =
    (findingsSearchText ? 1 : 0) +
    (!selectedSeverities.includes("all") ? 1 : 0) +
    (!selectedFindingStatuses.includes("all") ? 1 : 0) +
    (findingsDateRange ? 1 : 0)

  // Fetch inspections when URL params change (Scheduled Inspections tab)
  useEffect(() => {
    if (activeTab === "scheduled") {
      const filters: any = {}
      if (searchText) filters.search = searchText
      if (dateRange) {
        filters.startDate = dateRange.start
        filters.endDate = dateRange.end
      }
      if (sortOrder === "asc") {
        filters.sortBy = "facility_name"
        filters.sortOrder = "asc"
      } else if (sortOrder === "desc") {
        filters.sortBy = "facility_name"
        filters.sortOrder = "desc"
      } else {
        filters.sortBy = "modified"
        filters.sortOrder = "desc"
      }

      // Add status filter (only if not 'all')
      if (!selectedStatuses.includes("all")) {
        filters.status = selectedStatuses.join(",")
      }

      fetchInspections(1, filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, selectedStatusesKey, dateRangeStart, dateRangeEnd, sortOrder, activeTab])

  // Fetch findings when filters change (Findings tab)
  useEffect(() => {
    if (activeTab === "findings") {
      const filters: any = {}
      if (findingsSearchText) filters.search = findingsSearchText
      if (findingsDateRange) {
        filters.startDate = findingsDateRange.start
        filters.endDate = findingsDateRange.end
      }
      if (findingsSortOrder === "asc") {
        filters.sortBy = "facility_name"
        filters.sortOrder = "asc"
      } else if (findingsSortOrder === "desc") {
        filters.sortBy = "facility_name"
        filters.sortOrder = "desc"
      } else {
        filters.sortBy = "modified"
        filters.sortOrder = "desc"
      }

      // Add severity filter (API-driven)
      if (!selectedSeverities.includes("all")) {
        filters.severity = selectedSeverities.join(",")
      }

      // Add status filter (API-driven)
      if (!selectedFindingStatuses.includes("all")) {
        filters.status = selectedFindingStatuses.join(",")
      }

      fetchFindings(filters)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    findingsSearchText,
    selectedSeverities,
    selectedFindingStatuses,
    findingsDateRange,
    findingsSortOrder,
    activeTab,
  ])

  // Get facilities from the store
  const allFacilities = facilities.map((f) => ({ value: f.name, label: f.facility_name }))

  // Calculate active filter count for inspections
  const activeInspectionFiltersCount =
    (searchText ? 1 : 0) + (!selectedStatuses.includes("all") ? 1 : 0) + (dateRange ? 1 : 0)

  // Use inspections directly from store (API-filtered)
  const filteredInspections = inspections

  // Export configuration for inspections
  const inspectionExportConfig: ExportConfig<Inspection> = {
    filename: `inspections-${dayjs().format("YYYY-MM-DD")}`,
    title: "Scheduled Inspections Report",
    columns: [
      { key: "inspectionId", label: "Inspection ID" },
      { key: "facilityName", label: "Facility Name" },
      { key: "inspector", label: "Inspector" },
      { key: "date", label: "Date" },
      { key: "status", label: "Status" },
      { key: "findingCount", label: "Findings Count" },
    ],
  }

  const handleScheduleInspection = async () => {
    setSubmitting(true)
    setModalError(null)

    try {
      await createInspection(formData)
      showSuccess("Inspection scheduled successfully")
      setIsModalVisible(false)
      setFormData({
        facility: "",
        inspector: "",
        date: dayjs().format("DD/MM/YYYY"),
        note: "",
      })
    } catch (error) {
      const errorMessage = extractErrorMessage(error)
      setModalError(errorMessage)
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewInspection = (inspection: Inspection) => {
    openDrawer("inspection", inspection)
  }

  // Use findings directly from store (API-filtered)
  const filteredFindings = findings

  // Export configuration for findings
  const findingsExportConfig: ExportConfig<Finding> = {
    filename: `findings-${dayjs().format("YYYY-MM-DD")}`,
    title: "Inspection Findings Report",
    columns: [
      { key: "findingId", label: "Finding ID" },
      { key: "facilityName", label: "Facility" },
      { key: "category", label: "Category" },
      { key: "severity", label: "Severity" },
      { key: "status", label: "Status" },
      { key: "description", label: "Description" },
    ],
  }

  const handleViewFinding = async (finding: Finding) => {
    if (!finding.inspectionId || loadingInspectionDetails) return

    setLoadingInspectionDetails(true)
    try {
      const fullInspection = await inspectionApi.getInspection(finding.inspectionId)
      setSelectedInspectionForDrawer(fullInspection)
      setIsFindingModalVisible(true)
    } catch {
      showError("Failed to load inspection details")
    } finally {
      setLoadingInspectionDetails(false)
    }
  }

  const handleTabChange = (tab: "scheduled" | "findings") => {
    navigate({
      search: (prev) => ({ ...prev, activeTab: tab }),
    })
  }

  const handleStatusChange = (statuses: string[]) => {
    navigate({
      search: (prev) => ({ ...prev, status: statuses.includes("all") ? undefined : statuses }),
    })
  }

  const handleDateRangeChange = (range: DateRange | null) => {
    navigate({
      search: (prev) => ({
        ...prev,
        startDate: range?.start,
        endDate: range?.end,
      }),
    })
  }

  const handleSortChange = (order: "asc" | "desc" | "recent") => {
    const sortBy = order === "recent" ? "modified" : "facility_name"
    navigate({
      search: (prev) => ({
        ...prev,
        sortBy,
        sortOrder: order === "recent" ? "desc" : order,
      }),
    })
  }

  // Saved Filters Integration
  const currentInspectionFilters: InspectionFiltersState = {
    search: searchText || undefined,
    status: selectedStatuses.includes("all") ? undefined : selectedStatuses,
    dateRange: dateRange || undefined,
    sortOrder: sortOrder,
  }

  const handleApplySavedFilters = (filters: InspectionFiltersState) => {
    setLocalSearchText(filters.search || "")
    navigate({
      search: {
        activeTab,
        search: filters.search,
        status: filters.status,
        startDate: filters.dateRange?.start,
        endDate: filters.dateRange?.end,
        sortOrder: filters.sortOrder,
      },
    })
  }

  const getInspectionFilterSummary = (filters: InspectionFiltersState): string => {
    const parts: string[] = []
    if (filters.search) parts.push(`Search: "${filters.search}"`)
    if (filters.status && !filters.status.includes("all")) {
      parts.push(`Status: ${filters.status.join(", ")}`)
    }
    if (filters.dateRange) {
      parts.push(`Date: ${filters.dateRange.start} to ${filters.dateRange.end}`)
    }
    if (filters.sortOrder && filters.sortOrder !== "recent") {
      parts.push(`Sort: ${filters.sortOrder === "asc" ? "A-Z" : "Z-A"}`)
    }
    return parts.join(" • ")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Inspections", href: "/inspections" }, { label: "All Inspections" }]}
        title="Inspection Management"
        subtitle="Schedule & View Facility Inspections"
        actions={
          <Button
            size="sm"
            onClick={() => {
              navigate({ search: (prev) => ({ ...prev, modal: "schedule" }) })
              setModalError(null)
            }}
          >
            Schedule Inspection
          </Button>
        }
      />

      {/* shadcn Tabs — value wired to URL activeTab param */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => handleTabChange(val as "scheduled" | "findings")}
        className="w-full"
      >
        <TabsList>
          <TabsTrigger value="scheduled">
            <Calendar className="h-4 w-4 mr-1.5" />
            Scheduled Inspections
          </TabsTrigger>
          <TabsTrigger value="findings">
            <SearchIcon className="h-4 w-4 mr-1.5" />
            Inspection Findings
          </TabsTrigger>
        </TabsList>

        {/* ── Scheduled Inspections tab ── */}
        <TabsContent value="scheduled" className="space-y-4 mt-4">
          {filteredInspections.length === 0 &&
          searchText === "" &&
          selectedStatuses.includes("all") ? (
            <Card>
              <CardContent
                className={cn(
                  "flex flex-col items-center justify-center",
                  isMobile ? "py-12" : "py-16"
                )}
              >
                <FileText
                  className={cn("text-muted-foreground mb-4", isMobile ? "w-12 h-12" : "w-16 h-16")}
                />
                <p
                  className={cn(
                    "font-semibold text-center mb-2",
                    isMobile ? "text-base" : "text-lg"
                  )}
                >
                  No Scheduled Inspections found
                </p>
                <p
                  className={cn(
                    "text-muted-foreground text-center m-0",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Click on "Schedule Inspection" to input new records
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div
                className={cn(
                  "flex justify-between items-start gap-4",
                  isMobile ? "flex-col" : "flex-row"
                )}
              >
                <InspectionFilters
                  searchText={localSearchText}
                  onSearchChange={setLocalSearchText}
                  selectedStatuses={selectedStatuses}
                  onStatusChange={handleStatusChange}
                  dateRange={dateRange}
                  onDateRangeChange={handleDateRangeChange}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                  activeFilterCount={activeInspectionFiltersCount}
                />
                <div className="flex gap-2">
                  <SavedFiltersManager
                    storageKey="inspection-saved-filters"
                    currentFilters={currentInspectionFilters}
                    onApplyFilters={handleApplySavedFilters}
                    getFilterSummary={getInspectionFilterSummary}
                  />
                  <ExportButton
                    data={filteredInspections}
                    config={inspectionExportConfig}
                    size="sm"
                  />
                </div>
              </div>

              {isMobile || isTablet ? (
                <div>
                  {filteredInspections.map((inspection) => (
                    <InspectionCard
                      key={inspection.id}
                      inspection={inspection}
                      onView={handleViewInspection}
                    />
                  ))}
                </div>
              ) : (
                <InspectionTable
                  inspections={filteredInspections}
                  selectedRowKeys={selectedRowKeys}
                  onSelectionChange={setSelectedRowKeys}
                  onViewInspection={handleViewInspection}
                />
              )}

              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                isMobile={isMobile}
              />
            </>
          )}
        </TabsContent>

        {/* ── Inspection Findings tab ── */}
        <TabsContent value="findings" className="space-y-4 mt-4">
          {filteredFindings.length === 0 &&
          findingsSearchText === "" &&
          selectedSeverities.includes("all") &&
          selectedFindingStatuses.includes("all") ? (
            <Card>
              <CardContent
                className={cn(
                  "flex flex-col items-center justify-center",
                  isMobile ? "py-12" : "py-16"
                )}
              >
                <FileText
                  className={cn("text-muted-foreground mb-4", isMobile ? "w-12 h-12" : "w-16 h-16")}
                />
                <p
                  className={cn(
                    "font-semibold text-center mb-2",
                    isMobile ? "text-base" : "text-lg"
                  )}
                >
                  No Inspection Findings available
                </p>
                <p
                  className={cn(
                    "text-muted-foreground text-center m-0",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  Inspection findings will appear here once inspections are completed
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div
                className={cn(
                  "flex justify-between items-start gap-4",
                  isMobile ? "flex-col" : "flex-row"
                )}
              >
                <FindingsFilters
                  searchText={findingsSearchText}
                  onSearchChange={setFindingsSearchText}
                  selectedSeverities={selectedSeverities}
                  onSeverityChange={setSelectedSeverities}
                  selectedStatuses={selectedFindingStatuses}
                  onStatusChange={setSelectedFindingStatuses}
                  dateRange={findingsDateRange}
                  onDateRangeChange={setFindingsDateRange}
                  sortOrder={findingsSortOrder}
                  onSortChange={setFindingsSortOrder}
                  activeFilterCount={activeFindingsFiltersCount}
                />
                <ExportButton data={filteredFindings} config={findingsExportConfig} size="sm" />
              </div>

              {isMobile || isTablet ? (
                <div>
                  {filteredFindings.map((finding) => (
                    <FindingCard key={finding.id} finding={finding} onView={handleViewFinding} />
                  ))}
                </div>
              ) : (
                <FindingsTable
                  findings={filteredFindings}
                  selectedRowKeys={selectedFindingRowKeys}
                  onSelectionChange={setSelectedFindingRowKeys}
                  onViewFinding={handleViewFinding}
                />
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      <ScheduleInspectionModal
        open={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          setModalError(null)
          navigate({ search: (prev) => ({ ...prev, modal: undefined }) })
        }}
        onSubmit={handleScheduleInspection}
        formData={formData}
        setFormData={setFormData}
        facilities={allFacilities}
        loading={submitting}
        error={modalError}
      />

      <FindingsDrawer
        open={isFindingModalVisible}
        onClose={() => {
          setIsFindingModalVisible(false)
          setSelectedInspectionForDrawer(null)
        }}
        inspection={selectedInspectionForDrawer}
      />
    </div>
  )
}
