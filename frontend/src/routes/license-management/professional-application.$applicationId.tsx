import { createFileRoute } from "@tanstack/react-router"
import ProfessionalApplicationPage from "@/components/licensing/ProfessionalApplicationPage"
import { getProfessionalApplication } from "@/api/licensingApi"
import type { ProfessionalLicenseApplication } from "@/types/license"

function ProfessionalApplicationDetailRoute() {
  const application = Route.useLoaderData()

  return (
    <div className="hq-page-wrap">
      <ProfessionalApplicationPage application={application} />
    </div>
  )
}

export const Route = createFileRoute("/license-management/professional-application/$applicationId")(
  {
    loader: async ({ params }): Promise<ProfessionalLicenseApplication> => {
      return getProfessionalApplication(params.applicationId)
    },
    component: ProfessionalApplicationDetailRoute,
  }
)
