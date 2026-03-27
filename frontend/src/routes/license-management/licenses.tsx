import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import { useAuthStore } from "@/stores/authStore"

const LicensesListView = lazy(() => import("@/components/licensing/LicensesListView"))

function LicensesListComponent() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="hq-page-wrap">
      <LicensesListView company={user?.company} />
    </div>
  )
}

export const Route = createFileRoute("/license-management/licenses")({
  component: LicensesListComponent,
})
