import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { License } from '@/types/license'
import StatusBadge from './StatusBadge'
import { Badge } from '@/components/ui/badge'
import { EntityLink } from '@/components/entities'

interface LicensesTableProps {
  licenses: License[]
  loading?: boolean
  onRowClick: (licenseNumber: string) => void
  selectedIds?: Set<string>
  onToggleSelection?: (licenseNumber: string) => void
  onSelectAll?: () => void
  onDeselectAll?: () => void
}

export default function LicensesTable({
  licenses,
  loading,
  onRowClick,
  selectedIds,
  onToggleSelection,
  onSelectAll,
  onDeselectAll,
}: LicensesTableProps) {
  const selectionEnabled = selectedIds !== undefined && onToggleSelection !== undefined
  const allSelected = selectionEnabled && licenses.length > 0 && licenses.every(l => selectedIds.has(l.licenseNumber))
  const someSelected = selectionEnabled && licenses.some(l => selectedIds.has(l.licenseNumber)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 9 : 8

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            {selectionEnabled && (
              <TableHead className="w-12">
                <Checkbox
                  checked={allSelected || (someSelected ? 'indeterminate' : false)}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
            )}
            <TableHead>License #</TableHead>
            <TableHead>Registration #</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Facility/Professional</TableHead>
            <TableHead>Issuance Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
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
              <TableCell colSpan={totalColumns} className="text-center py-8 text-muted-foreground">
                No licenses found
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
                  <TableCell
                    className="font-mono text-sm font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EntityLink type="license" id={license.licenseNumber}>
                      {license.licenseNumber}
                    </EntityLink>
                  </TableCell>
                <TableCell className="font-mono text-sm">
                  <span onClick={(e) => e.stopPropagation()}>
                    {license.registrationNumber}
                  </span>
                </TableCell>
                <TableCell>{license.facilityType || license.licenseType}</TableCell>
                <TableCell>
                  <EntityLink type="facility" id={license.registrationNumber}>
                    <span className="max-w-[200px] truncate inline-block" title={license.facilityName || license.owner || 'N/A'}>
                      {license.facilityName || license.owner || 'N/A'}
                    </span>
                  </EntityLink>
                </TableCell>
                <TableCell>{license.dateOfIssuance}</TableCell>
                <TableCell>{license.dateOfExpiry}</TableCell>
                <TableCell>
                  <Badge
                    variant={license.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                    className="capitalize"
                  >
                    {license.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={license.status} />
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
