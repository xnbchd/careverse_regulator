import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { License } from "@/types/license"
import StatusBadge from "./StatusBadge"
import { EntityLink } from "@/components/entities"
import { Building2, Calendar, CreditCard, FileText, User } from "lucide-react"

interface LicenseCardProps {
  license: License
  onClick: () => void
}

export default function LicenseCard({ license, onClick }: LicenseCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div onClick={(e) => e.stopPropagation()}>
              <EntityLink type="license" id={license.licenseNumber}>
                <h3 className="font-semibold text-lg mb-1 font-mono">{license.licenseNumber}</h3>
              </EntityLink>
            </div>
            <p className="text-sm text-muted-foreground">{license.facilityType}</p>
          </div>
          <StatusBadge status={license.status} />
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4 shrink-0" />
            <span className="font-mono">{license.registrationNumber}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="w-4 h-4 shrink-0" />
            <span>{license.owner}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <div className="flex-1">
              <div className="text-xs">Issued: {license.dateOfIssuance}</div>
              <div className="text-xs">Expires: {license.dateOfExpiry}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 shrink-0 text-muted-foreground" />
            <Badge
              variant={license.paymentStatus === "Paid" ? "default" : "secondary"}
              className="capitalize text-xs"
            >
              {license.paymentStatus}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
