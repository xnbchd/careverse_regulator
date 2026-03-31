import { useEffect, useState } from "react"
import { useRegistryStore } from "@/stores/registryStore"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import ProfessionalsFilters from "./ProfessionalsFilters"
import ProfessionalsTable from "./ProfessionalsTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import { PageHeader } from "@/components/shared/PageHeader"
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

export function ProfessionalsListView() {
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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

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

  // Debounce search — intentionally omits professionalsFilters/setProfessionalsFilters from deps
  // to avoid re-triggering on every filter object reference change (infinite loop risk)
  useEffect(() => {
    const timer = setTimeout(() => {
      setProfessionalsFilters({ ...professionalsFilters, search: searchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Affiliations", href: "/affiliations" }, { label: "Professionals" }]}
        title="Professionals"
        subtitle="Browse all registered health professionals"
      />

      {/* Filters and Actions */}
      <div className="flex items-start gap-3 flex-wrap justify-between">
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
        <ExportButton data={professionals} config={professionalExportConfig} size="sm" />
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
        selectedIds={selectedIds}
        onToggleSelection={(id) =>
          setSelectedIds((prev) => {
            const next = new Set(prev)
            if (next.has(id)) {
              next.delete(id)
            } else {
              next.add(id)
            }
            return next
          })
        }
        onSelectAll={() => setSelectedIds(new Set(professionals.map((p) => p.registration_number)))}
        onDeselectAll={() => setSelectedIds(new Set())}
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
