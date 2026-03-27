import { createFileRoute } from "@tanstack/react-router"
import FacilityApplicationPage from "@/components/licensing/FacilityApplicationPage"
import { getFacilityApplication } from "@/api/licensingApi"
import type { LicenseApplication } from "@/types/license"

function FacilityApplicationDetailRoute() {
  const application = Route.useLoaderData()

  return (
    <div className="hq-page-wrap">
      <FacilityApplicationPage application={application} />
    </div>
  )
}

export const Route = createFileRoute("/license-management/facility-application/$applicationId")({
  loader: async ({ params }): Promise<LicenseApplication> => {
    return getFacilityApplication(params.applicationId)
  },
  component: FacilityApplicationDetailRoute,
})
