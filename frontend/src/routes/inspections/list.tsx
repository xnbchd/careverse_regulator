import { createFileRoute } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/authStore"
import { useInspectionStore } from "@/stores/inspectionStore"
import { useUserStore } from "@/stores/userStore"
import InspectionView from "@/components/inspection"

function InspectionsListComponent() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="hq-page-wrap">
      <InspectionView company={user?.company} />
    </div>
  )
}

export const Route = createFileRoute("/inspections/list")({
  loader: async () => {
    const results = await Promise.allSettled([
      useInspectionStore.getState().fetchFacilities(),
      useUserStore.getState().fetchInspectors(),
    ])
    results.forEach((r, i) => {
      if (r.status === "rejected") {
        console.warn(`Inspections list loader: fetch ${i} failed —`, r.reason)
      }
    })
  },
  component: InspectionsListComponent,
})
