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
import type { ProfessionalLicenseRecord } from "@/types/license"
import StatusBadge from "./StatusBadge"
import { Badge } from "@/components/ui/badge"
import { EntityLink } from "@/components/entities"

interface ProfessionalLicensesTableProps {
  licenses: ProfessionalLicenseRecord[]
  loading?: boolean
  onRowClick: (licenseNumber: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (licenseNumber: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  emptyState?: React.ReactNode
}

export default function ProfessionalLicensesTable({
  licenses,
  loading,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  emptyState,
}: ProfessionalLicensesTableProps) {
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected =
    selectionEnabled &&
    licenses.length > 0 &&
    licenses.every((l) => selectedIds.has(l.licenseNumber))
  const someSelected =
    selectionEnabled && licenses.some((l) => selectedIds.has(l.licenseNumber)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 11 : 10

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <Table className="table-fixed w-full">
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
              <TableHead className="w-[140px]">License #</TableHead>
              <TableHead className="w-[200px]">Name</TableHead>
              <TableHead className="w-[140px]">Registration #</TableHead>
              <TableHead className="w-[150px]">Category</TableHead>
              <TableHead className="w-[150px]">License Type</TableHead>
              <TableHead className="w-[200px]">Place of Practice</TableHead>
              <TableHead className="w-[120px]">Issuance Date</TableHead>
              <TableHead className="w-[120px]">Expiry Date</TableHead>
              <TableHead className="w-[100px]">Payment</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : licenses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyState || "No professional licenses found"}
                </TableCell>
              </TableRow>
            ) : (
              licenses.map((license) => {
                const isSelected = selectionEnabled && selectedIds.has(license.licenseNumber)
                return (
                  <TableRow
                    key={license.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(license.licenseNumber)}
                  >
                    {selectionEnabled && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(license.licenseNumber)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="font-mono text-sm font-medium w-[140px]">
                      <div className="truncate text-left">{license.licenseNumber}</div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <EntityLink
                        type="professional"
                        id={license.registrationNumber}
                        className="w-full"
                      >
                        <div className="truncate text-left">{license.name || "—"}</div>
                      </EntityLink>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-[140px]">
                      <div className="truncate text-left">{license.registrationNumber || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="truncate text-left">{license.category || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="truncate text-left">{license.licenseType || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="truncate text-left">{license.placeOfPractice || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="truncate text-left">{license.dateOfIssuance || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="truncate text-left">{license.dateOfExpiry || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <Badge
                        variant={license.paymentStatus === "Paid" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {license.paymentStatus || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <StatusBadge status={license.licenseStatus} />
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
