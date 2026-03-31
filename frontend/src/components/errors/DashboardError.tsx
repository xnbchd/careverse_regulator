import { useRouter } from "@tanstack/react-router"
import { AlertTriangle, RefreshCw, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface DashboardErrorProps {
  error?: Error | null
  reset?: () => void
}

function getErrorMessage(error: Error | null | undefined): string {
  if (!error) return "An unexpected error occurred while loading the dashboard."
  // Network / API errors
  if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
    return "Unable to reach the server. Please check your connection and try again."
  }
  if (error.message.includes("401") || error.message.includes("Unauthorized")) {
    return "Your session may have expired. Please reload or log in again."
  }
  if (error.message.includes("403") || error.message.includes("Forbidden")) {
    return "You don't have permission to view this dashboard."
  }
  if (error.message.includes("500")) {
    return "A server error occurred. Our team has been notified."
  }
  return error.message || "An unexpected error occurred while loading the dashboard."
}

export function DashboardError({ error, reset }: DashboardErrorProps) {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
      <Card className="w-full max-w-md border border-destructive/20">
        <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-5">
            <AlertTriangle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold text-foreground mb-2">Dashboard failed to load</h2>

          {/* Message */}
          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            {getErrorMessage(error)}
          </p>

          {/* Error detail (dev-friendly, collapsed) */}
          {error?.message && (
            <details className="w-full text-left mb-6">
              <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                Technical details
              </summary>
              <pre className="mt-2 text-xs bg-muted rounded-md p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
                {error.message}
              </pre>
            </details>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="default"
              className="flex-1"
              onClick={() => {
                if (reset) {
                  reset()
                } else {
                  router.invalidate()
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => router.navigate({ to: "/dashboard" })}
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
