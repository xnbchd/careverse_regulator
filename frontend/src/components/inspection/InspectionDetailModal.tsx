import { Calendar, User, IdCard, FileText, CheckCircle } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import type { Inspection } from "@/types/inspection"
import StatusBadge from "./StatusBadge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface InspectionDetailModalProps {
  open: boolean
  onClose: () => void
  inspection: Inspection | null
}

const InfoRow = ({
  icon,
  label,
  value,
  isMobile,
}: {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
  isMobile: boolean
}) => (
  <div className="flex gap-3 items-start">
    <div className="text-muted-foreground text-lg mt-0.5 shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className={cn("text-muted-foreground mb-1", isMobile ? "text-xs" : "text-sm")}>
        {label}
      </div>
      <div className={cn("font-medium break-words", isMobile ? "text-sm" : "text-base")}>
        {value}
      </div>
    </div>
  </div>
)

export default function InspectionDetailModal({
  open,
  onClose,
  inspection,
}: InspectionDetailModalProps) {
  const { isMobile } = useResponsive()

  if (!inspection) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "gap-0 max-h-[90vh] flex flex-col p-0",
          isMobile ? "w-full h-full max-w-full rounded-none" : "max-w-[700px]"
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle className={cn(isMobile ? "text-base" : "text-lg")}>
            Scheduled Inspection
          </DialogTitle>
          <DialogDescription className={cn("truncate", isMobile ? "text-xs" : "text-sm")}>
            {inspection.inspectionId}
          </DialogDescription>
        </DialogHeader>

        <div className={cn("flex-1 overflow-y-auto", isMobile ? "px-4 py-4" : "px-6 py-6")}>
          {/* Facility Header */}
          <div
            className={cn(
              "rounded-xl border border-border bg-muted/50 mb-5",
              isMobile ? "p-4" : "p-5"
            )}
          >
            <div className={cn("font-semibold mb-2 break-words", isMobile ? "text-lg" : "text-xl")}>
              {inspection.facilityName}
            </div>
            <StatusBadge status={inspection.status} />
          </div>

          {/* Info Grid */}
          <div className={cn("flex flex-col mb-5", isMobile ? "gap-4" : "gap-5")}>
            <InfoRow
              icon={<Calendar className="w-[18px] h-[18px]" />}
              label="Inspection Date"
              value={inspection.date}
              isMobile={isMobile}
            />
            <InfoRow
              icon={<User className="w-[18px] h-[18px]" />}
              label="Inspector"
              value={inspection.inspector}
              isMobile={isMobile}
            />
            <InfoRow
              icon={<IdCard className="w-[18px] h-[18px]" />}
              label="Inspection ID"
              value={inspection.inspectionId}
              isMobile={isMobile}
            />
          </div>

          <Separator className="my-5" />

          {/* Notes Section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <div className={cn("font-semibold", isMobile ? "text-sm" : "text-base")}>
                Note to Inspector
              </div>
            </div>
            <div
              className={cn(
                "rounded-lg border border-yellow-200 bg-yellow-50 text-yellow-900 leading-relaxed break-words dark:bg-yellow-950/20 dark:text-yellow-200 dark:border-yellow-900",
                isMobile ? "text-xs p-3" : "text-sm p-4"
              )}
            >
              {inspection.noteToInspector || "No additional notes provided"}
            </div>
          </div>

          {/* Checklist Section */}
          <div
            className={cn(
              "rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900",
              isMobile ? "p-4" : "p-5"
            )}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-[18px] h-[18px] text-blue-600 dark:text-blue-400" />
              <div
                className={cn(
                  "font-semibold text-blue-600 dark:text-blue-400",
                  isMobile ? "text-sm" : "text-base"
                )}
              >
                Inspection Checklist
              </div>
            </div>
            <ul
              className={cn(
                "text-blue-900 dark:text-blue-200 leading-relaxed m-0",
                isMobile ? "text-xs pl-5" : "text-sm pl-6"
              )}
            >
              <li>Verify facility licensing and permits</li>
              <li>Inspect safety equipment and emergency systems</li>
              <li>Review staff credentials and certifications</li>
              <li>Check infection control protocols</li>
              <li>Evaluate patient care standards</li>
              <li>Document all findings with photos/evidence</li>
            </ul>
          </div>
        </div>

        <div className="shrink-0 border-t px-6 py-4 bg-background">
          <div className={cn("flex gap-3", isMobile ? "flex-col-reverse" : "flex-row justify-end")}>
            <Button variant="outline" onClick={onClose} className={cn(isMobile && "w-full")}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                console.log("Start inspection:", inspection)
                onClose()
              }}
              className={cn(isMobile && "w-full")}
            >
              Start Inspection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
