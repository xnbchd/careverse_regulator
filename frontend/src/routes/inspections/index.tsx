import { createFileRoute } from "@tanstack/react-router"
import { InspectionsDashboard } from "@/components/inspection/InspectionsDashboard"
import { getDashboardStats } from "@/api/inspectionApi"

export const Route = createFileRoute("/inspections/")({
  loader: () => getDashboardStats(),
  component: InspectionsDashboard,
})
