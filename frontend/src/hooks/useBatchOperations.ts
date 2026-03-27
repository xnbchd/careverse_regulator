import { useCallback, useMemo } from "react"
import { useBatchStore } from "@/stores/batchStore"
import { logBatchOperation } from "@/lib/auditMiddleware"
import type {
  BatchActionType,
  BatchOperationConfig,
  BatchOperationResult,
  SelectionState,
} from "@/types/batch"
import { AuditAction, AuditEntity } from "@/types/audit"
import * as batchApi from "@/api/batchApi"

/**
 * Hook for batch operations with selection management and audit logging
 */
export function useBatchOperations(context: string = "default") {
  const store = useBatchStore()

  // Selection state for this context
  const selection = useMemo(() => store.getSelection(context), [context, store])
  const selectedCount = useMemo(() => store.getSelectedCount(context), [context, store])
  const selectedIds = useMemo(() => Array.from(selection.selectedIds), [selection])
  const selectedItems = useMemo(() => Array.from(selection.selectedItems.values()), [selection])

  // Selection actions
  const selectItem = useCallback(
    (id: string, item: any) => {
      store.selectItem(context, id, item)
    },
    [context, store]
  )

  const deselectItem = useCallback(
    (id: string) => {
      store.deselectItem(context, id)
    },
    [context, store]
  )

  const selectAll = useCallback(
    (items: Array<{ id: string; [key: string]: any }>) => {
      store.selectAll(context, items)
    },
    [context, store]
  )

  const clearSelection = useCallback(() => {
    store.clearSelection(context)
  }, [context, store])

  const toggleItem = useCallback(
    (id: string, item: any) => {
      store.toggleItem(context, id, item)
    },
    [context, store]
  )

  const isSelected = useCallback(
    (id: string) => {
      return store.isSelected(context, id)
    },
    [context, store]
  )

  // Execute batch operation with audit logging
  const executeBatch = useCallback(
    async (
      actionType: BatchActionType,
      options?: {
        metadata?: Record<string, any>
        onProgress?: (progress: any) => void
        onComplete?: () => void
      }
    ): Promise<BatchOperationResult> => {
      if (selectedCount === 0) {
        throw new Error("No items selected")
      }

      const config: BatchOperationConfig = {
        actionType,
        items: selectedItems.map((item) => ({
          id: item.id,
          data: item,
        })),
        metadata: options?.metadata,
        onProgress: options?.onProgress,
        onComplete: options?.onComplete,
      }

      try {
        // Execute the batch operation
        const result = await store.executeBatch(config)

        // Log to audit system
        await logBatchOperation({
          action: mapBatchActionToAuditAction(actionType),
          entity: getEntityFromContext(context),
          description: `Batch ${actionType} operation`,
          items: result.items.map((item) => ({
            entityId: item.itemId,
            success: item.success,
            errorMessage: item.error,
          })),
          details: {
            actionType,
            ...options?.metadata,
          },
        })

        // Clear selection on success
        if (result.success) {
          clearSelection()
        }

        return result
      } catch (error) {
        console.error("Batch operation failed:", error)
        throw error
      }
    },
    [selectedCount, selectedItems, context, store, clearSelection]
  )

  // Convenience methods for specific batch operations
  const bulkApprove = useCallback(
    async (metadata?: Record<string, any>) => {
      return executeBatch("license_approve" as BatchActionType, { metadata })
    },
    [executeBatch]
  )

  const bulkReject = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return executeBatch("license_reject" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [executeBatch]
  )

  const bulkDelete = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return executeBatch("bulk_delete" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [executeBatch]
  )

  // Undo/Redo
  const canUndo = useCallback(() => store.canUndo(), [store])
  const canRedo = useCallback(() => store.canRedo(), [store])
  const undo = useCallback(() => store.undo(), [store])
  const redo = useCallback(() => store.redo(), [store])

  return {
    // Selection state
    selection,
    selectedCount,
    selectedIds,
    selectedItems,
    isAllSelected: selection.isAllSelected,
    isIndeterminate: selection.isIndeterminate,

    // Selection actions
    selectItem,
    deselectItem,
    selectAll,
    clearSelection,
    toggleItem,
    isSelected,

    // Batch operations
    executeBatch,
    bulkApprove,
    bulkReject,
    bulkDelete,

    // Undo/Redo
    canUndo,
    canRedo,
    undo,
    redo,

    // UI state
    isExecuting: store.isExecuting,
    showProgressDialog: store.showProgressDialog,
    showResultDialog: store.showResultDialog,
    lastResult: store.lastResult,
    activeOperation: store.activeOperationId ? store.getOperation(store.activeOperationId) : null,

    // UI actions
    setShowProgressDialog: store.setShowProgressDialog,
    setShowResultDialog: store.setShowResultDialog,
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Map batch action type to audit action
 */
function mapBatchActionToAuditAction(batchAction: BatchActionType): AuditAction {
  const mapping: Partial<Record<BatchActionType, AuditAction>> = {
    license_approve: AuditAction.BULK_APPROVE,
    license_reject: AuditAction.BULK_REJECT,
    license_suspend: AuditAction.LICENSE_SUSPEND,
    license_delete: AuditAction.BULK_DELETE,
    affiliation_approve: AuditAction.BULK_APPROVE,
    affiliation_reject: AuditAction.BULK_REJECT,
    affiliation_delete: AuditAction.BULK_DELETE,
    document_delete: AuditAction.BULK_DELETE,
    bulk_delete: AuditAction.BULK_DELETE,
    bulk_update: AuditAction.BULK_UPDATE,
  }

  return mapping[batchAction] || AuditAction.BULK_UPDATE
}

/**
 * Get audit entity from context
 */
function getEntityFromContext(context: string): AuditEntity {
  if (context.includes("license")) return AuditEntity.LICENSE
  if (context.includes("affiliation")) return AuditEntity.AFFILIATION
  if (context.includes("document")) return AuditEntity.DOCUMENT
  if (context.includes("inspection")) return AuditEntity.INSPECTION
  return AuditEntity.SYSTEM
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for license batch operations
 */
export function useLicenseBatchOperations() {
  const batch = useBatchOperations("licenses")

  const bulkApprove = useCallback(
    async (metadata?: Record<string, any>) => {
      const result = await batch.executeBatch("license_approve" as BatchActionType, { metadata })
      return result
    },
    [batch]
  )

  const bulkReject = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      const result = await batch.executeBatch("license_reject" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
      return result
    },
    [batch]
  )

  const bulkSuspend = useCallback(
    async (reason: string, suspendUntil?: string, metadata?: Record<string, any>) => {
      const result = await batch.executeBatch("license_suspend" as BatchActionType, {
        metadata: { reason, suspendUntil, ...metadata },
      })
      return result
    },
    [batch]
  )

  const bulkRenew = useCallback(
    async (validityYears: number, metadata?: Record<string, any>) => {
      const result = await batch.executeBatch("license_renew" as BatchActionType, {
        metadata: { validityYears, ...metadata },
      })
      return result
    },
    [batch]
  )

  const bulkDelete = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      const result = await batch.executeBatch("license_delete" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
      return result
    },
    [batch]
  )

  return {
    ...batch,
    bulkApprove,
    bulkReject,
    bulkSuspend,
    bulkRenew,
    bulkDelete,
  }
}

/**
 * Hook for affiliation batch operations
 */
export function useAffiliationBatchOperations() {
  const batch = useBatchOperations("affiliations")

  const bulkApprove = useCallback(
    async (metadata?: Record<string, any>) => {
      return batch.executeBatch("affiliation_approve" as BatchActionType, { metadata })
    },
    [batch]
  )

  const bulkReject = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return batch.executeBatch("affiliation_reject" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [batch]
  )

  const bulkActivate = useCallback(
    async (metadata?: Record<string, any>) => {
      return batch.executeBatch("affiliation_activate" as BatchActionType, { metadata })
    },
    [batch]
  )

  const bulkDeactivate = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return batch.executeBatch("affiliation_deactivate" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [batch]
  )

  const bulkDelete = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return batch.executeBatch("affiliation_delete" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [batch]
  )

  return {
    ...batch,
    bulkApprove,
    bulkReject,
    bulkActivate,
    bulkDeactivate,
    bulkDelete,
  }
}

/**
 * Hook for document batch operations
 */
export function useDocumentBatchOperations() {
  const batch = useBatchOperations("documents")

  const bulkDelete = useCallback(
    async (reason: string, metadata?: Record<string, any>) => {
      return batch.executeBatch("document_delete" as BatchActionType, {
        metadata: { reason, ...metadata },
      })
    },
    [batch]
  )

  const bulkDownload = useCallback(async () => {
    if (batch.selectedIds.length === 0) {
      throw new Error("No documents selected")
    }

    const blob = await batchApi.bulkDownloadDocuments(batch.selectedIds)

    // Create download link
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `documents-${new Date().toISOString().split("T")[0]}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    // Clear selection after download
    batch.clearSelection()
  }, [batch])

  const bulkUpdateCategory = useCallback(
    async (category: string, metadata?: Record<string, any>) => {
      return batch.executeBatch("document_update_category" as BatchActionType, {
        metadata: { category, ...metadata },
      })
    },
    [batch]
  )

  const bulkUpdateTags = useCallback(
    async (
      tags: string[],
      operation: "add" | "remove" | "replace",
      metadata?: Record<string, any>
    ) => {
      return batch.executeBatch("document_update_tags" as BatchActionType, {
        metadata: { tags, operation, ...metadata },
      })
    },
    [batch]
  )

  return {
    ...batch,
    bulkDelete,
    bulkDownload,
    bulkUpdateCategory,
    bulkUpdateTags,
  }
}
