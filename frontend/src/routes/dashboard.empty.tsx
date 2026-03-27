import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useDashboardStore } from "@/stores/dashboardStore"

const DashboardView = lazy(() => import("@/components/DashboardView"))

function DashboardEmptyComponent() {
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
      currentRoute="dashboard/empty"
      pageTitle="Dashboard"
      pageSubtitle="No live data connected yet."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <DashboardView emptyState onNavigate={handleNavigate} company={user?.company} />
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute("/dashboard/empty")({
  loader: () => {
    const company = useAuthStore.getState().user?.company
    useDashboardStore.getState().applyMockForCompany(company)
  },
  component: DashboardEmptyComponent,
})
