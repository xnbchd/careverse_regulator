import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import AppLayout from '@/components/AppLayout'
import { useAuthStore } from '@/stores/authStore'

function LicenseManagementLayoutComponent() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const handleNavigate = (route: string) => {
    navigate({ to: `/${route}` as any })
  }

  const handleLogout = () => {
    window.location.href = '/logout?redirect-to=/'
  }

  const handleSwitchToDesk = () => {
    window.location.href = '/app'
  }

  return (
    <AppLayout
      currentRoute="license-management"
      pageTitle="License Management"
      pageSubtitle="Manage facility licenses, applications, and renewals."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <Outlet />
    </AppLayout>
  )
}

export const Route = createFileRoute('/license-management')({
  component: LicenseManagementLayoutComponent,
})
