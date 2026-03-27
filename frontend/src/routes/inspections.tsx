import { createFileRoute, Outlet } from "@tanstack/react-router"
import { z } from "zod"
import AppLayout from "@/components/AppLayout"
import { useAuthStore } from "@/stores/authStore"

// Search param schema for type-safe URL params
const inspectionSearchSchema = z.object({
  search: z.string().optional(),
  status: z.union([z.string(), z.array(z.string())]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  sortBy: z.enum(["facility_name", "modified"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  activeTab: z.enum(["scheduled", "findings"]).optional().default("scheduled"),
  modal: z.enum(["schedule"]).optional(),
})

export type InspectionSearch = z.infer<typeof inspectionSearchSchema>

function InspectionLayoutComponent() {
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
      currentRoute="inspection"
      pageTitle="Inspection Management"
      pageSubtitle="Schedule and view facility inspections."
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

export const Route = createFileRoute("/inspections")({
  component: InspectionLayoutComponent,
  validateSearch: (search): InspectionSearch => inspectionSearchSchema.parse(search),
})
