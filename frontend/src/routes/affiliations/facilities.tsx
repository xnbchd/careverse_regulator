import { createFileRoute } from "@tanstack/react-router"
import { FacilitiesListView } from "@/components/affiliations/FacilitiesListView"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/facilities")({
  loader: async () => {
    try {
      await useRegistryStore.getState().fetchFacilities(1, { page_size: 20 })
    } catch (err) {
      console.warn("Facilities loader failed:", err)
    }
  },
  component: FacilitiesListView,
})
