import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { EntityLink } from "@/components/entities"
import { Building2, Calendar, FileText, DollarSign, User, Award, MessageSquare } from "lucide-react"
import type { LicenseApplication } from "@/types/license"

interface ApplicationDetailModalProps {
  isOpen: boolean
  onClose: () => void
  application: LicenseApplication | null
  loading?: boolean
}

export default function ApplicationDetailModal({
  isOpen,
  onClose,
  application,
  loading,
}: ApplicationDetailModalProps) {
  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-5/6" />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (!application) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <p className="text-muted-foreground text-center py-8">Application not found</p>
        </DialogContent>
      </Dialog>
    )
  }

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Issued":
        return "default"
      case "Pending":
        return "secondary"
      case "Denied":
        return "destructive"
      case "Info Requested":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-mono">
                {application.licenseApplicationId}
              </DialogTitle>
              <DialogDescription className="mt-1">License Application Details</DialogDescription>
            </div>
            <Badge
              variant={getStatusVariant(application.applicationStatus)}
              className="flex-shrink-0"
            >
              {application.applicationStatus}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Facility Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Facility Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Facility Name</p>
                  <EntityLink type="facility" id={application.registrationNumber}>
                    <span className="text-sm text-muted-foreground">
                      {application.facilityName}
                    </span>
                  </EntityLink>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Registration #</p>
                  <p className="text-sm text-muted-foreground font-mono">
                    {application.registrationNumber}
                  </p>
                </div>
              </div>

              {application.facilityCode && (
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">Facility Code</p>
                    <p className="text-sm text-muted-foreground font-mono">
                      {application.facilityCode}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Facility Type</p>
                  <p className="text-sm text-muted-foreground">{application.facilityType}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <User className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Owner</p>
                  <p className="text-sm text-muted-foreground">{application.owner}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Category</p>
                  <p className="text-sm text-muted-foreground">{application.facilityCategory}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Application Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Award className="w-4 h-4" />
              Application Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Badge variant="outline" className="mt-0.5 capitalize flex-shrink-0">
                  {application.applicationType}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Application Type</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Award className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">License Type</p>
                  <p className="text-sm text-muted-foreground">{application.licenseTypeName}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <Calendar className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Application Date</p>
                  <p className="text-sm text-muted-foreground">{application.applicationDate}</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">License Fee</p>
                  <p className="text-sm text-muted-foreground">
                    KES {application.licenseFee.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg col-span-full">
                <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Regulatory Body</p>
                  <p className="text-sm text-muted-foreground">{application.regulatoryBody}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {application.remarks && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Remarks
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <p className="text-sm text-foreground whitespace-pre-line">
                    {application.remarks}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Compliance Documents */}
          {application.complianceDocuments && application.complianceDocuments.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Compliance Documents
                </h3>
                <div className="space-y-2">
                  {application.complianceDocuments.map((doc: any, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-muted/50 rounded-lg border border-border flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {doc.name || `Document ${index + 1}`}
                        </span>
                      </div>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <Separator className="mt-6" />

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {application.applicationStatus === "Pending" && (
            <>
              <Button variant="destructive">Request Info</Button>
              <Button variant="default">Approve</Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
