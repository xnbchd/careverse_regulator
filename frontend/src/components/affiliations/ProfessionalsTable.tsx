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
import type { ProfessionalRecord } from "@/api/registryApi"
import { EntityLink } from "@/components/entities"

interface ProfessionalsTableProps {
  professionals: ProfessionalRecord[]
  loading?: boolean
  onRowClick: (registrationNumber: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (registrationNumber: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
  emptyState?: React.ReactNode
}

export default function ProfessionalsTable({
  professionals,
  loading,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
  emptyState,
}: ProfessionalsTableProps) {
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected =
    selectionEnabled &&
    professionals.length > 0 &&
    professionals.every((p) => p.registration_number && selectedIds.has(p.registration_number))
  const someSelected =
    selectionEnabled &&
    professionals.some((p) => p.registration_number && selectedIds.has(p.registration_number)) &&
    !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 8 : 7

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
              <TableHead className="w-[200px]">Full Name</TableHead>
              <TableHead className="w-[140px]">Registration #</TableHead>
              <TableHead className="w-[140px]">License #</TableHead>
              <TableHead className="w-[150px]">Category of Practice</TableHead>
              <TableHead className="w-[200px]">Place of Practice</TableHead>
              <TableHead className="w-[100px]">Affiliations</TableHead>
              <TableHead className="w-[120px]">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && professionals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={totalColumns} className="text-center py-8">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : professionals.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalColumns}
                  className="text-center py-8 text-muted-foreground"
                >
                  {emptyState || "No professionals found"}
                </TableCell>
              </TableRow>
            ) : (
              professionals.map((professional) => {
                const regNum = professional.registration_number || ""
                const isSelected = selectionEnabled && selectedIds.has(regNum)
                return (
                  <TableRow
                    key={regNum || professional.full_name}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => regNum && onRowClick(regNum)}
                  >
                    {selectionEnabled && (
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => regNum && onToggleSelection(regNum)}
                        />
                      </TableCell>
                    )}
                    <TableCell className="w-[200px]" onClick={(e) => e.stopPropagation()}>
                      <EntityLink type="professional" id={regNum} className="w-full">
                        <div className="truncate text-left">{professional.full_name || "—"}</div>
                      </EntityLink>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-[140px]">
                      <div className="truncate text-left">{regNum || "—"}</div>
                    </TableCell>
                    <TableCell className="font-mono text-sm w-[140px]">
                      <div className="truncate text-left">{professional.license_number || "—"}</div>
                    </TableCell>
                    <TableCell className="w-[150px]">
                      <div className="truncate text-left">
                        {professional.category_of_practice || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[200px]">
                      <div className="truncate text-left">
                        {professional.place_of_practice || "—"}
                      </div>
                    </TableCell>
                    <TableCell className="w-[100px]">
                      <div className="truncate text-left">
                        {professional.affiliations?.length || 0}
                      </div>
                    </TableCell>
                    <TableCell className="w-[120px]">
                      <Badge
                        variant={professional.active ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {professional.active ? "Active" : "Inactive"}
                      </Badge>
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
