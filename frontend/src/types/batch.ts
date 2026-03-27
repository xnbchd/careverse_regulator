/**
 * Batch Operations Types and Interfaces
 */

// ============================================================================
// Enums
// ============================================================================

/**
 * Types of batch actions that can be performed
 */
export enum BatchActionType {
  // License actions
  LICENSE_APPROVE = "license_approve",
  LICENSE_REJECT = "license_reject",
  LICENSE_SUSPEND = "license_suspend",
  LICENSE_RENEW = "license_renew",
  LICENSE_REVOKE = "license_revoke",
  LICENSE_DELETE = "license_delete",

  // Affiliation actions
  AFFILIATION_APPROVE = "affiliation_approve",
  AFFILIATION_REJECT = "affiliation_reject",
  AFFILIATION_ACTIVATE = "affiliation_activate",
  AFFILIATION_DEACTIVATE = "affiliation_deactivate",
  AFFILIATION_DELETE = "affiliation_delete",

  // Document actions
  DOCUMENT_DELETE = "document_delete",
  DOCUMENT_DOWNLOAD = "document_download",
  DOCUMENT_SHARE = "document_share",
  DOCUMENT_UPDATE_CATEGORY = "document_update_category",
  DOCUMENT_UPDATE_TAGS = "document_update_tags",

  // Inspection actions
  INSPECTION_SCHEDULE = "inspection_schedule",
  INSPECTION_CANCEL = "inspection_cancel",
  INSPECTION_RESCHEDULE = "inspection_reschedule",

  // Generic actions
  BULK_UPDATE = "bulk_update",
  BULK_DELETE = "bulk_delete",
  BULK_EXPORT = "bulk_export",
}

/**
 * Status of a batch operation
 */
export enum BatchOperationStatus {
  PENDING = "pending",
  RUNNING = "running",
  PAUSED = "paused",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  FAILED = "failed",
}

/**
 * Status of an individual item in a batch operation
 */
export enum BatchItemStatus {
  PENDING = "pending",
  PROCESSING = "processing",
  SUCCESS = "success",
  FAILED = "failed",
  SKIPPED = "skipped",
}

// ============================================================================
// Core Types
// ============================================================================

/**
 * A single item in a batch operation
 */
export interface BatchItem<T = any> {
  id: string
  data: T
  status: BatchItemStatus
  error?: string
  startedAt?: string
  completedAt?: string
}

/**
 * Result of processing a single batch item
 */
export interface BatchItemResult {
  itemId: string
  success: boolean
  error?: string
  data?: any
}

/**
 * Progress information for a batch operation
 */
export interface BatchProgress {
  total: number
  processed: number
  succeeded: number
  failed: number
  skipped: number
  percentage: number
  estimatedTimeRemaining?: number // in milliseconds
}

/**
 * A batch operation
 */
export interface BatchOperation<T = any> {
  id: string
  type: BatchActionType
  status: BatchOperationStatus
  items: BatchItem<T>[]
  progress: BatchProgress
  createdAt: string
  startedAt?: string
  completedAt?: string
  cancelledAt?: string
  createdBy: string
  metadata?: Record<string, any>
  canUndo: boolean
  undoData?: any
}

/**
 * Configuration for executing a batch operation
 */
export interface BatchOperationConfig {
  actionType: BatchActionType
  items: Array<{ id: string; data: any }>
  metadata?: Record<string, any>
  concurrency?: number // Number of items to process in parallel
  retryFailedItems?: boolean
  onProgress?: (progress: BatchProgress) => void
  onItemComplete?: (result: BatchItemResult) => void
  onComplete?: (operation: BatchOperation) => void
  onError?: (error: Error) => void
}

/**
 * Result of a completed batch operation
 */
export interface BatchOperationResult {
  operationId: string
  success: boolean
  total: number
  succeeded: number
  failed: number
  skipped: number
  items: BatchItemResult[]
  duration: number // in milliseconds
  canUndo: boolean
}

