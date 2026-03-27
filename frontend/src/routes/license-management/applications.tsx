import { createFileRoute } from "@tanstack/react-router"
import { lazy } from "react"
import { useAuthStore } from "@/stores/authStore"

const LicenseManagementView = lazy(() => import("@/components/licensing"))

function ApplicationsListComponent() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="hq-page-wrap">
      <LicenseManagementView company={user?.company} />
    </div>
  )
}

export const Route = createFileRoute("/license-management/applications")({
  component: ApplicationsListComponent,
})
