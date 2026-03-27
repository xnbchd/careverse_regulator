import {
  FileText,
  Download,
  Calendar,
  User,
  Folder,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import type { Finding } from "@/stores/findingsStore"
import FindingsBadge from "./FindingsBadge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

interface FindingsDetailModalProps {
  open: boolean
  onClose: () => void
  finding: Finding | null
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
    <div className="flex-1">
      <div className={cn("text-muted-foreground mb-1", isMobile ? "text-xs" : "text-sm")}>
        {label}
      </div>
      <div className={cn("text-foreground font-medium", isMobile ? "text-sm" : "text-base")}>
        {value}
      </div>
    </div>
  </div>
)

export default function FindingsDetailModal({ open, onClose, finding }: FindingsDetailModalProps) {
  const { isMobile } = useResponsive()

  if (!finding) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("max-w-3xl", isMobile && "w-full max-h-screen")}>
        <DialogHeader>
          <DialogTitle
            className={cn("font-semibold text-foreground", isMobile ? "text-base" : "text-lg")}
          >
            Inspection Finding
          </DialogTitle>
          <div
            className={cn("text-muted-foreground font-normal", isMobile ? "text-sm" : "text-base")}
          >
            {finding.findingId}
          </div>
        </DialogHeader>

        <div
          className={cn("space-y-5", isMobile ? "max-h-[calc(100vh-200px)] overflow-y-auto" : "")}
        >
          {/* Facility Header */}
          <div className={cn("bg-muted/40 rounded-xl border", isMobile ? "p-4" : "p-5")}>
            <div
              className={cn("font-semibold text-foreground mb-3", isMobile ? "text-lg" : "text-xl")}
            >
              {finding.facilityName}
            </div>
            <div className="flex gap-2 flex-wrap">
              <FindingsBadge severity={finding.severity} />
              <FindingsBadge status={finding.status} />
              <Badge variant="secondary">{finding.category}</Badge>
            </div>
          </div>

          {/* Info Grid */}
          <div className={cn("space-y-4 w-full", isMobile ? "space-y-4" : "space-y-5")}>
            <InfoRow
              icon={<Calendar className="w-[18px] h-[18px] shrink-0" />}
              label="Inspection Date"
              value={finding.inspectionDate}
              isMobile={isMobile}
            />
            <InfoRow
              icon={<User className="w-[18px] h-[18px] shrink-0" />}
              label="Inspector"
              value={finding.inspector}
              isMobile={isMobile}
            />
            <InfoRow
              icon={<Clock className="w-[18px] h-[18px] shrink-0" />}
              label="Due Date"
              value={finding.dueDate}
              isMobile={isMobile}
            />
            {finding.resolvedDate && (
              <InfoRow
                icon={<CheckCircle className="w-[18px] h-[18px] shrink-0" />}
                label="Resolved Date"
                value={finding.resolvedDate}
                isMobile={isMobile}
              />
            )}
          </div>

          <Separator className="my-5" />

          {/* Description Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <div
                className={cn("font-semibold text-foreground", isMobile ? "text-sm" : "text-base")}
              >
                Finding Description
              </div>
            </div>
            <div
              className={cn(
                "text-muted-foreground leading-relaxed rounded-lg border border-red-200 bg-red-50",
                isMobile ? "text-sm p-3" : "text-base p-4"
              )}
            >
              {finding.description}
            </div>
          </div>

          {/* Corrective Action */}
          {finding.correctiveAction && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                <div
                  className={cn(
                    "font-semibold text-foreground",
                    isMobile ? "text-sm" : "text-base"
                  )}
                >
                  Corrective Action Required
                </div>
              </div>
              <div
                className={cn(
                  "text-muted-foreground leading-relaxed rounded-lg border border-green-200 bg-green-50",
                  isMobile ? "text-sm p-3" : "text-base p-4"
                )}
              >
                {finding.correctiveAction}
              </div>
            </div>
          )}

          {/* Evidence Section */}
          {finding.evidence && finding.evidence.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Folder className="w-4 h-4 text-muted-foreground shrink-0" />
                <div
                  className={cn(
                    "font-semibold text-foreground",
                    isMobile ? "text-sm" : "text-base"
                  )}
                >
                  Evidence & Documentation
                </div>
              </div>
              <div className="space-y-2 w-full">
                {finding.evidence.map((doc, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex justify-between items-center border rounded-lg bg-muted/40",
                      isMobile ? "p-3" : "p-3.5"
                    )}
                  >
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <FileText className="w-[18px] h-[18px] text-muted-foreground shrink-0" />
                      <span
                        className={cn(
                          "text-foreground truncate",
                          isMobile ? "text-sm" : "text-base"
                        )}
                      >
                        {doc}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size={isMobile ? "sm" : "default"}
                      className="text-primary shrink-0"
                    >
                      <Download className="w-4 h-4 shrink-0" />
                      {!isMobile && <span className="ml-2">Download</span>}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={cn("flex justify-end pt-4", isMobile && "pt-3")}>
          <Button
            size={isMobile ? "default" : "lg"}
            onClick={onClose}
            className={cn(isMobile && "w-full")}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
