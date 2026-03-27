import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { useLicensingStore } from "@/stores/licensingStore"
import { useInspectionStore } from "@/stores/inspectionStore"

const MainDashboard = lazy(() => import("@/components/MainDashboard"))

function DashboardComponent() {
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
      currentRoute="dashboard"
      pageTitle="Dashboard"
      pageSubtitle="Compliance signals and priority actions."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <MainDashboard onNavigate={handleNavigate} company={user?.company} />
    </AppLayout>
  )
}

export const Route = createFileRoute("/dashboard")({
  loader: () =>
    Promise.all([
      useAffiliationStore.getState().fetchAffiliations(1, { page_size: 100 }),
      useLicensingStore.getState().fetchLicenses(1, { page_size: 100 }),
      useLicensingStore.getState().fetchApplications(1, { page_size: 100 }),
      useInspectionStore.getState().fetchInspections(1, { page_size: 100 }),
    ]),
  component: DashboardComponent,
})
