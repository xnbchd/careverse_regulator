import { createFileRoute } from "@tanstack/react-router"
import { AffiliationsDashboard } from "@/components/affiliations/AffiliationsDashboard"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/")({
  loader: () =>
    Promise.all([
      // Fetch minimal data just for counts
      useRegistryStore.getState().fetchFacilities(1, { page_size: 1 }),
      useRegistryStore.getState().fetchProfessionals(1, { page_size: 1 }),
    ]),
  component: AffiliationsDashboard,
})
