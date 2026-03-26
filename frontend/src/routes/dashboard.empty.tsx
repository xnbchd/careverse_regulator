import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy } from 'react'
import AppLayout from '@/components/AppLayout'
import { useAuthStore } from '@/stores/authStore'

const DashboardView = lazy(() => import('@/components/DashboardView'))

function DashboardEmptyComponent() {
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
      currentRoute="dashboard/empty"
      pageTitle="Dashboard"
      pageSubtitle="No live data connected yet."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
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

export const Route = createFileRoute('/dashboard/empty')({
  component: DashboardEmptyComponent,
})
