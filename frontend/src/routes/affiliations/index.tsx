import { createFileRoute } from '@tanstack/react-router'
import { AffiliationsDashboard } from '@/components/affiliations/AffiliationsDashboard'
import { getAffiliationDashboardStats } from '@/api/affiliationApi'

export const Route = createFileRoute('/affiliations/')({
  loader: () => getAffiliationDashboardStats(),
  component: AffiliationsDashboard,
})
