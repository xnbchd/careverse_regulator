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
import type { FacilityRecord } from "@/api/registryApi"
import { EntityLink } from "@/components/entities"

interface FacilitiesTableProps {
  facilities: FacilityRecord[]
  loading?: boolean
  onRowClick: (registrationNumber: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (registrationNumber: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  emptyState?: React.ReactNode
}

export default function FacilitiesTable({
  facilities,
  loading,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  emptyState,
}: FacilitiesTableProps) {
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected =
    selectionEnabled &&
    facilities.length > 0 &&
    facilities.every((f) => selectedIds.has(f.registration_number))
  const someSelected =
    selectionEnabled &&
    facilities.some((f) => selectedIds.has(f.registration_number)) &&
    !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 9 : 8

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
              <TableHead className="w-[250px]">Facility Name</TableHead>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead className="w-[140px]">Registration #</TableHead>
              <TableHead className="w-[140px]">Category</TableHead>
              <TableHead className="w-[120px]">Type</TableHead>
              <TableHead className="w-[100px]">KEPH Level</TableHead>
              <TableHead className="w-[120px]">County</TableHead>
              <TableHead className="w-[80px]">24hr</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && facilities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : facilities.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyState || "No facilities found"}
                </TableCell>
              </TableRow>
            ) : (
              facilities.map((facility) => {
                const isSelected = selectionEnabled && selectedIds.has(facility.registration_number)
                return (
                  <TableRow
                    key={facility.registration_number}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onRowClick(facility.registration_number)}
                  >
                    {selectionEnabled && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleSelection(facility.registration_number)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="w-[250px]" onClick={(e) => e.stopPropagation()}>
                      <EntityLink
                        type="facility"
                        id={facility.registration_number}
                        className="w-full"
                      >
                        <div className="truncate text-left">{facility.facility_name}</div>
                      </EntityLink>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-[100px]">
                      <div className="truncate text-left">{facility.facility_code || "—"}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-[140px]">
                      <div className="truncate text-left">{facility.registration_number}</div>
                    </TableCell>
                    <TableCell className="w-[140px]">
                      <div className="truncate text-left">{facility.facility_category || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="truncate text-left">{facility.facility_type || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      {facility.keph_level ? (
                        <Badge variant="outline">{facility.keph_level}</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <div className="truncate text-left">{facility.county || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[80px]">
                      {facility.open_whole_day ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400"
                        >
                          Yes
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No</span>
                      )}
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
