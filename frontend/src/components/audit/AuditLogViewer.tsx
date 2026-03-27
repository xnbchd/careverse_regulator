import { useState } from "react"
import { useAuditStore } from "@/stores/auditStore"
import { format } from "date-fns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Download,
  Filter,
  X,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react"
import {
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditExportFormat,
  getActionLabel,
  getEntityLabel,
  getSeverityColor,
  getSeverityLabel,
} from "@/types/audit"
import { cn } from "@/lib/utils"

export function AuditLogViewer() {
  const {
    logs,
    page,
    pageSize,
    total,
    totalPages,
    filters,
    isLoading,
    isExporting,
    setFilters,
    clearFilters,
    setPage,
    setPageSize,
    selectLog,
    exportLogs,
  } = useAuditStore()

  const [searchQuery, setSearchQuery] = useState(filters.query || "")
  const [showFilters, setShowFilters] = useState(false)

  // Handle search
  const handleSearch = () => {
    setFilters({ query: searchQuery })
  }

  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    setFilters({ [key]: value || undefined })
  }

  // Handle export
  const handleExport = async (format: AuditExportFormat) => {
    try {
      await exportLogs(format)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export audit logs. Please try again.")
    }
  }

  // Calculate pagination range
  const startIndex = (page - 1) * pageSize + 1
  const endIndex = Math.min(page * pageSize, total)

  // Check if filters are active
  const hasActiveFilters =
    filters.query ||
    filters.action ||
    filters.entity ||
    filters.severity ||
    filters.userId ||
    filters.success !== undefined ||
    filters.startDate ||
    filters.endDate

  return (
    <div className="space-y-4">
      {/* Header with Search and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Audit Logs</CardTitle>
              <CardDescription>
                View and search system audit trail
                {total > 0 && ` (${total.toLocaleString()} total entries)`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Hide" : "Show"} Filters
              </Button>
              <Select
                value=""
                onValueChange={(value) => handleExport(value as AuditExportFormat)}
                disabled={isExporting || logs.length === 0}
              >
                <SelectTrigger className="w-[140px]">
                  <Download className="w-4 h-4 mr-2" />
                  <span>{isExporting ? "Exporting..." : "Export"}</span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AuditExportFormat.CSV}>CSV</SelectItem>
                  <SelectItem value={AuditExportFormat.JSON}>JSON</SelectItem>
                  <SelectItem value={AuditExportFormat.PDF}>PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search Bar */}
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by description, user, or entity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  clearFilters()
                }}
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4 p-4 border rounded-lg bg-muted/30">
              <div>
                <label className="text-xs font-medium mb-1 block">Action</label>
                <Select
                  value={filters.action || ""}
                  onValueChange={(value) => handleFilterChange("action", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All actions</SelectItem>
                    {Object.values(AuditAction).map((action) => (
                      <SelectItem key={action} value={action}>
                        {getActionLabel(action)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Entity</label>
                <Select
                  value={filters.entity || ""}
                  onValueChange={(value) => handleFilterChange("entity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All entities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All entities</SelectItem>
                    {Object.values(AuditEntity).map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {getEntityLabel(entity)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Severity</label>
                <Select
                  value={filters.severity || ""}
                  onValueChange={(value) => handleFilterChange("severity", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All severities</SelectItem>
                    {Object.values(AuditSeverity).map((severity) => (
                      <SelectItem key={severity} value={severity}>
                        {getSeverityLabel(severity)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Status</label>
                <Select
                  value={filters.success === undefined ? "" : filters.success ? "true" : "false"}
                  onValueChange={(value) =>
                    handleFilterChange("success", value === "" ? undefined : value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="true">Success</SelectItem>
                    <SelectItem value="false">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">User ID</label>
                <Input
                  placeholder="Filter by user"
                  value={filters.userId || ""}
                  onChange={(e) => handleFilterChange("userId", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.query && (
                <Badge variant="secondary">
                  Search: {filters.query}
                  <button
                    onClick={() => {
                      setSearchQuery("")
                      handleFilterChange("query", "")
                    }}
                    className="ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.action && (
                <Badge variant="secondary">
                  Action: {getActionLabel(filters.action)}
                  <button onClick={() => handleFilterChange("action", "")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.entity && (
                <Badge variant="secondary">
                  Entity: {getEntityLabel(filters.entity)}
                  <button onClick={() => handleFilterChange("entity", "")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.severity && (
                <Badge variant="secondary">
                  Severity: {getSeverityLabel(filters.severity)}
                  <button onClick={() => handleFilterChange("severity", "")} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filters.success !== undefined && (
                <Badge variant="secondary">
                  Status: {filters.success ? "Success" : "Failed"}
                  <button onClick={() => handleFilterChange("success", undefined)} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}

          {/* Loading State */}
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No audit logs found</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={() => clearFilters()} className="mt-2">
                  Clear filters to see all logs
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Audit Logs Table */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[180px]">Timestamp</TableHead>
                      <TableHead className="w-[120px]">Action</TableHead>
                      <TableHead className="w-[100px]">Entity</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[150px]">User</TableHead>
                      <TableHead className="w-[100px]">Severity</TableHead>
                      <TableHead className="w-[80px]">Status</TableHead>
                      <TableHead className="w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-mono text-xs">
                          {format(new Date(log.timestamp), "MMM dd, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{getActionLabel(log.action)}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{getEntityLabel(log.entity)}</span>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-md">
                            <p className="text-sm truncate">{log.description}</p>
                            {log.entityName && (
                              <p className="text-xs text-muted-foreground truncate">
                                {log.entityName}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            <p className="font-medium truncate">{log.userName}</p>
                            <p className="text-muted-foreground truncate">{log.userRole}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getSeverityColor(log.severity))}
                          >
                            {getSeverityLabel(log.severity)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => selectLog(log)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex} to {endIndex} of {total.toLocaleString()} entries
                </p>
                <div className="flex items-center gap-2">
                  <Select
                    value={String(pageSize)}
                    onValueChange={(val) => setPageSize(Number(val))}
                  >
                    <SelectTrigger className="h-9 w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50, 100].map((size) => (
                        <SelectItem key={size} value={String(size)}>
                          {size} rows
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    Page {page} of {totalPages}
                  </span>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => setPage(1)}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => setPage(page + 1)}
                      disabled={page === totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 w-9 p-0"
                      onClick={() => setPage(totalPages)}
                      disabled={page === totalPages || isLoading}
                    >
                      <ChevronsRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
