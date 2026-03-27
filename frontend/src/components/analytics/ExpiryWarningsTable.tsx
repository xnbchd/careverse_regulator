import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import type { ExpiryWarning } from "@/stores/analyticsStore"
import { cn } from "@/lib/utils"
import { useNavigate } from "@tanstack/react-router"

interface ExpiryWarningsTableProps {
  warnings: ExpiryWarning[]
}

export default function ExpiryWarningsTable({ warnings }: ExpiryWarningsTableProps) {
  const navigate = useNavigate()

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return "text-red-600"
    if (days <= 14) return "text-orange-600"
    return "text-amber-600"
  }

  const getUrgencyBadge = (days: number) => {
    if (days <= 7) return { variant: "destructive" as const, label: "Urgent" }
    if (days <= 14) return { variant: "default" as const, label: "High Priority" }
    return { variant: "secondary" as const, label: "Medium Priority" }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>License Number</TableHead>
          <TableHead>Facility Name</TableHead>
          <TableHead>Expiry Date</TableHead>
          <TableHead>Days Until Expiry</TableHead>
          <TableHead>Priority</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {warnings.map((warning) => {
          const badge = getUrgencyBadge(warning.daysUntilExpiry)
          return (
            <TableRow
              key={warning.licenseNumber}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => navigate({ to: `/license-management/${warning.licenseNumber}` })}
            >
              <TableCell className="font-mono font-medium">{warning.licenseNumber}</TableCell>
              <TableCell>{warning.facilityName}</TableCell>
              <TableCell>{warning.expiryDate}</TableCell>
              <TableCell>
                <span className={cn("font-semibold", getUrgencyColor(warning.daysUntilExpiry))}>
                  {warning.daysUntilExpiry} days
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
