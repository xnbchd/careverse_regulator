import { createFileRoute } from "@tanstack/react-router"
import { LicensesDashboard } from "@/components/licensing/LicensesDashboard"
import { useLicensingStore } from "@/stores/licensingStore"
import { getLicenseDashboardStats } from "@/api/licensingApi"

export const Route = createFileRoute("/license-management/")({
  loader: async () => {
    const results = await Promise.allSettled([
      useLicensingStore.getState().fetchApplications(1, { page_size: 100 }),
      useLicensingStore.getState().fetchProfessionalApplications(1, { page_size: 100 }),
      getLicenseDashboardStats(),
    ])

    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`License management loader: fetch ${i} failed —`, r.reason)
      }
    })

    const dashboardStats = results[2].status === "fulfilled" ? results[2].value : null

    return { dashboardStats }
  },
  component: LicensesDashboard,
})
