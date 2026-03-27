import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LicenseApplication } from "@/types/license"
import StatusBadge from "./StatusBadge"
import { Building2, Calendar, DollarSign, FileText } from "lucide-react"

interface ApplicationCardProps {
  application: LicenseApplication
  onClick: () => void
}

export default function ApplicationCard({ application, onClick }: ApplicationCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{application.facilityName}</h3>
            <p className="text-sm text-muted-foreground font-mono">
              {application.licenseApplicationId}
            </p>
          </div>
          <StatusBadge status={application.applicationStatus} />
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {application.applicationType}
            </Badge>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <FileText className="w-4 h-4 shrink-0" />
            <span>{application.licenseTypeName}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Applied: {application.applicationDate}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="w-4 h-4 shrink-0" />
            <span>KES {application.licenseFee.toLocaleString()}</span>
          </div>

          {application.facilityCode && (
            <div className="text-xs text-muted-foreground">
              Facility Code: {application.facilityCode}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
