import { createFileRoute } from "@tanstack/react-router"
import { AffiliationsDashboard } from "@/components/affiliations/AffiliationsDashboard"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/")({
  loader: async () => {
    const store = useRegistryStore.getState()
    const results = await Promise.allSettled([
      store.fetchFacilities(1),
      store.fetchProfessionals(1),
    ])
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`Affiliations dashboard loader: fetch ${i} failed —`, r.reason)
      }
    })
  },
  component: AffiliationsDashboard,
})
