import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BulkActionConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  selectedCount: number
  actionLabel: string
  requiresReason?: boolean
  onConfirm: (reason?: string) => Promise<{ succeeded: string[]; failed: string[] }>
  variant?: "default" | "destructive"
}

export default function BulkActionConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  selectedCount,
  actionLabel,
  requiresReason = false,
  onConfirm,
  variant = "default",
}: BulkActionConfirmDialogProps) {
  const [reason, setReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<{ succeeded: string[]; failed: string[] } | null>(null)

  const handleConfirm = async () => {
    if (requiresReason && !reason.trim()) {
      return
    }

    setProcessing(true)
    try {
      const res = await onConfirm(reason || undefined)
      setResult(res)
    } catch (error) {
      console.error("Bulk action failed:", error)
      setResult({ succeeded: [], failed: [] })
    } finally {
      setProcessing(false)
    }
  }

  const handleClose = () => {
    setReason("")
    setResult(null)
    onClose()
  }

  const totalItems = result ? result.succeeded.length + result.failed.length : selectedCount
  const successRate = result ? (result.succeeded.length / totalItems) * 100 : 0

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {!result ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle
                  className={`w-5 h-5 ${
                    variant === "destructive" ? "text-destructive" : "text-amber-500"
                  }`}
                />
                {title}
              </DialogTitle>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm font-medium">
                  {selectedCount} {selectedCount === 1 ? "item" : "items"} will be affected
                </p>
              </div>

              {requiresReason && (
                <div className="space-y-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for this action..."
                    className="min-h-[100px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">
                This action cannot be undone. Are you sure you want to continue?
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={processing}>
                Cancel
              </Button>
              <Button
                variant={variant}
                onClick={handleConfirm}
                disabled={processing || (requiresReason && !reason.trim())}
                className="gap-2"
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                {actionLabel}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {result.failed.length === 0 ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    Action Completed Successfully
                  </>
                ) : result.succeeded.length === 0 ? (
                  <>
                    <XCircle className="w-5 h-5 text-destructive" />
                    Action Failed
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Action Completed with Errors
                  </>
                )}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span className="font-medium">{successRate.toFixed(0)}% successful</span>
                </div>
                <Progress value={successRate} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Successful</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {result.succeeded.length}
                  </p>
                </div>
                <div className="bg-red-50 dark:bg-red-950 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Failed</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {result.failed.length}
                  </p>
                </div>
              </div>

              {result.failed.length > 0 && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-2">Failed Items:</p>
                  <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                    {result.failed.map((id, index) => (
                      <li key={index} className="text-muted-foreground">
                        • {id}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
