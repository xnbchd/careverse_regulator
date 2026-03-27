import { useEffect, useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { useResponsive } from "@/hooks/useResponsive"
import AffiliationsTable from "./AffiliationsTable"
import AffiliationCard from "./AffiliationCard"
import AffiliationsFilters from "./AffiliationsFilters"
import PaginationControls from "./PaginationControls"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, ArrowLeft } from "lucide-react"

interface AffiliationsViewProps {
  company?: string | null
}

export default function AffiliationsView({}: AffiliationsViewProps) {
  const navigate = useNavigate()
  const {
    affiliations,
    loading,
    error,
    pagination,
    filters,
    setFilters,
    setPage,
    selectedIds,
    toggleSelection,
    selectAll,
    deselectAll,
  } = useAffiliationStore()
  const { isMobile, isTablet } = useResponsive()

  // Local state for filters
  const [searchText, setSearchText] = useState(filters.search || "")
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(
    filters.status ? filters.status.split(",") : ["all"]
  )
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "recent">(
    filters.sortOrder === "desc" ? "desc" : filters.sortOrder === "asc" ? "asc" : "recent"
  )

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters({ ...filters, search: searchText || undefined })
    }, 300)

    return () => clearTimeout(timer)
  }, [searchText])

  // Handle status filter change
  const handleStatusChange = (statuses: string[]) => {
    setSelectedStatuses(statuses)
    const statusFilter = statuses.includes("all") ? undefined : statuses.join(",")
    setFilters({ ...filters, status: statusFilter })
  }

  // Handle sort order change
  const handleSortChange = (order: "asc" | "desc" | "recent") => {
    setSortOrder(order)
    if (order === "asc") {
      setFilters({ ...filters, sortBy: "professional_name", sortOrder: "asc" })
    } else if (order === "desc") {
      setFilters({ ...filters, sortBy: "professional_name", sortOrder: "desc" })
    } else {
      setFilters({ ...filters, sortBy: "start_date", sortOrder: "desc" })
    }
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setSearchText("")
    setSelectedStatuses(["all"])
    setSortOrder("recent")
    setFilters({})
  }

  // Handle row click - navigate to detail page
  const handleRowClick = (affiliationId: string) => {
    navigate({ to: `/affiliations/${affiliationId}` })
  }

  // Handle pagination
  const handlePageChange = (page: number) => {
    setPage(page)
  }

  // Calculate active filters count
  const activeFiltersCount =
    (searchText ? 1 : 0) +
    (!selectedStatuses.includes("all") ? 1 : 0) +
    (sortOrder !== "recent" ? 1 : 0)

  // Render empty state
  if (!loading && affiliations.length === 0 && activeFiltersCount === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Users className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No Affiliations Found</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            There are currently no professional affiliations in the system.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back to Dashboard */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: "/affiliations" })}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Button>

      {/* Filters */}
      <AffiliationsFilters
        searchText={searchText}
        onSearchChange={setSearchText}
        selectedStatuses={selectedStatuses}
        onStatusChange={handleStatusChange}
        sortOrder={sortOrder}
        onSortChange={handleSortChange}
        activeFiltersCount={activeFiltersCount}
        onClearFilters={handleClearFilters}
      />

      {/* Error State */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="py-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Table or Cards based on screen size */}
      {isMobile || isTablet ? (
        <div className="space-y-4">
          {affiliations.map((affiliation) => (
            <AffiliationCard
              key={affiliation.id}
              affiliation={affiliation}
              onClick={() => handleRowClick(affiliation.id)}
            />
          ))}
        </div>
      ) : (
        <AffiliationsTable
          affiliations={affiliations}
          loading={loading}
          onRowClick={handleRowClick}
          selectedIds={selectedIds}
          onToggleSelection={toggleSelection}
          onSelectAll={selectAll}
          onDeselectAll={deselectAll}
        />
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <PaginationControls
          currentPage={pagination.page}
          totalPages={pagination.total_pages}
          onPageChange={handlePageChange}
          totalCount={pagination.total_count}
          pageSize={pagination.page_size}
        />
      )}

      {/* Loading State */}
      {loading && affiliations.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State after filtering */}
      {!loading && affiliations.length === 0 && activeFiltersCount > 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="rounded-full bg-muted p-6 mb-4">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-4">
              No affiliations match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline" onClick={handleClearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
