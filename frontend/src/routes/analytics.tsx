import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useAnalyticsStore } from "@/stores/analyticsStore"

const AnalyticsDashboard = lazy(() => import("@/components/analytics/AnalyticsDashboard"))

function AnalyticsComponent() {
  const navigate = Route.useNavigate()
  const user = useAuthStore((state) => state.user)

  const handleNavigate = (route: string) => {
    navigate({ to: `/${route}` })
  }

  const handleLogout = () => {
    window.location.href = "/logout?redirect-to=/"
  }

  const handleSwitchToDesk = () => {
    window.location.href = "/app"
  }

  return (
    <AppLayout
      currentRoute="analytics"
      pageTitle="Analytics"
      pageSubtitle="Comprehensive compliance metrics and operational insights."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <AnalyticsDashboard />
    </AppLayout>
  )
}

export const Route = createFileRoute("/analytics")({
  loader: () => useAnalyticsStore.getState().fetchDashboardData(),
  component: AnalyticsComponent,
})
