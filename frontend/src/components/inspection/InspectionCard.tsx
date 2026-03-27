import { Calendar, User, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Inspection } from "@/types/inspection"
import StatusBadge from "./StatusBadge"
import { EntityLink } from "@/components/entities/EntityLink"
import dayjs from "dayjs"

interface InspectionCardProps {
  inspection: Inspection
  onView: (inspection: Inspection) => void
}

function isInspectionOverdue(inspection: Inspection): boolean {
  if (inspection.status !== "Pending") return false
  const today = dayjs().startOf("day")
  const inspectionDate = dayjs(inspection.date, "DD/MM/YYYY")
  return inspectionDate.isBefore(today)
}

export default function InspectionCard({ inspection, onView }: InspectionCardProps) {
  const isOverdue = isInspectionOverdue(inspection)

  return (
    <Card className={cn("mb-3", isOverdue && "border-2 border-red-500")}>
      <CardContent className="p-4">
        <div className="mb-3">
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-muted-foreground mb-1 truncate">
                  {inspection.inspectionId}
                </div>
                <div className="text-base font-semibold truncate">
                  {inspection.facilityId ? (
                    <EntityLink
                      type="facility"
                      id={inspection.facilityId}
                      className="underline hover:no-underline"
                    >
                      {inspection.facilityName}
                    </EntityLink>
                  ) : (
                    inspection.facilityName
                  )}
                </div>
              </div>
              {isOverdue && (
                <Badge variant="destructive" className="shrink-0">
                  Overdue
                </Badge>
              )}
            </div>
            <StatusBadge status={inspection.status} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 shrink-0" />
            <span className="truncate">{inspection.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="w-4 h-4 shrink-0" />
            <span className="truncate">
              {inspection.professionalId ? (
                <EntityLink
                  type="professional"
                  id={inspection.professionalId}
                  className="underline hover:no-underline"
                >
                  {inspection.inspector}
                </EntityLink>
              ) : (
                inspection.inspector
              )}
            </span>
          </div>
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="flex-1 leading-5 break-words">{inspection.noteToInspector}</span>
          </div>
        </div>

        <Button className="w-full mt-4" onClick={() => onView(inspection)}>
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
