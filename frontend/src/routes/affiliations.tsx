import { createFileRoute, Outlet } from "@tanstack/react-router"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"

function AffiliationsLayoutComponent() {
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
      currentRoute="affiliations"
      pageTitle="Affiliation Operations"
      pageSubtitle="Review professional affiliations and manage confirmations."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <Outlet />
    </AppLayout>
  )
}

export const Route = createFileRoute("/affiliations")({
  component: AffiliationsLayoutComponent,
})
