import { useState } from "react"
import { useNavigate } from "@tanstack/react-router"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, UserRound, ArrowRight } from "lucide-react"
import { useRegistryStore } from "@/stores/registryStore"
import { MetricCard } from "@/components/dashboard"

export function AffiliationsDashboard() {
  const [viewMode, setViewMode] = useState<"facilities" | "professionals">("facilities")
  const navigate = useNavigate()

  const { facilitiesPagination, facilitiesLoading, professionalsPagination, professionalsLoading } =
    useRegistryStore()

  // Calculate active counts from the data
  // Note: This is a simplified approach - ideally backend should provide these metrics
  const facilitiesTotal = facilitiesPagination?.count || 0
  const professionalsTotal = professionalsPagination?.count || 0

  const handleViewAllFacilities = () => {
    navigate({ to: "/affiliations/facilities" })
  }

  const handleViewAllProfessionals = () => {
    navigate({ to: "/affiliations/professionals" })
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Affiliations Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of health facility and professional registries
        </p>
      </div>

      {/* Toggle View */}
      <div className="flex gap-2">
        <Button
          variant={viewMode === "facilities" ? "default" : "outline"}
          onClick={() => setViewMode("facilities")}
          className="flex items-center gap-2"
        >
          <Building2 className="h-4 w-4" />
          Facilities
        </Button>
        <Button
          variant={viewMode === "professionals" ? "default" : "outline"}
          onClick={() => setViewMode("professionals")}
          className="flex items-center gap-2"
        >
          <UserRound className="h-4 w-4" />
          Professionals
        </Button>
      </div>

      {/* Stats Section */}
      {viewMode === "facilities" ? (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Facilities"
              value={facilitiesTotal}
              icon={Building2}
              variant="neutral"
            />
            <MetricCard
              title="Active Facilities"
              value={facilitiesTotal}
              icon={Building2}
              variant="success"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleViewAllFacilities}
                size="sm"
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  View All Facilities
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Professionals"
              value={professionalsTotal}
              icon={UserRound}
              variant="neutral"
            />
            <MetricCard
              title="Active Professionals"
              value={professionalsTotal}
              icon={UserRound}
              variant="success"
            />
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleViewAllProfessionals}
                size="sm"
                className="w-full flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  View All Professionals
                </span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
