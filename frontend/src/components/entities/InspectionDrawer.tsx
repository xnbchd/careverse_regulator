import type { Inspection } from "@/types/inspection"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EntityLink } from "./EntityLink"
import { Calendar, User, IdCard, FileText, CheckCircle, Building2 } from "lucide-react"

interface InspectionDrawerProps {
  inspection: Inspection
  loading: boolean
}

export function InspectionDrawer({ inspection, loading }: InspectionDrawerProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4" />
          <div className="h-4 bg-muted rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!inspection) {
    return (
      <div>
        <p className="text-muted-foreground text-start">Inspection not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Facility Header */}
      <div className="rounded-xl border border-border bg-muted/50 p-5">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <EntityLink
              type="facility"
              id={inspection.facilityId}
              className="text-xl font-semibold text-foreground inline-block mb-1 text-start"
            >
              {inspection.facilityName}
            </EntityLink>
            <p className="text-sm text-muted-foreground text-start">
              Facility Registration: {inspection.facilityId}
            </p>
          </div>
        </div>
        <Badge
          variant={
            inspection.status === "Scheduled"
              ? "secondary"
              : inspection.status === "In Progress"
              ? "default"
              : inspection.status === "Completed"
              ? "outline"
              : "secondary"
          }
        >
          {inspection.status}
        </Badge>
      </div>

      <Separator />

      {/* Info Grid */}
      <div className="flex flex-col gap-5">
        <div className="flex gap-3 items-start">
          <div className="text-muted-foreground text-lg mt-0.5 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground mb-1 text-start">Inspection Date</div>
            <div className="font-medium text-base text-start">{inspection.date}</div>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="text-muted-foreground text-lg mt-0.5 shrink-0">
            <User className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground mb-1 text-start">Inspector</div>
            <EntityLink
              type="professional"
              id={inspection.professionalId}
              className="font-medium text-base inline-block text-start"
            >
              {inspection.inspector}
            </EntityLink>
          </div>
        </div>

        <div className="flex gap-3 items-start">
          <div className="text-muted-foreground text-lg mt-0.5 shrink-0">
            <IdCard className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground mb-1 text-start">Inspection ID</div>
            <div className="font-medium text-base font-mono text-start">
              {inspection.inspectionId}
            </div>
          </div>
        </div>
      </div>

      <Separator />

      {/* Notes Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <div className="font-semibold text-base text-start">Note to Inspector</div>
        </div>
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 leading-relaxed break-words dark:bg-yellow-950/20 dark:text-yellow-200 dark:border-yellow-900 text-sm p-4 text-start">
          {inspection.noteToInspector || "No additional notes provided"}
        </div>
      </div>

      {/* Checklist Section */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900 p-5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <div className="font-semibold text-base text-blue-600 dark:text-blue-400 text-start">
            Inspection Checklist
          </div>
        </div>
        <ul className="text-blue-900 dark:text-blue-200 leading-relaxed m-0 text-sm pl-6 text-start">
          <li>Verify facility licensing and permits</li>
          <li>Inspect safety equipment and emergency systems</li>
          <li>Review staff credentials and certifications</li>
          <li>Check infection control protocols</li>
          <li>Evaluate patient care standards</li>
          <li>Document all findings with photos/evidence</li>
        </ul>
      </div>
    </div>
  )
}
