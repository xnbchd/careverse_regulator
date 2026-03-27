import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RoadmapShellProps {
  title: string
  description: string
}

const currentTracks = [
  "Module route, access guardrails, and shell layout are ready.",
  "Form and queue components are wired for role-aware workflows.",
  "Design tokens and dark-mode surfaces are aligned to portal standards.",
]

const nextTracks = [
  "Connect live domain APIs for real queue and status data.",
  "Add filters, exports, and full audit-trail visibility.",
  "Complete reviewer actions and approval decision forms.",
]

export default function RoadmapShell({ title, description }: RoadmapShellProps) {
  return (
    <div className="space-y-4">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit">
              Module status: In progress
            </Badge>
            <h3 className="text-2xl font-semibold tracking-tight break-words">{title}</h3>
            <p className="text-sm text-muted-foreground break-words">{description}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Ready now</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {currentTracks.map((item, index) => (
                <li
                  key={index}
                  className="text-sm border-b border-border last:border-0 pb-2 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Next up</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {nextTracks.map((item, index) => (
                <li
                  key={index}
                  className="text-sm border-b border-border last:border-0 pb-2 last:pb-0"
                >
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
