import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { z } from "zod"
import { useEffect } from "react"
import UnauthorizedPage from "@/components/UnauthorizedPage"
import { useAuthStore } from "@/stores/authStore"

const unauthorizedSearchSchema = z.object({
  mode: z.enum(["guest", "forbidden", "tenant-misconfigured"]).default("guest"),
})

type UnauthorizedSearch = z.infer<typeof unauthorizedSearchSchema>

function normalizeRoute(route: string): string {
  if (!route) return "dashboard"
  return route.replace(/^#/, "").replace(/^\/+/, "") || "dashboard"
}

function readHashRoute(): string {
  return normalizeRoute(window.location.hash)
}

function loginUrlForRoute(route: string): string {
  return `/login?redirect-to=${encodeURIComponent(`/compliance-360#${route}`)}`
}

function logoutUrl(): string {
  return "/logout?redirect-to=/"
}

function switchToDesk(): void {
  window.location.href = "/app"
}

function UnauthorizedComponent() {
  const navigate = useNavigate()
  const { mode } = Route.useSearch()
  const user = useAuthStore((state) => state.user)
  const hasPortalAccess = useAuthStore((state) => state.hasPortalAccess)
  const accessMessage = useAuthStore((state) => state.accessMessage)
  const route = readHashRoute()

  // Redirect to dashboard if user is logged in and has portal access
  useEffect(() => {
    if (user && hasPortalAccess) {
      navigate({ to: "/dashboard" })
    }
  }, [user, hasPortalAccess, navigate])

  const handleLogout = () => {
    window.location.href = logoutUrl()
  }

  const handleContinueLimited =
    mode === "forbidden"
      ? () => {
          window.location.hash = "dashboard/empty"
        }
      : undefined

  return (
    <UnauthorizedPage
      mode={mode}
      userEmail={user?.email}
      accessMessage={accessMessage || undefined}
      onLogin={() => {
        window.location.href = loginUrlForRoute(route)
      }}
      onContinueLimited={handleContinueLimited}
      onLogout={mode !== "guest" ? handleLogout : undefined}
      onSwitchToDesk={switchToDesk}
    />
  )
}

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedComponent,
  validateSearch: (search): UnauthorizedSearch => unauthorizedSearchSchema.parse(search),
})
