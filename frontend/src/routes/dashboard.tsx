import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy } from 'react'
import AppLayout from '@/components/AppLayout'
import { useAuthStore } from '@/stores/authStore'

const AnalyticsDashboard = lazy(() => import('@/components/analytics/AnalyticsDashboard'))

function DashboardComponent() {
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
      currentRoute="dashboard"
      pageTitle="Analytics Dashboard"
      pageSubtitle="Comprehensive analytics across licenses, affiliations, and inspections"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <AnalyticsDashboard />
    </AppLayout>
  )
}

export const Route = createFileRoute('/dashboard')({
  component: DashboardComponent,
})
