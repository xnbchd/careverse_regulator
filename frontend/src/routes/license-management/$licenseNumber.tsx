import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { useLicensingStore } from "@/stores/licensingStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import StatusBadge from "@/components/licensing/StatusBadge"
import {
  ArrowLeft,
  FileText,
  Building2,
  Calendar,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Clock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import dayjs from "dayjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { showSuccess, showError } from "@/utils/toast"
import type { License, LicenseAction } from "@/types/license"

function LicenseDetailPage() {
  const { licenseNumber } = Route.useParams()
  const navigate = useNavigate()
  const { getLicense, updateLicense } = useLicensingStore()

  const loaderData = Route.useLoaderData()
  const [license, setLicense] = useState<License | null>(loaderData)
  const [actionLoading, setActionLoading] = useState(false)

  const handleBack = () => {
    navigate({ to: "/license-management" })
  }

  const handleAction = async (action: LicenseAction, actionName: string) => {
    if (!license) return

    setActionLoading(true)
    try {
      await updateLicense(license.licenseNumber, action)
      showSuccess(`License ${actionName.toLowerCase()} successfully`)
      const updated = await getLicense(licenseNumber)
      setLicense(updated)
    } catch (err) {
      showError(
        err instanceof Error ? err.message : `Failed to ${actionName.toLowerCase()} license`
      )
    } finally {
      setActionLoading(false)
    }
  }

  const canPerformActions = license && ["Pending", "In Review"].includes(license.status)

  return (
    <div className="hq-page-wrap">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            {license && (
              <>
                <div className="h-6 w-px bg-border" />
                <h2 className="text-lg font-semibold font-mono text-foreground">
                  {license.licenseNumber}
                </h2>
                <StatusBadge status={license.status} className="text-sm" />
              </>
            )}
          </div>
          {canPerformActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={actionLoading}>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleAction("APPROVE", "Approved")}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("DENY", "Denied")}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Deny
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleAction("REVIEW", "Under Review")}>
                  <Eye className="h-4 w-4 mr-2" />
                  Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("REQUEST_INFO", "Info Requested")}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Request Info
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleAction("SUSPEND", "Suspended")}
                  className="text-orange-600"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Suspend
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("SET_EXPIRED", "Expired")}
                  className="text-muted-foreground"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Set Expired
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {license && (
          <div className="space-y-6">
            {/* License Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  License Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      License Number
                    </label>
                    <p className="mt-1 text-base font-mono">{license.licenseNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Registration Number
                    </label>
                    <p className="mt-1 text-base font-mono">{license.registrationNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      License Type
                    </label>
                    <p className="mt-1 text-base">{license.licenseType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="mt-1 text-base">{license.category}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facility Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Facility Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Owner</label>
                    <p className="mt-1 text-base">{license.owner}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Facility Type
                    </label>
                    <p className="mt-1 text-base">{license.facilityType}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dates and Payment */}
            {(() => {
              const expiryDate = dayjs(license.dateOfExpiry, "DD/MM/YYYY")
              const daysToExpiry = expiryDate.diff(dayjs(), "day")
              const isExpired = daysToExpiry < 0
              const isExpiringSoon = daysToExpiry >= 0 && daysToExpiry <= 30

              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Validity and Payment
                      </CardTitle>
                      {license.dateOfExpiry && (
                        <Badge
                          variant={
                            isExpired ? "destructive" : isExpiringSoon ? "secondary" : "outline"
                          }
                          className={`flex items-center gap-1.5 ${
                            isExpired
                              ? ""
                              : isExpiringSoon
                              ? "border-orange-500 text-orange-700 dark:text-orange-400"
                              : "text-green-700 dark:text-green-400 border-green-500"
                          }`}
                        >
                          <Clock className="h-3.5 w-3.5" />
                          {isExpired
                            ? `Expired ${Math.abs(daysToExpiry)} days ago`
                            : `${daysToExpiry} days to expiry`}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Date of Issuance
                        </label>
                        <p className="mt-1 text-base">{license.dateOfIssuance}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Date of Expiry
                        </label>
                        <p className="mt-1 text-base">{license.dateOfExpiry}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">
                          Payment Status
                        </label>
                        <p className="mt-1 text-base flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{license.paymentStatus}</span>
                        </p>
                      </div>
                      {license.isArchived && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">
                            Archived
                          </label>
                          <p className="mt-1 text-base text-orange-600">Yes</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

export const Route = createFileRoute("/license-management/$licenseNumber")({
  loader: async ({ params }) => useLicensingStore.getState().getLicense(params.licenseNumber),
  component: LicenseDetailPage,
})
