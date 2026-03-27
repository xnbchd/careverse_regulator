import { createFileRoute } from "@tanstack/react-router"
import { LicensesDashboard } from "@/components/licensing/LicensesDashboard"
import { useLicensingStore } from "@/stores/licensingStore"
import { getLicenseDashboardStats } from "@/api/licensingApi"

export const Route = createFileRoute("/license-management/")({
  loader: async () => {
    const [, , dashboardStats] = await Promise.all([
      useLicensingStore.getState().fetchApplications(1, { page_size: 100 }),
      useLicensingStore.getState().fetchProfessionalApplications(1, { page_size: 100 }),
      getLicenseDashboardStats(),
    ])
    return { dashboardStats }
  },
  component: LicensesDashboard,
})
