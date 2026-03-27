import { useNavigate } from "@tanstack/react-router"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import type { ProfessionalLicenseApplication } from "@/types/license"
import StatusBadge from "./StatusBadge"
import { Button } from "@/components/ui/button"
import { Pencil } from "lucide-react"
import { EntityLink } from "@/components/entities"

interface ProfessionalApplicationsTableProps {
  applications: ProfessionalLicenseApplication[]
  loading?: boolean
  onRowClick: (applicationId: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (applicationId: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  emptyState?: React.ReactNode
}

export default function ProfessionalApplicationsTable({
  applications,
  loading,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  emptyState,
}: ProfessionalApplicationsTableProps) {
  const navigate = useNavigate()
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected =
    selectionEnabled &&
    applications.length > 0 &&
    applications.every((a) => selectedIds.has(a.licenseApplicationId))
  const someSelected =
    selectionEnabled &&
    applications.some((a) => selectedIds.has(a.licenseApplicationId)) &&
    !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 11 : 10
  const stickyOffset = selectionEnabled ? 1 : 0
  const stickyClass = (idx: number) => {
    const col = idx - stickyOffset
    if (col === 0) return "sticky left-0 z-10 bg-card border-r border-border/70"
    return undefined
  }

  return (
    <Card className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {selectionEnabled && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected || (someSelected ? "indeterminate" : false)}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead className={stickyClass(stickyOffset)}>Application ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Registration #</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>License Type</TableHead>
            <TableHead>Application Date</TableHead>
            <TableHead>Fee</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : applications.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-8 text-muted-foreground">
                {emptyState || "No professional license applications found"}
              </TableCell>
            </TableRow>
          ) : (
            applications.map((app) => {
              const isSelected = selectionEnabled && selectedIds.has(app.licenseApplicationId)
              return (
                <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                  {selectionEnabled && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(app.licenseApplicationId)}
                      />
                    </TableCell>
                  )}
                  <TableCell
                    className={`font-mono text-sm font-medium ${stickyClass(stickyOffset) || ""}`}
                  >
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate({
                          to: "/license-management/professional-application/$applicationId",
                          params: { applicationId: app.licenseApplicationId },
                        })
                      }}
                    >
                      {app.licenseApplicationId}
                    </button>
                  </TableCell>
                  <TableCell>
                    <EntityLink type="professional" id={app.registrationNumber}>
                      {app.fullName || "—"}
                    </EntityLink>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {app.registrationNumber || "—"}
                  </TableCell>
                  <TableCell>{app.categoryOfPractice || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {app.applicationType}
                    </Badge>
                  </TableCell>
                  <TableCell>{app.licenseTypeName || "—"}</TableCell>
                  <TableCell>{app.applicationDate || "—"}</TableCell>
                  <TableCell>
                    {app.licenseFee ? `KES ${app.licenseFee.toLocaleString()}` : "—"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={app.applicationStatus} />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation()
                        navigate({
                          to: "/license-management/professional-application/$applicationId",
                          params: { applicationId: app.licenseApplicationId },
                        })
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </Card>
  )
}
