import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { useLicensingStore } from "@/stores/licensingStore"
import { useInspectionStore } from "@/stores/inspectionStore"
import { DashboardError } from "@/components/errors/DashboardError"

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

function DashboardErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
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
      <DashboardError error={error} reset={reset} />
    </AppLayout>
  )
}

export const Route = createFileRoute("/dashboard")({
  loader: async () => {
    // All fetches run in parallel; individual failures are swallowed so the
    // dashboard renders with partial data rather than crashing entirely.
    const results = await Promise.allSettled([
      useAffiliationStore.getState().fetchAffiliations(1, { page_size: 100 }),
      useLicensingStore.getState().fetchLicenses(1, { page_size: 100 }),
      useLicensingStore.getState().fetchApplications(1, { page_size: 100 }),
      useInspectionStore.getState().fetchInspections(1, { page_size: 100 }),
    ])

    // Log partial failures for debugging but don't throw — partial data is
    // still useful and prevents a full route crash for a single API failure.
    results.forEach((result, i) => {
      if (result.status === "rejected") {
        console.warn(`Dashboard loader: fetch ${i} failed —`, result.reason)
      }
    })
  },
  component: DashboardComponent,
  errorComponent: DashboardErrorComponent,
})
