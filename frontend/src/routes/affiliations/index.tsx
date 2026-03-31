import { createFileRoute } from "@tanstack/react-router"
import { AffiliationsDashboard } from "@/components/affiliations/AffiliationsDashboard"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/")({
  loader: () => {
    const store = useRegistryStore.getState()
    // Fetch first page at normal page_size — pagination.total_count gives the dashboard
    // its totals, and the data is ready when the user navigates to the list views.
    // Avoids page_size=1 which poisoned the store with only 1 record.
    return Promise.all([store.fetchFacilities(1), store.fetchProfessionals(1)])
  },
  component: AffiliationsDashboard,
})
