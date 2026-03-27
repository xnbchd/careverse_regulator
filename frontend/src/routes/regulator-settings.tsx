import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useSettingsStore } from "@/stores/settingsStore"

const RegulatorSettingsView = lazy(() => import("@/components/settings/RegulatorSettingsView"))

function RegulatorSettingsComponent() {
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
      currentRoute="regulator-settings"
      pageTitle="Regulator Settings"
      pageSubtitle="Configure governance defaults and threshold rules."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <RegulatorSettingsView />
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute("/regulator-settings")({
  loader: () => useSettingsStore.getState().initialize(),
  component: RegulatorSettingsComponent,
})
