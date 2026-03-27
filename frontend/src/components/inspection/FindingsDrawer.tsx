import { useMemo } from "react"
import { Download, Calendar, AlertCircle, CheckCircle2, Clock, FileText } from "lucide-react"
import { useResponsive } from "@/hooks/useResponsive"
import type { Inspection, Finding, Attachment } from "@/types/inspection"
import FindingsBadge from "./FindingsBadge"
import { EntityLink } from "@/components/entities/EntityLink"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface FindingsDrawerProps {
  open: boolean
  onClose: () => void
  inspection: Inspection | null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

function handleDownloadAttachment(attachment: Attachment) {
  window.open(attachment.file_url, "_blank")
}

function getSeverityBorderClass(severity?: string) {
  switch (severity) {
    case "Critical":
      return "border-l-4 border-l-red-500"
    case "Major":
      return "border-l-4 border-l-orange-500"
    case "Minor":
      return "border-l-4 border-l-yellow-500"
    default:
      return "border-l-4 border-l-gray-300"
  }
}

export default function FindingsDrawer({ open, onClose, inspection }: FindingsDrawerProps) {
  const { isMobile } = useResponsive()

  const findingsSummary = useMemo(() => {
    if (!inspection?.findings) return { total: 0, critical: 0, major: 0, minor: 0 }

    return inspection.findings.reduce(
      (acc, finding) => {
        acc.total++
        if (finding.severity === "Critical") acc.critical++
        else if (finding.severity === "Major") acc.major++
        else if (finding.severity === "Minor") acc.minor++
        return acc
      },
      { total: 0, critical: 0, major: 0, minor: 0 }
    )
  }, [inspection?.findings])

  const findingsByCategory = useMemo(() => {
    if (!inspection?.findings) return {}

    return inspection.findings
      .filter((finding) => finding.category && finding.category.trim())
      .reduce((acc, finding) => {
        const category = finding.category.trim()
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(finding)
        return acc
      }, {} as Record<string, Finding[]>)
  }, [inspection?.findings])

  const categories = Object.keys(findingsByCategory)
  const hasValidFindings = categories.length > 0

  if (!inspection) return null

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={cn(
          "flex flex-col p-0 overflow-hidden gap-0",
          isMobile
            ? "w-full h-[85vh] rounded-t-2xl"
            : "w-[95vw] sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[55vw] 2xl:w-[50vw]"
        )}
      >
        {/* Fixed Header */}
        <SheetHeader
          className={cn(
            "shrink-0 border-b space-y-2",
            isMobile ? "px-4 pt-4 pb-3" : "px-6 pt-6 pb-4"
          )}
        >
          <SheetTitle
            className={cn("break-words pr-10 text-start", isMobile ? "text-base" : "text-lg")}
          >
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
          </SheetTitle>
          <SheetDescription
            className={cn("flex flex-col gap-1 pr-10", isMobile ? "text-xs" : "text-sm")}
          >
            <div className="flex items-center gap-2 text-start">
              <Calendar className={cn("shrink-0", isMobile ? "w-3.5 h-3.5" : "w-4 h-4")} />
              <span className="break-words flex-1 min-w-0 text-start">
                {inspection.inspectedDate
                  ? `Inspected: ${inspection.inspectedDate}`
                  : "Not yet inspected"}
              </span>
            </div>
            {inspection.inspector && (
              <div className="flex items-center gap-2 text-start">
                <span className="break-words flex-1 min-w-0 text-start">
                  Inspector:{" "}
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
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Scrollable Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden w-full",
            isMobile ? "px-4 py-3" : "px-6 py-4"
          )}
        >
          {!hasValidFindings ? (
            <Card>
              <CardContent
                className={cn(
                  "flex flex-col items-center justify-center",
                  isMobile ? "py-8" : "py-12"
                )}
              >
                <FileText
                  className={cn("text-muted-foreground mb-4", isMobile ? "w-10 h-10" : "w-12 h-12")}
                />
                <p
                  className={cn(
                    "text-muted-foreground text-center",
                    isMobile ? "text-xs" : "text-sm"
                  )}
                >
                  No findings recorded for this inspection
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards */}
              <div
                className={cn(
                  "grid gap-2 mb-4",
                  isMobile ? "grid-cols-2" : "grid-cols-4 gap-3 mb-6"
                )}
              >
                <Card className="border-t-4 border-t-primary">
                  <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                    <div className={cn("font-bold text-start", isMobile ? "text-xl" : "text-2xl")}>
                      {findingsSummary.total}
                    </div>
                    <div
                      className={cn(
                        "text-muted-foreground text-start",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}
                    >
                      Total
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-red-500">
                  <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                    <div
                      className={cn(
                        "font-bold text-red-600 dark:text-red-400 text-start",
                        isMobile ? "text-xl" : "text-2xl"
                      )}
                    >
                      {findingsSummary.critical}
                    </div>
                    <div
                      className={cn(
                        "text-muted-foreground text-start",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}
                    >
                      Critical
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-orange-500">
                  <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                    <div
                      className={cn(
                        "font-bold text-orange-600 dark:text-orange-400 text-start",
                        isMobile ? "text-xl" : "text-2xl"
                      )}
                    >
                      {findingsSummary.major}
                    </div>
                    <div
                      className={cn(
                        "text-muted-foreground text-start",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}
                    >
                      Major
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-yellow-500">
                  <CardContent className={cn(isMobile ? "p-3" : "p-4")}>
                    <div
                      className={cn(
                        "font-bold text-yellow-600 dark:text-yellow-400 text-start",
                        isMobile ? "text-xl" : "text-2xl"
                      )}
                    >
                      {findingsSummary.minor}
                    </div>
                    <div
                      className={cn(
                        "text-muted-foreground text-start",
                        isMobile ? "text-[10px]" : "text-xs"
                      )}
                    >
                      Minor
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Findings by Category */}
              <Accordion type="multiple" className="space-y-2 w-full">
                {categories.map((category) => (
                  <AccordionItem
                    key={category}
                    value={category}
                    className={cn("border rounded-lg overflow-hidden", isMobile ? "px-3" : "px-4")}
                  >
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2 flex-1 min-w-0 pr-2">
                        <span
                          className={cn(
                            "font-semibold break-words flex-1 text-start",
                            isMobile ? "text-sm" : "text-base"
                          )}
                        >
                          {category}
                        </span>
                        <Badge
                          variant="secondary"
                          className={cn("shrink-0", isMobile && "text-xs px-1.5 py-0")}
                        >
                          {findingsByCategory[category].length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className={cn(isMobile ? "pb-3" : "pb-4")}>
                      <div className={cn("pt-2", isMobile ? "space-y-2" : "space-y-3")}>
                        {findingsByCategory[category].map((finding) => (
                          <Card
                            key={finding.id}
                            className={cn(getSeverityBorderClass(finding.severity))}
                          >
                            <CardContent
                              className={cn("overflow-hidden", isMobile ? "p-3" : "p-4")}
                            >
                              {/* Badges */}
                              <div
                                className={cn(
                                  "flex flex-wrap mb-2",
                                  isMobile ? "gap-1.5" : "gap-2 mb-3"
                                )}
                              >
                                <FindingsBadge severity={finding.severity} />
                                <FindingsBadge status={finding.status} />
                              </div>

                              {/* Description */}
                              <p
                                className={cn(
                                  "leading-relaxed break-words overflow-wrap-anywhere text-start",
                                  isMobile ? "text-xs mb-2" : "text-sm mb-3"
                                )}
                              >
                                {finding.description}
                              </p>

                              {/* Corrective Action */}
                              {finding.correctiveAction && (
                                <>
                                  <Separator className={cn(isMobile ? "my-2" : "my-3")} />
                                  <div
                                    className={cn(
                                      "bg-blue-50 dark:bg-blue-950/20 rounded-lg overflow-hidden",
                                      isMobile ? "p-2" : "p-3"
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "flex items-start gap-2 flex-wrap",
                                        isMobile ? "mb-1" : "mb-2"
                                      )}
                                    >
                                      <AlertCircle
                                        className={cn(
                                          "text-blue-600 dark:text-blue-400 mt-0.5 shrink-0",
                                          isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
                                        )}
                                      />
                                      <span
                                        className={cn(
                                          "font-semibold text-blue-600 dark:text-blue-400 break-words flex-1 min-w-0 text-start",
                                          isMobile ? "text-[10px]" : "text-xs"
                                        )}
                                      >
                                        Corrective Action Required
                                      </span>
                                    </div>
                                    <p
                                      className={cn(
                                        "text-blue-900 dark:text-blue-200 break-words overflow-wrap-anywhere text-start",
                                        isMobile ? "text-xs" : "text-sm"
                                      )}
                                    >
                                      {finding.correctiveAction}
                                    </p>
                                  </div>
                                </>
                              )}

                              {/* Attachments */}
                              {finding.attachments && finding.attachments.length > 0 && (
                                <>
                                  <Separator className={cn(isMobile ? "my-2" : "my-3")} />
                                  <div className="overflow-hidden">
                                    <div
                                      className={cn(
                                        "font-semibold text-muted-foreground break-words text-start",
                                        isMobile ? "text-[10px] mb-1.5" : "text-xs mb-2"
                                      )}
                                    >
                                      Attachments ({finding.attachments.length})
                                    </div>
                                    <div
                                      className={cn(
                                        "w-full",
                                        isMobile ? "space-y-1.5" : "space-y-2"
                                      )}
                                    >
                                      {finding.attachments.map((attachment) => (
                                        <Button
                                          key={attachment.name}
                                          variant="outline"
                                          size="sm"
                                          onClick={() => handleDownloadAttachment(attachment)}
                                          className={cn(
                                            "w-full justify-start h-auto min-h-[44px] overflow-hidden",
                                            isMobile ? "py-2 px-3" : "py-2.5 px-3"
                                          )}
                                        >
                                          <Download
                                            className={cn(
                                              "shrink-0 mr-2",
                                              isMobile ? "w-3.5 h-3.5" : "w-4 h-4"
                                            )}
                                          />
                                          <div className="flex-1 min-w-0 text-left overflow-hidden">
                                            <div
                                              className={cn(
                                                "break-words overflow-wrap-anywhere w-full text-start",
                                                isMobile ? "text-xs" : "text-sm"
                                              )}
                                            >
                                              {attachment.file_name}
                                            </div>
                                            <div
                                              className={cn(
                                                "text-muted-foreground truncate text-start",
                                                isMobile ? "text-[10px]" : "text-xs"
                                              )}
                                            >
                                              {formatFileSize(attachment.file_size)}
                                            </div>
                                          </div>
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}

                              {/* Dates */}
                              {(finding.dueDate || finding.resolvedDate) && (
                                <>
                                  <Separator className={cn(isMobile ? "my-2" : "my-3")} />
                                  <div
                                    className={cn(
                                      "flex flex-wrap text-muted-foreground overflow-hidden",
                                      isMobile ? "gap-2 text-[10px]" : "gap-4 text-xs"
                                    )}
                                  >
                                    {finding.dueDate && (
                                      <div className="flex items-center gap-1.5 break-words text-start">
                                        <Clock
                                          className={cn(
                                            "shrink-0",
                                            isMobile ? "w-3 h-3" : "w-3.5 h-3.5"
                                          )}
                                        />
                                        <span className="break-words text-start">
                                          Due: {finding.dueDate}
                                        </span>
                                      </div>
                                    )}
                                    {finding.resolvedDate && (
                                      <div className="flex items-center gap-1.5 text-green-600 dark:text-green-400 break-words text-start">
                                        <CheckCircle2
                                          className={cn(
                                            "shrink-0",
                                            isMobile ? "w-3 h-3" : "w-3.5 h-3.5"
                                          )}
                                        />
                                        <span className="break-words text-start">
                                          Resolved: {finding.resolvedDate}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
