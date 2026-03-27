import { Card, CardContent } from "@/components/ui/card"
import type { Affiliation } from "@/types/affiliation"
import StatusBadge from "./StatusBadge"
import { Building2, Briefcase, Calendar, IdCard } from "lucide-react"

interface AffiliationCardProps {
  affiliation: Affiliation
  onClick: () => void
}

export default function AffiliationCard({ affiliation, onClick }: AffiliationCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">
              {affiliation.healthProfessional.fullName}
            </h3>
            {affiliation.healthProfessional.professionalCadre && (
              <p className="text-sm text-muted-foreground">
                {affiliation.healthProfessional.professionalCadre}
              </p>
            )}
          </div>
          <StatusBadge status={affiliation.affiliationStatus} />
        </div>

        <div className="space-y-2.5 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <IdCard className="w-4 h-4 shrink-0" />
            <span className="font-mono">{affiliation.healthProfessional.registrationNumber}</span>
          </div>

          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <div className="font-medium">{affiliation.healthFacility.facilityName}</div>
              {affiliation.healthFacility.facilityCode && (
                <div className="text-xs text-muted-foreground">
                  Code: {affiliation.healthFacility.facilityCode}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4 shrink-0" />
            <span>{affiliation.role}</span>
            <span className="text-xs">•</span>
            <span className="capitalize text-xs">{affiliation.employmentType}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Started: {affiliation.startDate}</span>
            {affiliation.endDate && (
              <>
                <span className="text-xs">•</span>
                <span>Ended: {affiliation.endDate}</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
