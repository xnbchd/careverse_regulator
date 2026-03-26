import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy } from 'react'
import AppLayout from '@/components/AppLayout'
import { useAuthStore } from '@/stores/authStore'

const NotificationsView = lazy(() => import('@/components/notifications/NotificationsView'))

function NotificationsCenterComponent() {
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
      currentRoute="notifications-center"
      pageTitle="Notifications Center"
      pageSubtitle="Track reminders, alerts, and follow-up actions."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <NotificationsView />
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute('/notifications-center')({
  component: NotificationsCenterComponent,
})
