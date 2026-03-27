import { create } from "zustand"
import type {
  BatchActionType,
  BatchOperation,
  BatchOperationConfig,
  BatchOperationResult,
  BatchOperationStatus,
  BatchItem,
  BatchItemStatus,
  BatchItemResult,
  BatchProgress,
  UndoableAction,
  SelectionState,
} from "@/types/batch"
import {
  calculateBatchProgress,
  canUndoBatchAction,
  getUndoActionType,
  estimateRemainingTime,
} from "@/types/batch"

interface BatchStoreState {
  // Selection state (per module/context)
  selections: Map<string, SelectionState>

  // Active and historical operations
  operations: Map<string, BatchOperation>
  activeOperationId: string | null

  // Undo/Redo stacks
  undoStack: UndoableAction[]
  redoStack: UndoableAction[]
  maxStackSize: number

  // UI state
  isExecuting: boolean
  showProgressDialog: boolean
  showResultDialog: boolean
  lastResult: BatchOperationResult | null

  // Actions - Selection
  selectItem: (context: string, id: string, item: any) => void
  deselectItem: (context: string, id: string) => void
  selectAll: (context: string, items: Array<{ id: string; [key: string]: any }>) => void
  clearSelection: (context: string) => void
  toggleItem: (context: string, id: string, item: any) => void
  isSelected: (context: string, id: string) => boolean
  getSelection: (context: string) => SelectionState
  getSelectedCount: (context: string) => number

  // Actions - Batch Operations
  executeBatch: (config: BatchOperationConfig) => Promise<BatchOperationResult>
  cancelBatch: (operationId: string) => void
  retryFailedItems: (operationId: string) => Promise<void>
  getOperation: (operationId: string) => BatchOperation | undefined
  clearOperations: () => void

  // Actions - Undo/Redo
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => Promise<void>
  redo: () => Promise<void>
  clearHistory: () => void

  // Actions - UI
  setShowProgressDialog: (show: boolean) => void
  setShowResultDialog: (show: boolean) => void
  reset: () => void
}

const MAX_UNDO_STACK_SIZE = 50

