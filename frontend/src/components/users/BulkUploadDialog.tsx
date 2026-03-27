import { useState, useRef } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import {
  AlertCircle,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react"
import { bulkCreateUsers } from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import { useNotificationStore } from "@/stores/notificationStore"
import type { BulkCreateResult, BulkUserRecord } from "@/types/user"

interface BulkUploadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

type Step = "upload" | "validate" | "result"

const CSV_TEMPLATE = `email,first_name,last_name,mobile_no,roles
user@example.com,John,Doe,+254700123456,"[""Regulator User""]"
admin@example.com,Jane,Smith,+254700654321,"[""Regulator Admin""]"
`

export default function BulkUploadDialog({ open, onOpenChange, onSuccess }: BulkUploadDialogProps) {
  const [step, setStep] = useState<Step>("upload")
  const [file, setFile] = useState<File | null>(null)
  const [validationResult, setValidationResult] = useState<BulkCreateResult | null>(null)
  const [finalResult, setFinalResult] = useState<BulkCreateResult | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const resetState = () => {
    setStep("upload")
    setFile(null)
    setValidationResult(null)
    setFinalResult(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleClose = () => {
    if (!submitting) {
      resetState()
      onOpenChange(false)
    }
  }

  const handleDownloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "user_upload_template.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      const ext = selected.name.split(".").pop()?.toLowerCase()
      if (!["csv", "xlsx", "xls"].includes(ext || "")) {
        setError("Please upload a CSV or Excel file.")
        return
      }
      setFile(selected)
      setError(null)
    }
  }

  const handleValidate = async () => {
    if (!file) return

    setSubmitting(true)
    setError(null)
    try {
      const result = await bulkCreateUsers(file, true)
      setValidationResult(result)
      setStep("validate")
    } catch (err: any) {
      setError(err?.message || "Failed to validate file.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleConfirmUpload = async () => {
    if (!file) return

    setSubmitting(true)
    setError(null)
    try {
      const result = await bulkCreateUsers(file, false)
      setFinalResult(result)
      setStep("result")

      showSuccess(`${result.created} user(s) created successfully`)
      addNotification({
        type: result.failed > 0 ? "warning" : "success",
        category: "bulk_action",
        title: "Bulk User Upload Complete",
        message: `${result.created} users created, ${result.failed} failed.`,
        actionUrl: "/users-roles",
        actionLabel: "View Users",
      })

      onSuccess()
    } catch (err: any) {
      setError(err?.message || "Failed to create users.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Bulk Upload Users</DialogTitle>
          <DialogDescription>
            {step === "upload" &&
              "Upload a CSV or Excel file to create multiple user accounts at once."}
            {step === "validate" && "Review validation results before creating users."}
            {step === "result" && "Upload complete. Review the results below."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Upload */}
        {step === "upload" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-3">
                Select a CSV or Excel file with user data
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File
              </Button>
              {file && (
                <p className="text-sm font-medium mt-3 text-foreground">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
              )}
            </div>

            <Button variant="link" className="px-0 text-sm" onClick={handleDownloadTemplate}>
              <Download className="h-4 w-4 mr-1.5" />
              Download CSV template
            </Button>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleValidate} disabled={!file || submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  "Validate File"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 2: Validation results */}
        {step === "validate" && validationResult && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Badge
                variant="outline"
                className="text-green-700 dark:text-green-400 border-green-500"
              >
                {validationResult.results.filter((r) => r.status === "would_create").length} will be
                created
              </Badge>
              <Badge variant="outline" className="text-red-700 dark:text-red-400 border-red-500">
                {validationResult.results.filter((r) => r.status === "would_fail").length} will fail
              </Badge>
            </div>

            <div className="max-h-60 overflow-y-auto border border-border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-2 font-medium">#</th>
                    <th className="text-left p-2 font-medium">Email</th>
                    <th className="text-left p-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {validationResult.results.map((record: BulkUserRecord) => (
                    <tr key={record.index} className="border-t border-border">
                      <td className="p-2 text-muted-foreground">{record.index + 1}</td>
                      <td className="p-2 font-mono text-xs">{record.email}</td>
                      <td className="p-2">
                        {record.status === "would_create" ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <CheckCircle className="h-3.5 w-3.5" /> Ready
                          </span>
                        ) : (
                          <span
                            className="flex items-center gap-1 text-red-600 dark:text-red-400"
                            title={record.error}
                          >
                            <XCircle className="h-3.5 w-3.5" /> {record.error || "Error"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setStep("upload")
                  setValidationResult(null)
                }}
              >
                Back
              </Button>
              <Button
                onClick={handleConfirmUpload}
                disabled={
                  submitting || validationResult.results.every((r) => r.status === "would_fail")
                }
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Users...
                  </>
                ) : (
                  `Create ${
                    validationResult.results.filter((r) => r.status === "would_create").length
                  } Users`
                )}
              </Button>
            </DialogFooter>
          </div>
        )}

        {/* Step 3: Final results */}
        {step === "result" && finalResult && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold">{finalResult.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {finalResult.created}
                </p>
                <p className="text-xs text-muted-foreground">Created</p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {finalResult.failed}
                </p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>

            {finalResult.results.some((r) => r.status === "failed") && (
              <div className="max-h-40 overflow-y-auto border border-border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 font-medium">Email</th>
                      <th className="text-left p-2 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {finalResult.results
                      .filter((r) => r.status === "failed")
                      .map((record) => (
                        <tr key={record.index} className="border-t border-border">
                          <td className="p-2 font-mono text-xs">{record.email}</td>
                          <td className="p-2 text-red-600 dark:text-red-400 text-xs">
                            {record.error}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            <DialogFooter>
              <Button onClick={handleClose}>Done</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
