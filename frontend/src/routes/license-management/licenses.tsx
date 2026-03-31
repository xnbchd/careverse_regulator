import { createFileRoute } from "@tanstack/react-router"
import { useAuthStore } from "@/stores/authStore"
import LicensesListView from "@/components/licensing/LicensesListView"

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
