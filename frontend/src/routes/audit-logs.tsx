import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import AppLayout from "@/components/AppLayout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AuditLogViewer, AuditLogDetail, AuditStats } from "@/components/audit"
import { useAuditStore } from "@/stores/auditStore"
import { useAuthStore } from "@/stores/authStore"
import { BarChart3, List } from "lucide-react"

export const Route = createFileRoute("/audit-logs")({
  loader: () =>
    Promise.all([useAuditStore.getState().fetchLogs(), useAuditStore.getState().fetchStats()]),
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const navigate = Route.useNavigate()
  const user = useAuthStore((state) => state.user)
  const { selectedLog, selectLog } = useAuditStore()
  const [showDetail, setShowDetail] = useState(false)

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
      currentRoute="audit-logs"
      pageTitle="Audit Logs"
      pageSubtitle="Complete audit trail and activity tracking"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate("notifications-center")}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">
            <List className="w-4 h-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="stats">
            <BarChart3 className="w-4 h-4 mr-2" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <AuditLogViewer />
        </TabsContent>

        <TabsContent value="stats">
          <AuditStats />
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <AuditLogDetail
        open={showDetail}
        onClose={() => {
          setShowDetail(false)
          selectLog(null)
        }}
      />
    </AppLayout>
  )
}
