import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import type { ProfessionalLicenseRecord } from '@/types/license'
import StatusBadge from './StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { EntityLink } from '@/components/entities'

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
  const allSelected = selectionEnabled && licenses.length > 0 && licenses.every(l => selectedIds.has(l.licenseNumber))
  const someSelected = selectionEnabled && licenses.some(l => selectedIds.has(l.licenseNumber)) && !allSelected

  const handleSelectAll = () => {
    if (allSelected && onDeselectAll) {
      onDeselectAll()
    } else if (onSelectAll) {
      onSelectAll()
    }
  }

  const totalColumns = selectionEnabled ? 12 : 11

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
            <TableHead>Name</TableHead>
            <TableHead>Registration #</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>License Type</TableHead>
            <TableHead>Place of Practice</TableHead>
            <TableHead>Issuance Date</TableHead>
            <TableHead>Expiry Date</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
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
                {emptyState || 'No professional licenses found'}
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
                  <TableCell className="font-mono text-sm font-medium">
                    {license.licenseNumber}
                  </TableCell>
                  <TableCell>
                    <EntityLink type="professional" id={license.registrationNumber}>
                      {license.name || '—'}
                    </EntityLink>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{license.registrationNumber || '—'}</TableCell>
                  <TableCell>{license.category || '—'}</TableCell>
                  <TableCell>{license.licenseType || '—'}</TableCell>
                  <TableCell>{license.placeOfPractice || '—'}</TableCell>
                  <TableCell>{license.dateOfIssuance || '—'}</TableCell>
                  <TableCell>{license.dateOfExpiry || '—'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={license.paymentStatus === 'Paid' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {license.paymentStatus || '—'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={license.licenseStatus} />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground hover:text-foreground" onClick={() => onRowClick(license.licenseNumber)}>
                      <Eye className="h-4 w-4" />
                      View
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
