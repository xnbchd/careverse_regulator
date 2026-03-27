import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import { useAuthStore } from "@/stores/authStore"
import { useInspectionStore } from "@/stores/inspectionStore"

const InspectionView = lazy(() => import("@/components/inspection"))

function InspectionsListComponent() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="hq-page-wrap">
      <InspectionView company={user?.company} />
    </div>
  )
}

export const Route = createFileRoute("/inspections/list")({
  loader: () =>
    Promise.all([
      useInspectionStore.getState().fetchFacilities(),
      useInspectionStore.getState().fetchProfessionals(),
    ]),
  component: InspectionsListComponent,
})
