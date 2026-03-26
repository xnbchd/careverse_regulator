import { createFileRoute } from '@tanstack/react-router'
import { lazy } from 'react'
import { listProfessionalRecords } from '@/api/registryApi'

const ProfessionalsTable = lazy(() => import('@/components/affiliations/ProfessionalsTable'))

function ProfessionalsListPage() {
  const { data: professionals } = Route.useLoaderData()

  return (
    <div className="hq-page-wrap">
      <ProfessionalsTable professionals={professionals} />
    </div>
  )
}

export const Route = createFileRoute('/affiliations/professionals')({
  loader: () => listProfessionalRecords(),
  component: ProfessionalsListPage,
})
