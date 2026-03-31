import { useRouter } from "@tanstack/react-router"
import { Compass, ArrowLeft, LayoutDashboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NotFoundPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
      {/* Large decorative number */}
      <p className="text-[96px] font-bold leading-none text-primary/10 select-none mb-2">404</p>

      {/* Icon */}
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4 -mt-4">
        <Compass className="h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
      </div>

      {/* Heading */}
      <h1 className="text-2xl font-semibold text-foreground mb-2">Page not found</h1>

      {/* Message */}
      <p className="text-sm text-muted-foreground max-w-sm leading-relaxed mb-8">
        The page you're looking for doesn't exist, has been moved, or you don't have permission to
        access it.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => router.navigate({ to: "/dashboard" })}>
          <LayoutDashboard className="h-4 w-4 mr-2" />
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => router.history.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  )
}
