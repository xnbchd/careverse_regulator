import { useRouter } from "@tanstack/react-router"
import { ServerCrash, RefreshCw, ArrowLeft, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

interface RouteErrorProps {
  error?: Error | null
  reset?: () => void
}

function getErrorInfo(error: Error | null | undefined): {
  code: string
  heading: string
  message: string
} {
  const msg = error?.message ?? ""

  if (
    msg.includes("Failed to fetch") ||
    msg.includes("NetworkError") ||
    msg.includes("ERR_NETWORK")
  ) {
    return {
      code: "Network Error",
      heading: "Connection problem",
      message: "Unable to reach the server. Please check your internet connection and try again.",
    }
  }
  if (msg.includes("401") || msg.includes("Unauthorized")) {
    return {
      code: "401",
      heading: "Session expired",
      message: "Your session may have expired. Please reload the page to log in again.",
    }
  }
  if (msg.includes("403") || msg.includes("Forbidden")) {
    return {
      code: "403",
      heading: "Access denied",
      message:
        "You don't have permission to view this page. Contact your administrator if you believe this is a mistake.",
    }
  }
  if (msg.includes("404") || msg.includes("Not Found")) {
    return {
      code: "404",
      heading: "Page not found",
      message: "The page you're looking for doesn't exist or has been moved.",
    }
  }
  if (msg.includes("500") || msg.includes("Internal Server")) {
    return {
      code: "500",
      heading: "Server error",
      message:
        "Something went wrong on the server. This has been noted — please try again in a moment.",
    }
  }

  return {
    code: "Error",
    heading: "Something went wrong",
    message:
      error?.message ||
      "An unexpected error occurred. You can try again or navigate to another page.",
  }
}

export function RouteError({ error, reset }: RouteErrorProps) {
  const router = useRouter()
  const info = getErrorInfo(error)

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      {/* Error code */}
      <p className="text-[80px] font-bold leading-none text-primary/10 select-none mb-2">
        {info.code}
      </p>

      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-4 -mt-6">
        <ServerCrash className="h-7 w-7 text-destructive" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">{info.heading}</h1>

      {/* Message */}
      <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-8">{info.message}</p>

      {/* Error detail (collapsed, for support) */}
      {error?.message && (
        <details className="w-full max-w-md text-left mb-8">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
            Technical details
          </summary>
          <pre className="mt-2 text-xs bg-muted rounded-md p-3 overflow-x-auto text-muted-foreground whitespace-pre-wrap break-all">
            {error.message}
          </pre>
        </details>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button
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
        <Button variant="outline" onClick={() => router.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
        <Button variant="ghost" onClick={() => router.navigate({ to: "/dashboard" })}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Dashboard
        </Button>
      </div>
    </div>
  )
}
