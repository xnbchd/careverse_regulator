import { createFileRoute } from "@tanstack/react-router"
import { FacilitiesListView } from "@/components/affiliations/FacilitiesListView"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/facilities")({
  loader: () => useRegistryStore.getState().fetchFacilities(1, { page_size: 20 }),
  component: FacilitiesListView,
})
