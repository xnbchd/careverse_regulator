import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { listFacilityRecords } from '@/api/registryApi'

const FacilitiesTable = lazy(() => import('@/components/affiliations/FacilitiesTable'))

function FacilitiesListPage() {
  const { data: facilities } = Route.useLoaderData()

  return (
    <div className="hq-page-wrap">
      <FacilitiesTable facilities={facilities} />
    </div>
  )
}

export const Route = createFileRoute('/affiliations/facilities')({
  loader: () => listFacilityRecords(),
  component: FacilitiesListPage,
})
