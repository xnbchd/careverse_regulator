import { createFileRoute } from "@tanstack/react-router"
import { listAffiliations } from "@/api/affiliationApi"
import AffiliationsListTable from "@/components/affiliations/AffiliationsListTable"

function AffiliationsListPage() {
  const affiliations = Route.useLoaderData()

  return (
    <div className="hq-page-wrap">
      <AffiliationsListTable affiliations={affiliations} />
    </div>
  )
}

export const Route = createFileRoute("/affiliations/list")({
  loader: async () => {
    const response = await listAffiliations(1, 1000)
    return response.data || []
  },
  component: AffiliationsListPage,
})
