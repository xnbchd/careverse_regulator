import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, AlertTriangle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Finding } from "@/types/inspection"
import FindingsBadge from "./FindingsBadge"

interface FindingCardGridProps {
  findings: Finding[]
  onViewFinding?: (finding: Finding) => void
}

const severityOrder = ["Critical", "Major", "Minor"]
const severityIcons = {
  Critical: AlertTriangle,
  Major: AlertCircle,
  Minor: Info,
}

const severityColors = {
  Critical: "border-l-red-500 bg-red-50/50 dark:bg-red-950/10",
  Major: "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/10",
  Minor: "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/10",
}

export default function FindingCardGrid({ findings, onViewFinding }: FindingCardGridProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    Critical: true,
    Major: true,
    Minor: true,
  })

  // Group findings by severity
  const groupedFindings = findings.reduce((acc, finding) => {
    const severity = finding.severity
    if (!acc[severity]) {
      acc[severity] = []
    }
    acc[severity].push(finding)
    return acc
  }, {} as Record<string, Finding[]>)

  const toggleGroup = (severity: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [severity]: !prev[severity],
    }))
  }

  if (findings.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Info className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p>No findings recorded for this inspection.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {severityOrder.map((severity) => {
        const severityFindings = groupedFindings[severity] || []
        if (severityFindings.length === 0) return null

        const Icon = severityIcons[severity as keyof typeof severityIcons]
        const isExpanded = expandedGroups[severity]

        return (
          <div key={severity}>
            {/* Group Header */}
            <button
              onClick={() => toggleGroup(severity)}
              className="w-full flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors mb-3"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5" />
                <h3 className="font-semibold">{severity} Findings</h3>
                <Badge variant="secondary">{severityFindings.length}</Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Findings Grid */}
            {isExpanded && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                {severityFindings.map((finding) => (
                  <Card
                    key={finding.id}
                    className={cn(
                      "border-l-4 transition-all hover:shadow-md",
                      severityColors[severity as keyof typeof severityColors]
                    )}
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-muted-foreground mb-1">{finding.findingId}</p>
                          <Badge variant="secondary" className="text-xs">
                            {finding.category}
                          </Badge>
                        </div>
                        <div className="flex gap-1">
                          <FindingsBadge severity={finding.severity} />
                          <FindingsBadge status={finding.status} />
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm leading-relaxed mb-3 line-clamp-3">
                        {finding.description}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                          {finding.dueDate && <span>Due: {finding.dueDate}</span>}
                          {finding.resolvedDate && (
                            <span className="text-green-600 dark:text-green-400">✓ Resolved</span>
                          )}
                        </div>
                        {onViewFinding && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onViewFinding(finding)}
                            className="h-7 text-xs"
                          >
                            Details
                          </Button>
                        )}
                      </div>

                      {/* Corrective Action Preview */}
                      {finding.correctiveAction && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Corrective Action:
                          </p>
                          <p className="text-xs line-clamp-2">{finding.correctiveAction}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