// ============================================================================
// Selection State
// ============================================================================

/**
 * Multi-select state for a list
 */
export interface SelectionState<T = any> {
  selectedIds: Set<string>
  selectedItems: Map<string, T>
  isAllSelected: boolean
  isIndeterminate: boolean
}

/**
 * Selection actions
 */
export interface SelectionActions {
  selectItem: (id: string, item: any) => void
  deselectItem: (id: string) => void
  selectAll: (items: Array<{ id: string; [key: string]: any }>) => void
  clearSelection: () => void
  toggleItem: (id: string, item: any) => void
  toggleAll: (items: Array<{ id: string; [key: string]: any }>) => void
  isSelected: (id: string) => boolean
}

// ============================================================================
// Undo/Redo
// ============================================================================

/**
 * An action that can be undone
 */
export interface UndoableAction {
  id: string
  type: BatchActionType
  description: string
  timestamp: string
  canUndo: boolean
  undoData: any
  metadata?: Record<string, any>
}

/**
 * Undo/Redo stack state
 */
export interface UndoRedoState {
  undoStack: UndoableAction[]
  redoStack: UndoableAction[]
  maxStackSize: number
}

/**
 * Undo/Redo actions
 */
export interface UndoRedoActions {
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => Promise<void>
  redo: () => Promise<void>
  clearHistory: () => void
  addToHistory: (action: UndoableAction) => void
}

// ============================================================================
// Batch Action Definitions
// ============================================================================

/**
 * Definition of a batch action with metadata
 */
export interface BatchActionDefinition {
  type: BatchActionType
  label: string
  description: string
  icon?: string
  confirmationRequired: boolean
  confirmationMessage?: string
  isDestructive: boolean
  requiresReason?: boolean
  canUndo: boolean
  undoActionType?: BatchActionType
}

/**
 * Context for batch actions (permissions, validation, etc.)
 */
