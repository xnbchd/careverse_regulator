import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Loader2 } from "lucide-react"
import { createLicenseAppeal } from "@/api/licensingApi"
import type { CreateLicenseAppealPayload } from "@/types/license"

interface SubmitAppealModalProps {
  isOpen: boolean
  onClose: () => void
  licenseNumber: string
  registrationNumber: string
  facilityCode?: string
  onSuccess?: () => void
}

export default function SubmitAppealModal({
  isOpen,
  onClose,
  licenseNumber,
  registrationNumber,
  facilityCode,
  onSuccess,
}: SubmitAppealModalProps) {
  const [reason, setReason] = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reason.trim()) {
      setError("Appeal reason is required")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const payload: CreateLicenseAppealPayload = {
        license_number: licenseNumber,
        registration_number: registrationNumber,
        facility_code: facilityCode,
        appeal_info: {
          reason_for_appeal: reason.trim(),
          appeal_description: description.trim() || undefined,
        },
      }

      await createLicenseAppeal(payload)

      // Success - reset form and close
      setReason("")
      setDescription("")
      onSuccess?.()
      onClose()
    } catch (err: any) {
      console.error("Failed to submit appeal:", err)
      setError(err.message || "Failed to submit appeal. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!submitting) {
      setReason("")
      setDescription("")
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Submit License Appeal</DialogTitle>
          <DialogDescription>
            Appeal the decision for license{" "}
            <span className="font-mono font-semibold">{licenseNumber}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">License Number</Label>
            <Input
              id="licenseNumber"
              value={licenseNumber}
              disabled
              className="font-mono bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              value={registrationNumber}
              disabled
              className="font-mono bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason" className="required">
              Reason for Appeal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Incorrect classification, procedural error"
              maxLength={200}
              disabled={submitting}
              required
            />
            <p className="text-xs text-muted-foreground">{reason.length}/200 characters</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed explanation of your appeal..."
              rows={5}
              maxLength={1000}
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">{description.length}/1000 characters</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <FileText className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">What happens next?</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Your appeal will be reviewed by the regulatory team</li>
                  <li>You'll receive a notification once reviewed</li>
                  <li>Processing typically takes 5-10 business days</li>
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !reason.trim()}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Appeal"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
