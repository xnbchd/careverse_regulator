import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import AppLayout from '@/components/AppLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AuditLogViewer, AuditLogDetail, AuditStats } from '@/components/audit'
import { useAuditStore } from '@/stores/auditStore'
import { BarChart3, List } from 'lucide-react'

export const Route = createFileRoute('/audit-logs')({
  component: AuditLogsPage,
})

function AuditLogsPage() {
  const { selectedLog, selectLog } = useAuditStore()
  const [showDetail, setShowDetail] = useState(false)

  // Auto-open detail when log is selected
  const handleLogSelect = () => {
    if (selectedLog) {
      setShowDetail(true)
    }
  }

  // Listen for log selection
  useState(() => {
    handleLogSelect()
  })

  return (
    <AppLayout
      currentRoute="audit-logs"
      pageTitle="Audit Logs"
      pageSubtitle="Complete audit trail and activity tracking"
      onNavigate={() => {}}
      onOpenNotifications={() => {}}
      onLogout={() => {}}
      onSwitchToDesk={() => {}}
      user={null}
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
