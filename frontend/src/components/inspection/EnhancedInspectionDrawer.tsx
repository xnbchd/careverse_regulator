import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { X, Calendar, User, FileText, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Inspection } from "@/types/inspection"
import StatusBadge from "./StatusBadge"
import FindingCardGrid from "./FindingCardGrid"
import { EntityLink } from "@/components/entities"

interface EnhancedInspectionDrawerProps {
  inspection: Inspection | null
  isOpen: boolean
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
}

export default function EnhancedInspectionDrawer({
  inspection,
  isOpen,
  onClose,
  onPrevious,
  onNext,
}: EnhancedInspectionDrawerProps) {
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false)

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement
      if (target.scrollTop > 100) {
        setIsHeaderCollapsed(true)
      } else {
        setIsHeaderCollapsed(false)
      }
    }

    const sheetContent = document.querySelector("[data-drawer-content]")
    sheetContent?.addEventListener("scroll", handleScroll)

    return () => {
      sheetContent?.removeEventListener("scroll", handleScroll)
    }
  }, [])

  if (!inspection) return null

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0"
        data-drawer-content
      >
        {/* Floating Collapsed Header */}
        <div
          className={cn(
            "sticky top-0 z-10 bg-card border-b px-6 py-3 transition-all duration-200",
            isHeaderCollapsed ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <EntityLink
                type="facility"
                id={inspection.facilityId}
                className="font-semibold truncate"
              >
                {inspection.facilityName}
              </EntityLink>
              <StatusBadge status={inspection.status} />
            </div>
            <div className="flex items-center gap-2">
              {onPrevious && (
                <Button variant="ghost" size="icon" onClick={onPrevious} className="h-8 w-8">
                  <ChevronLeft className="w-4 h-4" />
                </Button>
              )}
              {onNext && (
                <Button variant="ghost" size="icon" onClick={onNext} className="h-8 w-8">
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Main Header Card */}
        <div className="p-6">
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-2">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground mb-2">{inspection.inspectionId}</p>
                  <h2 className="text-2xl font-bold mb-2">
                    <EntityLink
                      type="facility"
                      id={inspection.facilityId}
                      className="hover:underline"
                    >
                      {inspection.facilityName}
                    </EntityLink>
                  </h2>
                  <StatusBadge status={inspection.status} />
                </div>
                <div className="flex gap-2">
                  {onPrevious && (
                    <Button variant="outline" size="icon" onClick={onPrevious} className="h-9 w-9">
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  )}
                  {onNext && (
                    <Button variant="outline" size="icon" onClick={onNext} className="h-9 w-9">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Scheduled Date</p>
                    <p className="text-sm font-medium">{inspection.date}</p>
                  </div>
                </div>

                {inspection.inspectedDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Inspected Date</p>
                      <p className="text-sm font-medium">{inspection.inspectedDate}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <p className="text-xs text-muted-foreground">Inspector</p>
                    <p className="text-sm font-medium">
                      <EntityLink
                        type="professional"
                        id={inspection.professionalId}
                        className="hover:underline"
                      >
                        {inspection.inspector}
                      </EntityLink>
                    </p>
                  </div>
                </div>

                {inspection.findingCount !== undefined && (
                  <div className="flex items-start gap-2">
                    <FileText className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Findings</p>
                      <p className="text-sm font-medium">
                        {inspection.findingCount} finding{inspection.findingCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {inspection.noteToInspector && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">
                      Note to Inspector:
                    </p>
                    <p className="text-sm leading-relaxed">{inspection.noteToInspector}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Findings Section */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Inspection Findings</h3>
            {inspection.findings && inspection.findings.length > 0 && (
              <Badge variant="secondary">{inspection.findings.length} total</Badge>
            )}
          </div>

          <FindingCardGrid findings={inspection.findings || []} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
