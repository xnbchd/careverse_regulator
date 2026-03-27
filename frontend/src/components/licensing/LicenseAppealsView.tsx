import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, FileText } from "lucide-react"
import {
  fetchLicenseAppeals,
  type LicenseAppeal,
  type LicenseAppealsFilters,
} from "@/api/licenseAppealsApi"
import { format } from "date-fns"

export default function LicenseAppealsView() {
  const [appeals, setAppeals] = useState<LicenseAppeal[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<LicenseAppealsFilters>({})

  useEffect(() => {
    loadAppeals()
  }, [page, filters])

  const loadAppeals = async () => {
    try {
      setLoading(true)
      const response = await fetchLicenseAppeals(page, 20, filters)
      setAppeals(response.data)
      setTotalPages(response.pagination.total_pages)
    } catch (error) {
      console.error("Failed to load appeals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery })
    setPage(1)
  }

  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Rejected":
        return "destructive"
      case "Additional Information Requested":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>License Appeals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by license number, facility name, or appeal reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button onClick={handleSearch} variant="secondary">
                <Search className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appeals Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>License Number</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Appeal Reason</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && appeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : appeals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No license appeals found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Appeals submitted by facilities and professionals will appear here
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              appeals.map((appeal) => (
                <TableRow key={appeal.id}>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {appeal.appeal_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{appeal.license_number}</TableCell>
                  <TableCell>
                    <span
                      className="max-w-[200px] truncate inline-block"
                      title={appeal.facility_name || appeal.professional_name || "N/A"}
                    >
                      {appeal.facility_name || appeal.professional_name || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className="max-w-[300px] truncate inline-block"
                      title={appeal.appeal_reason || appeal.comments || "N/A"}
                    >
                      {appeal.appeal_reason || appeal.comments || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(appeal.status)}>
                      {appeal.status || "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {appeal.created_at ? format(new Date(appeal.created_at), "PP") : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <CardContent className="flex justify-center gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="flex items-center gap-2 px-4">
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
