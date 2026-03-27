import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"

export interface Activity {
  id: string
  type: string
  description: string
  timestamp: string
  user?: string
  status?: string
}

export interface RecentActivityProps {
  activities: Activity[]
  limit?: number
  title?: string
}

const activityTypeColors: Record<string, string> = {
  approved: "bg-green-500",
  rejected: "bg-red-500",
  created: "bg-blue-500",
  updated: "bg-yellow-500",
  suspended: "bg-orange-500",
  expired: "bg-muted-foreground/60",
  default: "bg-muted-foreground/50",
}

export function RecentActivity({
  activities,
  limit = 5,
  title = "Recent Activity",
}: RecentActivityProps) {
  const displayActivities = activities.slice(0, limit)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No recent activity</div>
        ) : (
          <div className="space-y-4">
            {displayActivities.map((activity, index) => (
              <div key={activity.id} className="flex gap-3">
                {/* Timeline dot */}
                <div className="flex flex-col items-center">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      activityTypeColors[activity.type.toLowerCase()] || activityTypeColors.default
                    }`}
                  />
                  {index < displayActivities.length - 1 && (
                    <div className="w-0.5 h-full bg-muted mt-1" />
                  )}
                </div>

                {/* Activity content */}
                <div className="flex-1 pb-4">
                  <p className="text-sm font-medium text-foreground">{activity.description}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                    {activity.user && (
                      <>
                        <span>•</span>
                        <span>{activity.user}</span>
                      </>
                    )}
                    {activity.status && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{activity.status}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
