import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Building2, UserRound } from "lucide-react"
import { useRegistryStore } from "@/stores/registryStore"
import { PageHeader } from "@/components/shared/PageHeader"
import { ModuleStatStrip } from "@/components/dashboard/ModuleStatStrip"

export function AffiliationsDashboard() {
  const [viewMode, setViewMode] = useState<"facilities" | "professionals">("facilities")
  const navigate = useNavigate()

  const { facilitiesPagination, facilitiesLoading, professionalsPagination, professionalsLoading } =
    useRegistryStore()

  const facilitiesTotal = facilitiesPagination?.count || 0
  const professionalsTotal = professionalsPagination?.count || 0

  const isLoading = facilitiesLoading || professionalsLoading

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

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Affiliations" }]}
        title="Affiliations"
        subtitle="Overview of health facility and professional registries"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "facilities" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("facilities")}
              className="flex items-center gap-2"
            >
              <Building2 className="h-3.5 w-3.5" />
              Facilities
            </Button>
            <Button
              variant={viewMode === "professionals" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("professionals")}
              className="flex items-center gap-2"
            >
              <UserRound className="h-3.5 w-3.5" />
              Professionals
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <ModuleStatStrip
        stats={viewMode === "facilities" ? facilityStats : professionalStats}
        loading={isLoading}
      />

      {/* Quick navigation — inline buttons, never full-width */}
      <div className="flex items-center gap-2">
        {viewMode === "facilities" ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/affiliations/facilities" })}
            className="flex items-center gap-2"
          >
            <Building2 className="h-3.5 w-3.5" />
            View All Facilities
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate({ to: "/affiliations/professionals" })}
            className="flex items-center gap-2"
          >
            <UserRound className="h-3.5 w-3.5" />
            View All Professionals
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => navigate({ to: "/affiliations/list" })}>
          All Affiliations
        </Button>
      </div>
    </div>
  )
}
