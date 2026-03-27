import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useRegistryStore } from "@/stores/registryStore"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import { MetricCard } from "@/components/dashboard"
import { UserRound, CheckCircle, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProfessionalsFilters from "./ProfessionalsFilters"
import ProfessionalsTable from "./ProfessionalsTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import type { ExportConfig } from "@/utils/exportUtils"
import type { ProfessionalRecord } from "@/api/registryApi"
import dayjs from "dayjs"

const professionalExportConfig: ExportConfig<ProfessionalRecord> = {
  filename: `health-professionals-${dayjs().format("YYYY-MM-DD")}`,
  title: "Health Professionals Report",
  columns: [
    { key: "full_name", label: "Full Name" },
    { key: "registration_number", label: "Registration #" },
    { key: "license_number", label: "License #" },
    { key: "category_of_practice", label: "Category of Practice" },
    { key: "place_of_practice", label: "Place of Practice" },
    { key: "county", label: "County" },
    { key: "nationality", label: "Nationality" },
  ],
}

export function ProfessionalsDashboardView() {
  const navigate = useNavigate()

  const {
    professionals,
    professionalsLoading,
    professionalsError,
    professionalsPagination,
    professionalsFilters,
    setProfessionalsFilters,
    setProfessionalPage,
  } = useRegistryStore()

  const { openDrawer } = useEntityDrawer()

  // Local state for filters
  const [searchText, setSearchText] = useState(professionalsFilters.search || "")
  const [selectedStatus, setSelectedStatus] = useState<"all" | "active" | "inactive">(
    professionalsFilters.active === "true"
      ? "active"
      : professionalsFilters.active === "false"
      ? "inactive"
      : "all"
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    professionalsFilters.sortOrder || "asc"
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfessionalsFilters({ ...professionalsFilters, search: searchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText])

  const handleStatusChange = (status: "all" | "active" | "inactive") => {
    setSelectedStatus(status)
    if (status === "all") {
      setProfessionalsFilters({ ...professionalsFilters, active: undefined })
    } else if (status === "active") {
      setProfessionalsFilters({ ...professionalsFilters, active: "true" })
    } else {
      setProfessionalsFilters({ ...professionalsFilters, active: "false" })
    }
  }

  const handleSortChange = (order: "asc" | "desc") => {
    setSortOrder(order)
    setProfessionalsFilters({
      ...professionalsFilters,
      sortBy: "full_name",
      sortOrder: order,
    })
  }

  const handleClearFilters = () => {
    setSearchText("")
    setSelectedStatus("all")
    setSortOrder("asc")
    setProfessionalsFilters({})
  }

  const handleRowClick = (registrationNumber: string) => {
    openDrawer("professional", registrationNumber)
  }

  const activeFiltersCount =
    (searchText ? 1 : 0) + (selectedStatus !== "all" ? 1 : 0) + (sortOrder !== "asc" ? 1 : 0)

  const totalProfessionals = professionalsPagination?.total_count || 0
  const activeProfessionals = professionals.filter((p) => p.active).length

  return (
    <div className="space-y-6 p-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate({ to: "/affiliations" })}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Button>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          title="Total Professionals"
          value={totalProfessionals}
          variant="neutral"
          icon={UserRound}
        />
        <MetricCard
          title="Active Professionals"
          value={activeProfessionals}
          variant="success"
          icon={CheckCircle}
        />
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1">
          <ProfessionalsFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        </div>
        <div className="flex gap-2">
          <ExportButton data={professionals} config={professionalExportConfig} size="default" />
        </div>
      </div>

      {/* Error State */}
      {professionalsError && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{professionalsError}</p>
        </div>
      )}

      {/* Table */}
      <ProfessionalsTable
        professionals={professionals}
        loading={professionalsLoading}
        onRowClick={handleRowClick}
        emptyState={
          activeFiltersCount > 0
            ? "No professionals match your current filters."
            : "No professionals found in the system."
        }
      />

      {/* Pagination */}
      {professionalsPagination && (
        <PaginationControls
          currentPage={professionalsPagination.page}
          totalPages={professionalsPagination.total_pages}
          onPageChange={setProfessionalPage}
          totalCount={professionalsPagination.total_count}
          pageSize={professionalsPagination.page_size}
        />
      )}
    </div>
  )
}
