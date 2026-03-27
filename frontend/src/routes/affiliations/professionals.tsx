import { createFileRoute } from "@tanstack/react-router"
import { ProfessionalsListView } from "@/components/affiliations/ProfessionalsListView"
import { useRegistryStore } from "@/stores/registryStore"

export const Route = createFileRoute("/affiliations/professionals")({
  loader: () => useRegistryStore.getState().fetchProfessionals(1, { page_size: 20 }),
  component: ProfessionalsListView,
})
