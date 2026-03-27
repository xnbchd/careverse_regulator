import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useRegistryStore } from "@/stores/registryStore"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import FacilitiesFilters from "./FacilitiesFilters"
import FacilitiesTable from "./FacilitiesTable"
import PaginationControls from "./PaginationControls"
import ExportButton from "@/components/shared/ExportButton"
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
  const navigate = useNavigate()

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

  // Local state for filters
  const [searchText, setSearchText] = useState(facilitiesFilters.search || "")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "recent">(
    facilitiesFilters.sortOrder === "asc"
      ? "asc"
      : facilitiesFilters.sortOrder === "desc"
      ? "desc"
      : "recent"
  )

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFacilitiesFilters({ ...facilitiesFilters, search: searchText || undefined })
    }, 300)
    return () => clearTimeout(timer)
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
    <div className="space-y-6 p-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/affiliations" })}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Facilities</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Browse all registered health facilities
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="flex justify-between items-start gap-4 flex-wrap">
        <div className="flex-1">
          <FacilitiesFilters
            searchText={searchText}
            onSearchChange={setSearchText}
            sortOrder={sortOrder}
            onSortChange={handleSortChange}
            activeFiltersCount={activeFiltersCount}
            onClearFilters={handleClearFilters}
          />
        </div>
        <div className="flex gap-2">
          <ExportButton data={facilities} config={facilityExportConfig} size="default" />
        </div>
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
