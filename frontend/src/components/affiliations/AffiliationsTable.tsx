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
import type { Affiliation } from "@/types/affiliation"
import StatusBadge from "./StatusBadge"
import { cn } from "@/lib/utils"
import { EntityLink } from "@/components/entities"

interface AffiliationsTableProps {
  affiliations: Affiliation[]
  loading?: boolean
  onRowClick: (affiliationId: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (id: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
}

export default function AffiliationsTable({
  affiliations,
  loading,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: AffiliationsTableProps) {
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected =
    selectionEnabled &&
    affiliations.length > 0 &&
    affiliations.every((a) => selectedIds.has(a.affiliationId))
  const someSelected =
    selectionEnabled && affiliations.some((a) => selectedIds.has(a.affiliationId)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 8 : 7

  return (
    <Card>
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
            <TableHead>Professional</TableHead>
            <TableHead>Registration #</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Employment Type</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading && affiliations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-8 text-muted-foreground">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              </TableCell>
            </TableRow>
          ) : affiliations.length === 0 ? (
            <TableRow>
              <TableCell colSpan={totalColumns} className="text-center py-8 text-muted-foreground">
                No affiliations found
              </TableCell>
            </TableRow>
          ) : (
            affiliations.map((affiliation) => {
              const isSelected = selectionEnabled && selectedIds.has(affiliation.affiliationId)
              return (
                <TableRow
                  key={affiliation.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onRowClick(affiliation.id)}
                >
                  {selectionEnabled && (
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleSelection(affiliation.affiliationId)}
                      />
                    </TableCell>
                  )}
                  <TableCell className="font-medium">
                    <EntityLink
                      type="professional"
                      id={affiliation.healthProfessional.registrationNumber}
                    >
                      {affiliation.healthProfessional.fullName}
                    </EntityLink>
                    {affiliation.healthProfessional.professionalCadre && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {affiliation.healthProfessional.professionalCadre}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {affiliation.healthProfessional.registrationNumber}
                  </TableCell>
                  <TableCell>
                    <EntityLink type="facility" id={affiliation.healthFacility.registrationNumber}>
                      {affiliation.healthFacility.facilityName}
                    </EntityLink>
                    {affiliation.healthFacility.facilityCode && (
                      <div className="text-xs text-muted-foreground mt-0.5">
                        Code: {affiliation.healthFacility.facilityCode}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{affiliation.role}</TableCell>
                  <TableCell className="capitalize">{affiliation.employmentType}</TableCell>
                  <TableCell>{affiliation.startDate}</TableCell>
                  <TableCell>
                    <StatusBadge status={affiliation.affiliationStatus} />
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
