import { useState } from 'react'
import { CheckCircle, XCircle, Ban, RefreshCw, Trash2 } from 'lucide-react'
import {
  BatchActionBar,
  BatchAction,
  ConfirmBatchDialog,
  BatchProgressDialog,
  BatchResultDialog,
} from '@/components/batch'
import { useLicenseBatchOperations } from '@/hooks/useBatchOperations'
import { BatchActionType } from '@/types/batch'

interface LicensesBatchOperationsProps {
  licenses: Array<{ id: string; licenseNumber: string; [key: string]: any }>
}

export function LicensesBatchOperations({ licenses }: LicensesBatchOperationsProps) {
  const batch = useLicenseBatchOperations()
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [currentAction, setCurrentAction] = useState<BatchActionType | null>(null)

  // Define available actions for licenses
  const actions: BatchAction[] = [
    {
      id: 'approve',
      label: 'Approve',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction('license_approve' as BatchActionType)
        setShowConfirmDialog(true)
      },
      variant: 'default',
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: <XCircle className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction('license_reject' as BatchActionType)
        setShowConfirmDialog(true)
      },
      variant: 'destructive',
    },
    {
      id: 'suspend',
      label: 'Suspend',
      icon: <Ban className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction('license_suspend' as BatchActionType)
        setShowConfirmDialog(true)
      },
      variant: 'secondary',
    },
    {
      id: 'renew',
      label: 'Renew',
      icon: <RefreshCw className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction('license_renew' as BatchActionType)
        setShowConfirmDialog(true)
      },
      variant: 'outline',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction('license_delete' as BatchActionType)
        setShowConfirmDialog(true)
      },
      variant: 'destructive',
    },
  ]

  const handleConfirm = async (reason?: string) => {
    if (!currentAction) return

    switch (currentAction) {
      case 'license_approve' as BatchActionType:
        await batch.bulkApprove({ reason })
        break
      case 'license_reject' as BatchActionType:
        await batch.bulkReject(reason || 'Rejected by regulator', { reason })
        break
      case 'license_suspend' as BatchActionType:
        await batch.bulkSuspend(reason || 'Suspended by regulator', undefined, { reason })
        break
      case 'license_renew' as BatchActionType:
        await batch.bulkRenew(5, { reason }) // Default 5 years
        break
      case 'license_delete' as BatchActionType:
        await batch.bulkDelete(reason || 'Deleted by regulator', { reason })
        break
      default:
        await batch.executeBatch(currentAction, { metadata: { reason } })
    }

    setShowConfirmDialog(false)
    setCurrentAction(null)
  }

  const handleRetryFailed = async () => {
    // Retry logic would be implemented here
    // For now, just close the dialog
    batch.setShowResultDialog(false)
  }

  const handleExportReport = () => {
    // Export report logic
    console.log('Exporting batch operation report...')
  }

  return (
    <>
      {/* Floating action bar */}
      <BatchActionBar
        selectedCount={batch.selectedCount}
        actions={actions}
        onClearSelection={batch.clearSelection}
      />

      {/* Confirmation dialog */}
      {currentAction && (
        <ConfirmBatchDialog
          open={showConfirmDialog}
          onOpenChange={setShowConfirmDialog}
          actionType={currentAction}
          selectedCount={batch.selectedCount}
          onConfirm={handleConfirm}
          requiresReason={
            currentAction === ('license_reject' as BatchActionType) ||
            currentAction === ('license_suspend' as BatchActionType) ||
            currentAction === ('license_delete' as BatchActionType)
          }
        />
      )}

      {/* Progress dialog */}
      <BatchProgressDialog
        open={batch.showProgressDialog}
        onOpenChange={batch.setShowProgressDialog}
        operation={batch.activeOperation}
        onCancel={() => {
          // Cancel operation if needed
          batch.setShowProgressDialog(false)
        }}
      />

      {/* Result dialog */}
      <BatchResultDialog
        open={batch.showResultDialog}
        onOpenChange={batch.setShowResultDialog}
        result={batch.lastResult}
        onUndo={batch.canUndo() ? batch.undo : undefined}
        onRetryFailed={handleRetryFailed}
        onExport={handleExportReport}
      />
    </>
  )
}
