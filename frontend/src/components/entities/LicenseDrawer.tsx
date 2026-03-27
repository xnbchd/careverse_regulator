import { useState } from "react"
import type { License } from "@/types/license"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EntityLink } from "./EntityLink"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import {
  Award,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  ShieldCheck,
  Clock,
  AlertCircle,
  MessageSquare,
} from "lucide-react"
import dayjs from "dayjs"
import SubmitAppealModal from "../licensing/SubmitAppealModal"
import { LicenseCommentsSection } from "../licensing/LicenseCommentsSection"

interface LicenseDrawerProps {
  license: License | null
  loading: boolean
}

export function LicenseDrawer({ license, loading }: LicenseDrawerProps) {
  const [showAppealModal, setShowAppealModal] = useState(false)

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-muted rounded-lg" />
            <div className="flex-1 space-y-3">
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded" />
            <div className="h-4 bg-muted rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!license) {
    return (
      <div>
        <p className="text-muted-foreground text-start">License not found</p>
      </div>
    )
  }

  // Calculate days until expiry
  const expiryDate = dayjs(license.dateOfExpiry, "DD/MM/YYYY")
  const today = dayjs()
  const daysUntilExpiry = expiryDate.diff(today, "day")
  const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30
  const isExpired = daysUntilExpiry < 0

  // Status badge variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Active":
        return "default"
      case "Expired":
      case "Suspended":
      case "Denied":
        return "destructive"
      case "Pending":
      case "In Review":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Icon */}
      <div className="flex items-start gap-4 pb-4">
        <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-green-500/5 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-green-500/10">
          <Award className="w-12 h-12 text-green-600/70" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground mb-1 text-start font-mono">
            {license.licenseNumber}
          </h2>
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {license.registrationNumber}
            </span>
            {license.facilityName && (
              <>
                <span>•</span>
                <span className="font-medium">{license.facilityName}</span>
              </>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant={getStatusVariant(license.status)} className="font-medium">
              {license.status}
            </Badge>
            {license.licenseType && (
              <Badge variant="secondary" className="font-medium">
                {license.licenseType}
              </Badge>
            )}
            {isExpiringSoon && !isExpired && (
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Expiring Soon
              </Badge>
            )}
            {isExpired && license.status !== "Expired" && (
              <Badge variant="outline" className="border-red-500 text-red-700">
                Past Expiry
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Workflow Actions */}
      <div className="flex flex-wrap gap-2">
        {(license.status === "Denied" || license.status === "Suspended") && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAppealModal(true)}
            className="flex items-center gap-2"
          >
            <MessageSquare className="w-4 h-4" />
            Submit Appeal
          </Button>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="overflow-x-auto -mx-6 px-6 mb-4">
          <TabsList className="inline-flex w-auto min-w-full">
            <TabsTrigger value="overview" className="flex-1 min-w-fit">
              Overview
            </TabsTrigger>
            <TabsTrigger value="facility" className="flex-1 min-w-fit">
              Facility
            </TabsTrigger>
            <TabsTrigger value="details" className="flex-1 min-w-fit">
              Details
            </TabsTrigger>
            <TabsTrigger value="comments" className="flex-1 min-w-fit">
              Comments
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          {/* Expiry Alert */}
          {(isExpiringSoon || isExpired) && (
            <div
              className={`p-4 rounded-lg border ${
                isExpired
                  ? "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                  : "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    isExpired
                      ? "text-red-600 dark:text-red-400"
                      : "text-orange-600 dark:text-orange-400"
                  }`}
                />
                <div className="flex-1">
                  <h3
                    className={`text-sm font-semibold mb-1 ${
                      isExpired
                        ? "text-red-900 dark:text-red-300"
                        : "text-orange-900 dark:text-orange-300"
                    }`}
                  >
                    {isExpired ? "License Expired" : "License Expiring Soon"}
                  </h3>
                  <p
                    className={`text-sm ${
                      isExpired
                        ? "text-red-700 dark:text-red-400"
                        : "text-orange-700 dark:text-orange-400"
                    }`}
                  >
                    {isExpired
                      ? `This license expired ${Math.abs(daysUntilExpiry)} days ago`
                      : `This license will expire in ${daysUntilExpiry} days`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* License Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground text-start">Date of Issuance</p>
                <p className="text-sm text-muted-foreground text-start">{license.dateOfIssuance}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground text-start">Date of Expiry</p>
                <p className="text-sm text-muted-foreground text-start">
                  {license.dateOfExpiry}
                  {!isExpired && daysUntilExpiry >= 0 && (
                    <span className="text-xs ml-1">({daysUntilExpiry} days)</span>
                  )}
                </p>
              </div>
            </div>

            {license.paymentStatus && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Payment Status</p>
                  <p className="text-sm text-muted-foreground text-start">
                    {license.paymentStatus}
                  </p>
                </div>
              </div>
            )}

            {license.category && (
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground text-start">Category</p>
                  <p className="text-sm text-muted-foreground text-start">{license.category}</p>
                </div>
              </div>
            )}
          </div>

          {/* License Type & Owner/Name */}
          {(license.licenseType || license.owner || license.facilityName) && (
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-800">
              <div className="space-y-3">
                {license.licenseType && (
                  <div>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 text-start">
                      License Type
                    </p>
                    <p className="text-sm text-foreground text-start">{license.licenseType}</p>
                  </div>
                )}
                {(license.facilityName || license.owner) && (
                  <div>
                    <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1 text-start">
                      {license.category === "Health Professional"
                        ? "Professional Name"
                        : "Facility Name"}
                    </p>
                    <p className="text-sm text-foreground text-start">
                      {license.facilityName || license.owner}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="facility" className="space-y-3 mt-0">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <h3 className="text-sm font-semibold text-foreground text-start">
              {license.category === "Health Professional"
                ? "Professional Details"
                : "Facility Details"}
            </h3>
          </div>

          <div className="p-4 bg-muted/50 rounded-lg border border-border">
            <div className="space-y-3">
              {license.facilityName && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 text-start">
                    {license.category === "Health Professional"
                      ? "Professional Name"
                      : "Facility Name"}
                  </p>
                  <EntityLink type="facility" id={license.registrationNumber}>
                    <span className="text-sm font-medium">{license.facilityName}</span>
                  </EntityLink>
                </div>
              )}

              {license.facilityCode && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 text-start">
                    {license.category === "Health Professional"
                      ? "Professional Code"
                      : "Facility Code"}
                  </p>
                  <p className="text-sm text-foreground text-start font-mono">
                    {license.facilityCode}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1 text-start">
                  Registration Number
                </p>
                <EntityLink type="facility" id={license.registrationNumber}>
                  <span className="text-sm font-mono">{license.registrationNumber}</span>
                </EntityLink>
              </div>

              {license.facilityType && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 text-start">
                    {license.category === "Health Professional"
                      ? "Professional Type"
                      : "Facility Type"}
                  </p>
                  <p className="text-sm text-foreground text-start">{license.facilityType}</p>
                </div>
              )}

              {license.owner && (
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1 text-start">Owner</p>
                  <p className="text-sm text-foreground text-start">{license.owner}</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-3 mt-0">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">License Number</TableCell>
                  <TableCell className="text-start font-mono">{license.licenseNumber}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">Status</TableCell>
                  <TableCell className="text-start">
                    <Badge variant={getStatusVariant(license.status)}>{license.status}</Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">Issued On</TableCell>
                  <TableCell className="text-start">{license.dateOfIssuance}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">Expires On</TableCell>
                  <TableCell className="text-start">{license.dateOfExpiry}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">Payment Status</TableCell>
                  <TableCell className="text-start">{license.paymentStatus}</TableCell>
                </TableRow>
                {license.category && (
                  <TableRow>
                    <TableCell className="font-medium text-start w-1/3">Category</TableCell>
                    <TableCell className="text-start">{license.category}</TableCell>
                  </TableRow>
                )}
                {license.licenseType && (
                  <TableRow>
                    <TableCell className="font-medium text-start w-1/3">License Type</TableCell>
                    <TableCell className="text-start">{license.licenseType}</TableCell>
                  </TableRow>
                )}
                {license.facilityType && (
                  <TableRow>
                    <TableCell className="font-medium text-start w-1/3">Facility Type</TableCell>
                    <TableCell className="text-start">{license.facilityType}</TableCell>
                  </TableRow>
                )}
                {license.owner && (
                  <TableRow>
                    <TableCell className="font-medium text-start w-1/3">Owner</TableCell>
                    <TableCell className="text-start">{license.owner}</TableCell>
                  </TableRow>
                )}
                <TableRow>
                  <TableCell className="font-medium text-start w-1/3">Archived</TableCell>
                  <TableCell className="text-start">{license.isArchived ? "Yes" : "No"}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="comments" className="space-y-3 mt-0">
          <LicenseCommentsSection licenseNumber={license.licenseNumber} />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <SubmitAppealModal
        isOpen={showAppealModal}
        onClose={() => setShowAppealModal(false)}
        licenseNumber={license.licenseNumber}
        registrationNumber={license.registrationNumber}
        facilityCode={license.facilityCode}
        onSuccess={() => {
          // Optionally refresh license data or show success message
          console.log("Appeal submitted successfully")
        }}
      />
    </div>
  )
}