export interface BatchActionContext {
  userId: string
  userName: string
  permissions: string[]
  reason?: string
  metadata?: Record<string, any>
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get label for a batch action type
 */
export function getBatchActionLabel(type: BatchActionType): string {
  const labels: Record<BatchActionType, string> = {
    [BatchActionType.LICENSE_APPROVE]: "Approve Licenses",
    [BatchActionType.LICENSE_REJECT]: "Reject Licenses",
    [BatchActionType.LICENSE_SUSPEND]: "Suspend Licenses",
    [BatchActionType.LICENSE_RENEW]: "Renew Licenses",
    [BatchActionType.LICENSE_REVOKE]: "Revoke Licenses",
    [BatchActionType.LICENSE_DELETE]: "Delete Licenses",
    [BatchActionType.AFFILIATION_APPROVE]: "Approve Affiliations",
    [BatchActionType.AFFILIATION_REJECT]: "Reject Affiliations",
    [BatchActionType.AFFILIATION_ACTIVATE]: "Activate Affiliations",
    [BatchActionType.AFFILIATION_DEACTIVATE]: "Deactivate Affiliations",
    [BatchActionType.AFFILIATION_DELETE]: "Delete Affiliations",
    [BatchActionType.DOCUMENT_DELETE]: "Delete Documents",
    [BatchActionType.DOCUMENT_DOWNLOAD]: "Download Documents",
    [BatchActionType.DOCUMENT_SHARE]: "Share Documents",
    [BatchActionType.DOCUMENT_UPDATE_CATEGORY]: "Update Document Category",
    [BatchActionType.DOCUMENT_UPDATE_TAGS]: "Update Document Tags",
    [BatchActionType.INSPECTION_SCHEDULE]: "Schedule Inspections",
    [BatchActionType.INSPECTION_CANCEL]: "Cancel Inspections",
    [BatchActionType.INSPECTION_RESCHEDULE]: "Reschedule Inspections",
    [BatchActionType.BULK_UPDATE]: "Bulk Update",
    [BatchActionType.BULK_DELETE]: "Bulk Delete",
    [BatchActionType.BULK_EXPORT]: "Bulk Export",
  }
  return labels[type] || type
}

/**
 * Check if a batch action is destructive
 */
export function isDestructiveBatchAction(type: BatchActionType): boolean {
  const destructiveActions = [
    BatchActionType.LICENSE_DELETE,
    BatchActionType.LICENSE_REVOKE,
    BatchActionType.LICENSE_SUSPEND,
    BatchActionType.AFFILIATION_DELETE,
    BatchActionType.DOCUMENT_DELETE,
    BatchActionType.INSPECTION_CANCEL,
    BatchActionType.BULK_DELETE,
  ]
  return destructiveActions.includes(type)
}

/**
 * Check if a batch action can be undone
 */
export function canUndoBatchAction(type: BatchActionType): boolean {
  const undoableActions = [
    BatchActionType.LICENSE_APPROVE,
    BatchActionType.LICENSE_REJECT,
    BatchActionType.LICENSE_SUSPEND,
    BatchActionType.AFFILIATION_APPROVE,
    BatchActionType.AFFILIATION_REJECT,
    BatchActionType.AFFILIATION_ACTIVATE,
    BatchActionType.AFFILIATION_DEACTIVATE,
    BatchActionType.DOCUMENT_UPDATE_CATEGORY,
    BatchActionType.DOCUMENT_UPDATE_TAGS,
  ]
  return undoableActions.includes(type)
}

/**
 * Get the undo action for a batch action
 */
export function getUndoActionType(type: BatchActionType): BatchActionType | null {
  const undoMap: Partial<Record<BatchActionType, BatchActionType>> = {
    [BatchActionType.LICENSE_APPROVE]: BatchActionType.LICENSE_REJECT,
    [BatchActionType.LICENSE_REJECT]: BatchActionType.LICENSE_APPROVE,
    [BatchActionType.LICENSE_SUSPEND]: BatchActionType.LICENSE_APPROVE,
    [BatchActionType.AFFILIATION_APPROVE]: BatchActionType.AFFILIATION_REJECT,
    [BatchActionType.AFFILIATION_REJECT]: BatchActionType.AFFILIATION_APPROVE,
    [BatchActionType.AFFILIATION_ACTIVATE]: BatchActionType.AFFILIATION_DEACTIVATE,
    [BatchActionType.AFFILIATION_DEACTIVATE]: BatchActionType.AFFILIATION_ACTIVATE,
  }
  return undoMap[type] || null
}

/**
 * Calculate progress from batch items
 */
export function calculateBatchProgress(items: BatchItem[]): BatchProgress {
  const total = items.length
  const processed = items.filter(
    (item) =>
      item.status === BatchItemStatus.SUCCESS ||
      item.status === BatchItemStatus.FAILED ||
      item.status === BatchItemStatus.SKIPPED
  ).length
  const succeeded = items.filter((item) => item.status === BatchItemStatus.SUCCESS).length
  const failed = items.filter((item) => item.status === BatchItemStatus.FAILED).length
  const skipped = items.filter((item) => item.status === BatchItemStatus.SKIPPED).length
  const percentage = total > 0 ? (processed / total) * 100 : 0

  return {
    total,
    processed,
    succeeded,
    failed,
    skipped,
    percentage,
  }
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}h ${minutes % 60}m ${seconds % 60}s`
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  } else {
    return `${seconds}s`
  }
}

/**
 * Estimate remaining time based on progress
 */
export function estimateRemainingTime(
  startTime: number,
  processed: number,
  total: number
): number | undefined {
  if (processed === 0 || total === 0) return undefined

  const elapsed = Date.now() - startTime
  const avgTimePerItem = elapsed / processed
  const remaining = total - processed

  return Math.round(avgTimePerItem * remaining)
}
