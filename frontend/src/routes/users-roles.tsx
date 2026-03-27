import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"
import { useUserStore } from "@/stores/userStore"
import { fetchUsers } from "@/api/userManagementApi"

const UserAdministrationView = lazy(() => import("@/components/users/UserAdministrationView"))

function UsersRolesComponent() {
  const navigate = Route.useNavigate()
  const user = useAuthStore((state) => state.user)

  // Role guard — only Regulator Admin can access this page
  const hasAccess =
    user?.roles?.includes("Regulator Admin") || user?.roles?.includes("System Manager")

  const handleNavigate = (route: string) => {
    navigate({ to: `/${route}` })
  }

  const handleLogout = () => {
    window.location.href = "/logout?redirect-to=/"
  }

  const handleSwitchToDesk = () => {
    window.location.href = "/app"
  }

  if (!hasAccess) {
    return (
      <AppLayout
        currentRoute="users-roles"
        pageTitle="Access Denied"
        onNavigate={handleNavigate}
        onOpenNotifications={() => handleNavigate("notifications-center")}
        onLogout={handleLogout}
        onSwitchToDesk={handleSwitchToDesk}
        user={user}
      >
        <div className="hq-page-wrap">
          <div className="flex flex-col items-center justify-center py-20">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You do not have permission to access User & Role Management.
            </p>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      currentRoute="users-roles"
      pageTitle="User & Role Administration"
      pageSubtitle="Manage access boundaries and operator permissions."
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
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

export const Route = createFileRoute("/users-roles")({
  loader: async () => {
    const store = useUserStore.getState()
    store.setLoading(true)
    try {
      const result = await fetchUsers({ page: 1, page_size: 20, include_roles: 1 })
      store.setUsers(result.users, result.pagination)
    } catch {
      store.setLoading(false)
    }
  },
  component: UsersRolesComponent,
})