export const useBatchStore = create<BatchStoreState>((set, get) => ({
  // Initial state
  selections: new Map(),
  operations: new Map(),
  activeOperationId: null,
  undoStack: [],
  redoStack: [],
  maxStackSize: MAX_UNDO_STACK_SIZE,
  isExecuting: false,
  showProgressDialog: false,
  showResultDialog: false,
  lastResult: null,

  // Selection actions
  selectItem: (context, id, item) => {
    const state = get()
    const selections = new Map(state.selections)
    const selection = selections.get(context) || {
      selectedIds: new Set(),
      selectedItems: new Map(),
      isAllSelected: false,
      isIndeterminate: false,
    }

    selection.selectedIds.add(id)
    selection.selectedItems.set(id, item)
    selection.isIndeterminate = selection.selectedIds.size > 0 && !selection.isAllSelected

    selections.set(context, selection)
    set({ selections })
  },

  deselectItem: (context, id) => {
    const state = get()
    const selections = new Map(state.selections)
    const selection = selections.get(context)

    if (selection) {
      selection.selectedIds.delete(id)
      selection.selectedItems.delete(id)
      selection.isAllSelected = false
      selection.isIndeterminate = selection.selectedIds.size > 0

      selections.set(context, selection)
      set({ selections })
    }
  },

  selectAll: (context, items) => {
    const state = get()
    const selections = new Map(state.selections)
    const selection: SelectionState = {
      selectedIds: new Set(items.map((item) => item.id)),
      selectedItems: new Map(items.map((item) => [item.id, item])),
      isAllSelected: true,
      isIndeterminate: false,
    }

    selections.set(context, selection)
    set({ selections })
  },

  clearSelection: (context) => {
    const state = get()
    const selections = new Map(state.selections)
    selections.delete(context)
    set({ selections })
  },

  toggleItem: (context, id, item) => {
    const state = get()
    const isSelected = state.isSelected(context, id)

    if (isSelected) {
      state.deselectItem(context, id)
    } else {
      state.selectItem(context, id, item)
    }
  },

  isSelected: (context, id) => {
    const state = get()
    const selection = state.selections.get(context)
    return selection?.selectedIds.has(id) || false
  },

  getSelection: (context) => {
    const state = get()
    return (
      state.selections.get(context) || {
        selectedIds: new Set(),
        selectedItems: new Map(),
        isAllSelected: false,
        isIndeterminate: false,
      }
    )
  },

  getSelectedCount: (context) => {
    const state = get()
    const selection = state.selections.get(context)
    return selection?.selectedIds.size || 0
  },

  // Batch operation execution
  executeBatch: async (config: BatchOperationConfig): Promise<BatchOperationResult> => {
    const state = get()
    const operationId = `batch-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

    // Create batch items
    const items: BatchItem[] = config.items.map((item) => ({
      id: item.id,
      data: item.data,
      status: BatchItemStatus.PENDING,
    }))

    // Create operation
    const operation: BatchOperation = {
      id: operationId,
      type: config.actionType,
      status: BatchOperationStatus.PENDING,
      items,
      progress: calculateBatchProgress(items),
      createdAt: new Date().toISOString(),
      createdBy: "current-user", // TODO: Get from auth store
      metadata: config.metadata,
      canUndo: canUndoBatchAction(config.actionType),
    }

    // Add operation to store
    const operations = new Map(state.operations)
    operations.set(operationId, operation)
    set({
      operations,
      activeOperationId: operationId,
      isExecuting: true,
      showProgressDialog: true,
    })

    try {
      // Start operation
      operation.status = BatchOperationStatus.RUNNING
      operation.startedAt = new Date().toISOString()
      const startTime = Date.now()

      // Process items (with concurrency limit)
      const concurrency = config.concurrency || 5
      const results: BatchItemResult[] = []

      for (let i = 0; i < items.length; i += concurrency) {
        const batch = items.slice(i, i + concurrency)

        const batchResults = await Promise.allSettled(
          batch.map(async (item) => {
            // Update item status
            item.status = BatchItemStatus.PROCESSING
            item.startedAt = new Date().toISOString()

            // Update operation in store
            const ops = new Map(get().operations)
            ops.set(operationId, { ...operation })
            set({ operations: ops })

            // Call progress callback
            const progress = {
              ...calculateBatchProgress(items),
              estimatedTimeRemaining: estimateRemainingTime(
                startTime,
                results.length,
                items.length
              ),
            }
            config.onProgress?.(progress)

            try {
              // TODO: Call actual API based on config.actionType
              // For now, simulate processing
              await new Promise((resolve) => setTimeout(resolve, 500))

              // Success
              item.status = BatchItemStatus.SUCCESS
              item.completedAt = new Date().toISOString()

              const result: BatchItemResult = {
                itemId: item.id,
                success: true,
              }

              config.onItemComplete?.(result)
              return result
            } catch (error: any) {
              // Failure
              item.status = BatchItemStatus.FAILED
              item.completedAt = new Date().toISOString()
              item.error = error.message

              const result: BatchItemResult = {
                itemId: item.id,
                success: false,
                error: error.message,
              }

              config.onItemComplete?.(result)
              return result
            }
          })
        )

        // Collect results
        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            results.push(result.value)
          }
        })

        // Update progress
        operation.progress = {
          ...calculateBatchProgress(items),
          estimatedTimeRemaining: estimateRemainingTime(startTime, results.length, items.length),
        }

        // Update operation in store
        const ops = new Map(get().operations)
        ops.set(operationId, { ...operation })
        set({ operations: ops })
      }

      // Complete operation
      operation.status = BatchOperationStatus.COMPLETED
      operation.completedAt = new Date().toISOString()
      operation.progress = calculateBatchProgress(items)

      const finalResult: BatchOperationResult = {
        operationId,
        success: operation.progress.failed === 0,
        total: operation.progress.total,
        succeeded: operation.progress.succeeded,
        failed: operation.progress.failed,
        skipped: operation.progress.skipped,
        items: results,
        duration: Date.now() - startTime,
        canUndo: operation.canUndo,
      }

      // Update store
      const ops = new Map(get().operations)
      ops.set(operationId, operation)
      set({
        operations: ops,
        isExecuting: false,
        activeOperationId: null,
        lastResult: finalResult,
        showResultDialog: true,
      })

      // Add to undo stack if undoable
      if (operation.canUndo) {
        const undoAction: UndoableAction = {
          id: operationId,
          type: config.actionType,
          description: `Batch ${config.actionType} (${finalResult.succeeded} items)`,
          timestamp: operation.completedAt!,
          canUndo: true,
          undoData: {
            items: config.items,
            originalOperation: operation,
          },
          metadata: config.metadata,
        }

        const undoStack = [...get().undoStack, undoAction].slice(-MAX_UNDO_STACK_SIZE)
        set({ undoStack, redoStack: [] }) // Clear redo stack on new action
      }

      config.onComplete?.(operation)
      return finalResult
    } catch (error: any) {
      // Operation failed
      operation.status = BatchOperationStatus.FAILED
      operation.completedAt = new Date().toISOString()

      const ops = new Map(get().operations)
      ops.set(operationId, operation)
      set({
        operations: ops,
        isExecuting: false,
        activeOperationId: null,
      })

      config.onError?.(error)
      throw error
    }
  },

  cancelBatch: (operationId) => {
    const state = get()
    const operation = state.operations.get(operationId)

    if (operation && operation.status === BatchOperationStatus.RUNNING) {
      operation.status = BatchOperationStatus.CANCELLED
      operation.cancelledAt = new Date().toISOString()

      const operations = new Map(state.operations)
      operations.set(operationId, operation)
      set({
        operations,
        isExecuting: false,
        activeOperationId: null,
      })
    }
  },

  retryFailedItems: async (operationId) => {
    const state = get()
    const operation = state.operations.get(operationId)

    if (!operation) return

    // Get failed items
    const failedItems = operation.items
      .filter((item) => item.status === BatchItemStatus.FAILED)
      .map((item) => ({
        id: item.id,
        data: item.data,
      }))

    if (failedItems.length === 0) return

    // Create new batch operation for failed items
    await state.executeBatch({
      actionType: operation.type,
      items: failedItems,
      metadata: { ...operation.metadata, isRetry: true, originalOperationId: operationId },
    })
  },

  getOperation: (operationId) => {
    return get().operations.get(operationId)
  },

  clearOperations: () => {
    set({ operations: new Map() })
  },

  // Undo/Redo actions
  canUndo: () => {
    return get().undoStack.length > 0
  },

  canRedo: () => {
    return get().redoStack.length > 0
  },

  undo: async () => {
    const state = get()
    if (!state.canUndo()) return

    const action = state.undoStack[state.undoStack.length - 1]
    const undoActionType = getUndoActionType(action.type)

    if (!undoActionType) {
      console.warn("Cannot undo action:", action.type)
      return
    }

    // Execute undo operation
    await state.executeBatch({
      actionType: undoActionType,
      items: action.undoData.items,
      metadata: { ...action.metadata, isUndo: true, originalActionId: action.id },
    })

    // Move action to redo stack
    const undoStack = state.undoStack.slice(0, -1)
    const redoStack = [...state.redoStack, action]
    set({ undoStack, redoStack })
  },

  redo: async () => {
    const state = get()
    if (!state.canRedo()) return

    const action = state.redoStack[state.redoStack.length - 1]

    // Execute redo operation (original action)
    await state.executeBatch({
      actionType: action.type,
      items: action.undoData.items,
      metadata: { ...action.metadata, isRedo: true, originalActionId: action.id },
    })

    // Move action back to undo stack
    const redoStack = state.redoStack.slice(0, -1)
    const undoStack = [...state.undoStack, action]
    set({ undoStack, redoStack })
  },

  clearHistory: () => {
    set({ undoStack: [], redoStack: [] })
  },

  // UI actions
  setShowProgressDialog: (show) => {
    set({ showProgressDialog: show })
  },

  setShowResultDialog: (show) => {
    set({ showResultDialog: show })
  },

  reset: () => {
    set({
      selections: new Map(),
      operations: new Map(),
      activeOperationId: null,
      undoStack: [],
      redoStack: [],
      isExecuting: false,
      showProgressDialog: false,
      showResultDialog: false,
      lastResult: null,
    })
  },
}))
