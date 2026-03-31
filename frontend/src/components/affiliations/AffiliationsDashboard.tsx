import { useNavigate } from "@tanstack/react-router"
import { Building2, UserRound, List } from "lucide-react"
import { useRegistryStore } from "@/stores/registryStore"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleStatStrip } from "@/components/dashboard/ModuleStatStrip"
import { QuickActions } from "@/components/dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AffiliationsDashboard() {
  const navigate = useNavigate()

  const { facilitiesPagination, facilitiesLoading, professionalsPagination, professionalsLoading } =
    useRegistryStore()

  const facilitiesTotal = facilitiesPagination?.total_count || 0
  const professionalsTotal = professionalsPagination?.total_count || 0

  const facilityStats = [
    { label: "Total Facilities", value: facilitiesTotal },
    { label: "Active Facilities", value: facilitiesTotal, color: "primary" as const },
    { label: "Pending Review", value: 0, color: "amber" as const },
    { label: "Inactive", value: 0 },
  ]

  const professionalStats = [
    { label: "Total Professionals", value: professionalsTotal },
    { label: "Active Professionals", value: professionalsTotal, color: "primary" as const },
    { label: "Pending Review", value: 0, color: "amber" as const },
    { label: "Inactive", value: 0 },
  ]

  const facilityActions = [
    {
      label: "View All Facilities",
      onClick: () => navigate({ to: "/affiliations/facilities" }),
      variant: "default" as const,
      icon: Building2,
    },
    {
      label: "All Affiliations",
      onClick: () => navigate({ to: "/affiliations/list" }),
      variant: "outline" as const,
      icon: List,
    },
  ]

  const professionalActions = [
    {
      label: "View All Professionals",
      onClick: () => navigate({ to: "/affiliations/professionals" }),
      variant: "default" as const,
      icon: UserRound,
    },
    {
      label: "All Affiliations",
      onClick: () => navigate({ to: "/affiliations/list" }),
      variant: "outline" as const,
      icon: List,
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Affiliations" }]}
        title="Affiliations"
        subtitle="Overview of health facility and professional registries"
      />

      <Tabs defaultValue="facilities" className="w-full">
        <TabsList>
          <TabsTrigger value="facilities">
            <Building2 className="h-4 w-4 mr-1.5" />
            Facilities
          </TabsTrigger>
          <TabsTrigger value="professionals">
            <UserRound className="h-4 w-4 mr-1.5" />
            Professionals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="facilities" className="space-y-4 mt-4">
          <QuickActions actions={facilityActions} title="Quick Actions" />
          <ModuleStatStrip stats={facilityStats} loading={facilitiesLoading} />
        </TabsContent>

        <TabsContent value="professionals" className="space-y-4 mt-4">
          <QuickActions actions={professionalActions} title="Quick Actions" />
          <ModuleStatStrip stats={professionalStats} loading={professionalsLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
