import { createFileRoute } from "@tanstack/react-router"
import { InspectionsDashboard } from "@/components/inspection/InspectionsDashboard"
import { getDashboardStats } from "@/api/inspectionApi"

export const Route = createFileRoute("/inspections/")({
  loader: async () => {
    try {
      return await getDashboardStats()
    } catch (err) {
      console.warn("Inspections dashboard loader failed:", err)
      return null
    }
  },
  component: InspectionsDashboard,
})
