import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppLayout from '@/components/AppLayout'
import { DocumentManagementView } from '@/components/documents'
import { useAuthStore } from '@/stores/authStore'

export const Route = createFileRoute('/documents')({
  component: DocumentsPage,
})

function DocumentsPage() {
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
      currentRoute="documents"
      pageTitle="Documents"
      pageSubtitle="Manage regulatory documents and files"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <DocumentManagementView />
    </AppLayout>
  )
}
