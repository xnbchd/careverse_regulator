import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useAffiliationStore } from "@/stores/affiliationStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatusBadge from "@/components/affiliations/StatusBadge"
import { ArrowLeft, Building2, User, Briefcase, Calendar } from "lucide-react"
import type { Affiliation } from "@/types/affiliation"

function AffiliationDetailPage() {
  const navigate = useNavigate()
  const affiliation = Route.useLoaderData() as Affiliation | null

  if (!affiliation) return null

  return (
    <div className="hq-page-wrap">
      <div className="max-w-6xl mx-auto">
        {/* Top bar */}
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/affiliations" })}
            className="-ml-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Affiliations
          </Button>
        </div>

        {/* Page heading */}
        <div className="mb-5">
          <h1 className="text-2xl font-semibold text-foreground">Professional Affiliation</h1>
          <p className="text-lg font-medium text-foreground mt-1">
            {affiliation.healthProfessional.fullName} — {affiliation.healthFacility.facilityName}
          </p>
          <div className="flex items-center gap-4 mt-2">
            <StatusBadge status={affiliation.affiliationStatus} />
            <span className="text-xs text-muted-foreground capitalize">
              {affiliation.employmentType}
            </span>
            <span className="text-xs text-muted-foreground">Started: {affiliation.startDate}</span>
          </div>
        </div>

        {/* Data cards — 2 columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Health Professional */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Health Professional
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ReadOnlyField label="Full Name" value={affiliation.healthProfessional.fullName} />
                <ReadOnlyField
                  label="Registration Number"
                  value={affiliation.healthProfessional.registrationNumber}
                  mono
                />
                {affiliation.healthProfessional.professionalCadre && (
                  <ReadOnlyField
                    label="Professional Cadre"
                    value={affiliation.healthProfessional.professionalCadre}
                  />
                )}
                {affiliation.healthProfessional.specialty && (
                  <ReadOnlyField
                    label="Specialty"
                    value={affiliation.healthProfessional.specialty}
                  />
                )}
                {affiliation.healthProfessional.typeOfPractice && (
                  <ReadOnlyField
                    label="Type of Practice"
                    value={affiliation.healthProfessional.typeOfPractice}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Health Facility */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-4 w-4" />
                Health Facility
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ReadOnlyField
                  label="Facility Name"
                  value={affiliation.healthFacility.facilityName}
                />
                <ReadOnlyField
                  label="Registration Number"
                  value={affiliation.healthFacility.registrationNumber}
                  mono
                />
                {affiliation.healthFacility.facilityCode && (
                  <ReadOnlyField
                    label="Facility Code"
                    value={affiliation.healthFacility.facilityCode}
                  />
                )}
                {affiliation.healthFacility.facilityType && (
                  <ReadOnlyField
                    label="Facility Type"
                    value={affiliation.healthFacility.facilityType}
                  />
                )}
                {affiliation.healthFacility.kephLevel && (
                  <ReadOnlyField label="KEPH Level" value={affiliation.healthFacility.kephLevel} />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affiliation Information — full width */}
        <Card className="mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4" />
              Affiliation Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <ReadOnlyField label="Role" value={affiliation.role} />
              <ReadOnlyField label="Employment Type" value={affiliation.employmentType} />
              <ReadOnlyField label="Start Date" value={affiliation.startDate} icon={Calendar} />
              {affiliation.endDate && (
                <ReadOnlyField label="End Date" value={affiliation.endDate} icon={Calendar} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ReadOnlyField({
  label,
  value,
  mono,
  icon: Icon,
}: {
  label: string
  value?: string | null
  mono?: boolean
  icon?: React.ComponentType<{ className?: string }>
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div
        className={`mt-1 px-3 py-2 bg-muted/50 rounded-md border border-border text-sm ${
          mono ? "font-mono" : ""
        } text-foreground flex items-center gap-2`}
      >
        {Icon && <Icon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
        {value || "—"}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/affiliations/$affiliationId")({
  loader: async ({ params }) => useAffiliationStore.getState().getAffiliation(params.affiliationId),
  component: AffiliationDetailPage,
})
