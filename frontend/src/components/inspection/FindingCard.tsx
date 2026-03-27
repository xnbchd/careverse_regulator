import { Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Finding } from "@/types/inspection"
import FindingsBadge from "./FindingsBadge"
import { EntityLink } from "@/components/entities/EntityLink"

interface FindingCardProps {
  finding: Finding
  onView: (finding: Finding) => void
}

export default function FindingCard({ finding, onView }: FindingCardProps) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-1 truncate">{finding.findingId}</div>
              <div className="text-base font-semibold mb-2 truncate">
                {finding.facilityId ? (
                  <EntityLink
                    type="facility"
                    id={finding.facilityId}
                    className="underline hover:no-underline"
                  >
                    {finding.facilityName}
                  </EntityLink>
                ) : (
                  finding.facilityName
                )}
              </div>
              <div className="flex gap-2 flex-wrap mb-2">
                <FindingsBadge severity={finding.severity} />
                <FindingsBadge status={finding.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400 truncate"
            >
              {finding.category}
            </Badge>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1 leading-5 break-words">{finding.description}</span>
          </div>
          <div className="text-xs text-muted-foreground break-words">
            {finding.inspectionDate && `Inspection: ${finding.inspectionDate}`}
            {finding.dueDate && ` | Due: ${finding.dueDate}`}
            {finding.resolvedDate && ` | Resolved: ${finding.resolvedDate}`}
          </div>
        </div>

        <Button className="w-full mt-4" onClick={() => onView(finding)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
