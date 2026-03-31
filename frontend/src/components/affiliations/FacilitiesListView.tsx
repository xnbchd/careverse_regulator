import { useEffect, useState } from "react"
import { useRegistryStore } from "@/stores/registryStore"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import FacilitiesFilters from "./FacilitiesFilters"
import FacilitiesTable from "./FacilitiesTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
import { PageHeader } from "@/components/shared/PageHeader"
import type { ExportConfig } from "@/utils/exportUtils"
import type { FacilityRecord } from "@/api/registryApi"
import dayjs from "dayjs"

const facilityExportConfig: ExportConfig<FacilityRecord> = {
  filename: `health-facilities-${dayjs().format("YYYY-MM-DD")}`,
  title: "Health Facilities Report",
  columns: [
    { key: "facility_name", label: "Facility Name" },
    { key: "facility_code", label: "Code" },
    { key: "registration_number", label: "Registration #" },
    { key: "facility_category", label: "Category" },
    { key: "facility_type", label: "Type" },
    { key: "keph_level", label: "KEPH Level" },
    { key: "county", label: "County" },
    { key: "owner", label: "Owner" },
  ],
}

export function FacilitiesListView() {
  const {
    facilities,
    facilitiesLoading,
    facilitiesError,
    facilitiesPagination,
    facilitiesFilters,
    setFacilitiesFilters,
    setFacilitiesPage,
  } = useRegistryStore()

  const { openDrawer } = useEntityDrawer()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Local state for filters
  const [searchText, setSearchText] = useState(facilitiesFilters.search || "")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "recent">(
    facilitiesFilters.sortOrder === "asc"
      ? "asc"
      : facilitiesFilters.sortOrder === "desc"
        ? "desc"
        : "recent"
  )

  // Debounce search — intentionally omits facilitiesFilters/setFacilitiesFilters from deps
  // to avoid re-triggering on every filter object reference change (infinite loop risk)
  useEffect(() => {
    const timer = setTimeout(() => {
      setFacilitiesFilters({ ...facilitiesFilters, search: searchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText])

  const handleSortChange = (order: "asc" | "desc" | "recent") => {
    setSortOrder(order)
    if (order === "asc") {
      setFacilitiesFilters({
        ...facilitiesFilters,
        sortBy: "facility_name",
        sortOrder: "asc",
      })
    } else if (order === "desc") {
      setFacilitiesFilters({
        ...facilitiesFilters,
        sortBy: "facility_name",
        sortOrder: "desc",
      })
    } else {
      setFacilitiesFilters({
        ...facilitiesFilters,
        sortBy: undefined,
        sortOrder: undefined,
      })
    }
  }

  const handleClearFilters = () => {
    setSearchText("")
    setSortOrder("recent")
    setFacilitiesFilters({})
  }

  const handleRowClick = (registrationNumber: string) => {
    openDrawer("facility", registrationNumber)
  }

  const activeFiltersCount = (searchText ? 1 : 0) + (sortOrder !== "recent" ? 1 : 0)

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Affiliations", href: "/affiliations" }, { label: "Facilities" }]}
        title="Facilities"
        subtitle="Browse all registered health facilities"
      />

      {/* Filters and Actions */}
      <div className="flex items-start gap-3 flex-wrap justify-between">
        <FacilitiesFilters
          searchText={searchText}
          onSearchChange={setSearchText}
          sortOrder={sortOrder}
          onSortChange={handleSortChange}
          activeFiltersCount={activeFiltersCount}
          onClearFilters={handleClearFilters}
        />
        <ExportButton data={facilities} config={facilityExportConfig} size="sm" />
      </div>

      {/* Error State */}
      {facilitiesError && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{facilitiesError}</p>
        </div>
      )}

      {/* Table */}
      <FacilitiesTable
        facilities={facilities}
        loading={facilitiesLoading}
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
        onSelectAll={() => setSelectedIds(new Set(facilities.map((f) => f.registration_number)))}
        onDeselectAll={() => setSelectedIds(new Set())}
        emptyState={
          activeFiltersCount > 0
            ? "No facilities match your current filters."
            : "No facilities found in the system."
        }
      />

      {/* Pagination */}
      {facilitiesPagination && (
        <PaginationControls
          currentPage={facilitiesPagination.page}
          totalPages={facilitiesPagination.total_pages}
          onPageChange={setFacilitiesPage}
          totalCount={facilitiesPagination.total_count}
          pageSize={facilitiesPagination.page_size}
        />
      )}
    </div>
  )
}
