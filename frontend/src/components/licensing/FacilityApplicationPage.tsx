import { useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import StatusBadge from "./StatusBadge"
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  MessageSquare,
  User,
  Bed,
  Clock,
} from "lucide-react"
import { updateFacilityApplicationStatus } from "@/api/licensingApi"
import { useLicensingStore } from "@/stores/licensingStore"
import { showSuccess, showError } from "@/utils/toast"
import type { LicenseApplication } from "@/types/license"
import { PageHeader } from "@/components/shared/PageHeader"

interface FacilityApplicationPageProps {
  application: LicenseApplication
}

export default function FacilityApplicationPage({
  application: initialApp,
}: FacilityApplicationPageProps) {
  const [application, setApplication] = useState(initialApp)
  const [remarks, setRemarks] = useState("")
  const [submitting, setSubmitting] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<
    "Issued" | "Denied" | "Info Requested" | null
  >(null)
  const decisionRef = useRef<HTMLDivElement>(null)

  const isPending =
    application.applicationStatus === "Pending" ||
    application.applicationStatus === "Info Requested"

  const handleSelectAction = (action: "Issued" | "Denied" | "Info Requested") => {
    setSelectedAction(action)
    setRemarks("")
    setTimeout(
      () => decisionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }),
      100
    )
  }

  const handleSubmitAction = async () => {
    if (!selectedAction || !remarks.trim()) return

    const status = selectedAction === "Info Requested" ? "Denied" : selectedAction
    setSubmitting(selectedAction)
    try {
      await updateFacilityApplicationStatus(
        application.licenseApplicationId,
        status as "Issued" | "Denied",
        remarks
      )
      showSuccess(
        `Application ${
          selectedAction === "Issued"
            ? "issued"
            : selectedAction === "Denied"
              ? "denied"
              : "info requested"
        } successfully`
      )
      useLicensingStore.getState().fetchApplications()
      setApplication({
        ...application,
        applicationStatus: selectedAction === "Info Requested" ? "Info Requested" : (status as any),
      })
      setRemarks("")
      setSelectedAction(null)
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update application")
    } finally {
      setSubmitting(null)
    }
  }

  const actionButtonLabel =
    selectedAction === "Issued"
      ? "Issue License"
      : selectedAction === "Denied"
        ? "Deny Application"
        : "Request Info"

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        breadcrumbs={[
          { label: "License Management", href: "/license-management" },
          { label: "Applications", href: "/license-management/applications" },
          { label: application.facilityName },
        ]}
        title="Facility License Application"
        subtitle={`${application.facilityName} · ${application.registrationNumber}`}
        badge={<StatusBadge status={application.applicationStatus} />}
        actions={
          isPending ? (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={selectedAction === "Issued" ? "default" : "outline"}
                className={
                  selectedAction !== "Issued"
                    ? "text-green-600 border-green-300 hover:bg-green-50 dark:hover:bg-green-950"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }
                onClick={() => handleSelectAction("Issued")}
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Issue
              </Button>
              <Button
                size="sm"
                variant={selectedAction === "Denied" ? "destructive" : "outline"}
                className={
                  selectedAction !== "Denied"
                    ? "text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950"
                    : ""
                }
                onClick={() => handleSelectAction("Denied")}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Deny
              </Button>
              <Button
                size="sm"
                variant={selectedAction === "Info Requested" ? "default" : "outline"}
                className={
                  selectedAction !== "Info Requested"
                    ? "text-blue-600 border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }
                onClick={() => handleSelectAction("Info Requested")}
              >
                <AlertCircle className="h-4 w-4 mr-1.5" />
                Request Info
              </Button>
            </div>
          ) : undefined
        }
      />

      {/* Data cards — 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Facility Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="h-4 w-4" />
              Facility Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadOnlyField label="Facility Name" value={application.facilityName} />
              <ReadOnlyField label="Facility Code" value={application.facilityCode} />
              <ReadOnlyField label="Facility FID" value={application.hieFacilityId} />
              <ReadOnlyField
                label="Registration Number"
                value={application.registrationNumber}
                mono
              />
              <ReadOnlyField label="Facility Owner" value={application.owner} />
              <ReadOnlyField label="Facility Type" value={application.facilityType} />
              <ReadOnlyField label="Facility Category" value={application.facilityCategory} />
              <ReadOnlyField label="Facility Level" value={application.kephLevel} />
              <ReadOnlyField label="Operational Status" value={application.licenseStatus} />
            </div>
          </CardContent>
        </Card>

        {/* Location & Contact */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              Location & Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ReadOnlyField label="County" value={application.county} icon={MapPin} />
              <ReadOnlyField label="Sub County" value={application.subCounty} />
              <ReadOnlyField label="Ward" value={application.ward} />
              <ReadOnlyField label="Constituency" value={application.constituency} />
              <ReadOnlyField
                label="Phone Number"
                value={application.telephoneNumber}
                icon={Phone}
              />
              <ReadOnlyField label="Email Address" value={application.officialEmail} icon={Mail} />
              <ReadOnlyField label="Physical Address" value={application.physicalAddress} />
              <ReadOnlyField label="Industry" value={application.industry} />
              <ReadOnlyField
                label="Number of Beds"
                value={application.numberOfBeds?.toString()}
                icon={Bed}
              />
              <ReadOnlyField
                label="Open Whole Day"
                value={application.openWholeDay ? "Yes" : "No"}
                icon={Clock}
              />
              <ReadOnlyField
                label="Open Public Holiday"
                value={application.openPublicHoliday ? "Yes" : "No"}
              />
              <ReadOnlyField
                label="Open Weekends"
                value={application.openWeekends ? "Yes" : "No"}
              />
              <ReadOnlyField
                label="Open Late Night"
                value={application.openLateNight ? "Yes" : "No"}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Application Details — full width */}
      <Card className="mt-5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4" />
            Application Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <ReadOnlyField label="License Type" value={application.licenseTypeName} />
            <ReadOnlyField
              label="Application Date"
              value={application.applicationDate}
              icon={Calendar}
            />
            <ReadOnlyField
              label="Fee Paid"
              value={
                application.licenseFee
                  ? `KES ${application.licenseFee.toLocaleString()}`
                  : undefined
              }
              icon={DollarSign}
            />
            <ReadOnlyField label="Application Type" value={application.applicationType} />
          </div>

          {application.complianceDocuments && application.complianceDocuments.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Accompanying Documentation</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-1.5">
                {application.complianceDocuments.map((doc: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 p-2.5 bg-muted/50 rounded-lg border border-border"
                  >
                    <div className="rounded-lg bg-red-100 dark:bg-red-900/30 p-1.5">
                      <FileText className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="text-sm flex-1 truncate">
                      {doc.document_type || doc.name || `Document ${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Remarks / Comment Threads */}
      {application.remarks && (
        <Card className="mt-5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4" />
              Comment Threads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg border border-border">
              <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-foreground whitespace-pre-line">{application.remarks}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Decision section — appears when an action button is clicked */}
      {isPending && selectedAction && (
        <Card
          ref={decisionRef}
          className={`mt-5 ${
            selectedAction === "Denied"
              ? "border-destructive/50"
              : selectedAction === "Info Requested"
                ? "border-blue-500/50"
                : "border-green-500/50"
          }`}
        >
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              {selectedAction === "Info Requested" ? (
                <>
                  <AlertCircle className="h-4 w-4 text-blue-600" />
                  <span>Request Additional Information</span>
                </>
              ) : selectedAction === "Denied" ? (
                <>
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Deny Application</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Issue License</span>
                </>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground">
              {selectedAction === "Info Requested"
                ? "Describe the specific information needed before this application can proceed"
                : selectedAction === "Denied"
                  ? "Provide the reason for denying this application"
                  : "Add any comments for this approval (required)"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              placeholder="Enter your remarks..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={4}
              autoFocus
            />
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedAction(null)
                  setRemarks("")
                }}
              >
                Cancel
              </Button>
              <Button
                variant={selectedAction === "Denied" ? "destructive" : "default"}
                className={
                  selectedAction === "Issued"
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : selectedAction === "Info Requested"
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : ""
                }
                disabled={!remarks.trim() || !!submitting}
                onClick={handleSubmitAction}
              >
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                {actionButtonLabel}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
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
        {value || "Null"}
      </div>
    </div>
  )
}
