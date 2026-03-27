import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"

const ProfileView = lazy(() => import("@/components/ProfileView"))

function ProfileComponent() {
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
      currentRoute="profile"
      pageTitle="Profile"
      pageSubtitle="Manage account identity and session controls."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <ProfileView
          userName={user?.fullName || user?.name || user?.email || "Regulator User"}
          userEmail={user?.email || "No email available"}
          userRole={user?.roles?.[0] || "Regulator Operator"}
          onOpenDesk={handleSwitchToDesk}
          onLogout={handleLogout}
        />
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute("/profile")({
  component: ProfileComponent,
})
