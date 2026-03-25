import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { BatchActionType, getBatchActionLabel, isDestructiveBatchAction } from '@/types/batch'

interface ConfirmBatchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: BatchActionType
  selectedCount: number
  onConfirm: (reason?: string) => void
  requiresReason?: boolean
}

export function ConfirmBatchDialog({
  open,
  onOpenChange,
  actionType,
  selectedCount,
  onConfirm,
  requiresReason = false,
}: ConfirmBatchDialogProps) {
  const [reason, setReason] = useState('')
  const isDestructive = isDestructiveBatchAction(actionType)
  const actionLabel = getBatchActionLabel(actionType)

  const handleConfirm = () => {
    onConfirm(requiresReason ? reason : undefined)
    setReason('')
    onOpenChange(false)
  }

  const canConfirm = !requiresReason || reason.trim().length > 0

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            {isDestructive && <AlertTriangle className="w-5 h-5 text-destructive" />}
            Confirm Batch Operation
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to <strong>{actionLabel.toLowerCase()}</strong> for{' '}
            <strong>{selectedCount}</strong> {selectedCount === 1 ? 'item' : 'items'}.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          {isDestructive && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action is destructive and may not be reversible. Please proceed with caution.
              </AlertDescription>
            </Alert>
          )}

          {requiresReason && (
            <div className="space-y-2">
              <Label htmlFor="reason">
                Reason {requiresReason && <span className="text-destructive">*</span>}
              </Label>
              <Textarea
                id="reason"
                placeholder="Please provide a reason for this action..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                This reason will be recorded in the audit log.
              </p>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            This operation will be executed in the background. You can monitor progress and see
            results once completed.
          </p>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={isDestructive ? 'bg-destructive hover:bg-destructive/90' : ''}
          >
            Confirm
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
