import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { lazy } from 'react'
import AppLayout from '@/components/AppLayout'
import { useAuthStore } from '@/stores/authStore'

const UserAdministrationView = lazy(() => import('@/components/users/UserAdministrationView'))

function UsersRolesComponent() {
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
      currentRoute="users-roles"
      pageTitle="User & Role Administration"
      pageSubtitle="Manage access boundaries and operator permissions."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        <UserAdministrationView />
      </div>
    </AppLayout>
  )
}

export const Route = createFileRoute('/users-roles')({
  component: UsersRolesComponent,
})
