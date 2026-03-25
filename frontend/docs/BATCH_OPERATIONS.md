# Batch Operations & Bulk Actions

Complete multi-select and batch operation system for efficient bulk processing.

## Overview

The batch operations system provides:

- **Multi-select UI** with checkboxes and keyboard shortcuts
- **Batch execution** with progress tracking and per-item results
- **Undo/redo** functionality for reversible operations
- **Audit logging** integration for compliance
- **Specialized hooks** for licenses, affiliations, and documents
- **Real-time progress** dialogs with estimated time remaining

## Quick Start

### Basic Usage

```typescript
import { useBatchOperations } from '@/hooks/useBatchOperations'
import { BatchActionBar, ConfirmBatchDialog, BatchProgressDialog, BatchResultDialog } from '@/components/batch'

function MyListComponent() {
  const batch = useBatchOperations('my-context')
  const [items] = useState([...])

  return (
    <>
      {/* Your list with selectable items */}
      {items.map(item => (
        <SelectableRow
          key={item.id}
          id={item.id}
          isSelected={batch.isSelected(item.id)}
          onSelect={() => batch.selectItem(item.id, item)}
        >
          {/* Row content */}
        </SelectableRow>
      ))}

      {/* Floating action bar */}
      <BatchActionBar
        selectedCount={batch.selectedCount}
        actions={[
          {
            id: 'approve',
            label: 'Approve',
            onClick: () => batch.bulkApprove()
          }
        ]}
        onClearSelection={batch.clearSelection}
      />

      {/* Progress and result dialogs */}
      <BatchProgressDialog
        open={batch.showProgressDialog}
        onOpenChange={batch.setShowProgressDialog}
        operation={batch.activeOperation}
      />

      <BatchResultDialog
        open={batch.showResultDialog}
        onOpenChange={batch.setShowResultDialog}
        result={batch.lastResult}
        onUndo={batch.undo}
      />
    </>
  )
}
```

## Core Hooks

### `useBatchOperations(context)`

Main hook for batch operations.

**Parameters:**
- `context` (string): Unique context identifier for this list

**Returns:**
```typescript
{
  // Selection state
  selectedCount: number
  selectedIds: string[]
  selectedItems: any[]
  isAllSelected: boolean
  isIndeterminate: boolean

  // Selection actions
  selectItem: (id, item) => void
  deselectItem: (id) => void
  selectAll: (items) => void
  clearSelection: () => void
  toggleItem: (id, item) => void
  isSelected: (id) => boolean

  // Batch operations
  executeBatch: (actionType, options?) => Promise<BatchOperationResult>
  bulkApprove: (metadata?) => Promise<BatchOperationResult>
  bulkReject: (reason, metadata?) => Promise<BatchOperationResult>
  bulkDelete: (reason, metadata?) => Promise<BatchOperationResult>

  // Undo/Redo
  canUndo: () => boolean
  canRedo: () => boolean
  undo: () => Promise<void>
  redo: () => Promise<void>

  // UI state
  isExecuting: boolean
  showProgressDialog: boolean
  showResultDialog: boolean
  lastResult: BatchOperationResult | null
  activeOperation: BatchOperation | null
}
```

### `useLicenseBatchOperations()`

Specialized hook for license batch operations.

```typescript
const batch = useLicenseBatchOperations()

// License-specific methods
await batch.bulkApprove()
await batch.bulkReject('Incomplete documentation')
await batch.bulkSuspend('Non-compliance', '2024-12-31')
await batch.bulkRenew(5) // 5 years
await batch.bulkDelete('Duplicate entries')
```

### `useAffiliationBatchOperations()`

Specialized hook for affiliation batch operations.

```typescript
const batch = useAffiliationBatchOperations()

await batch.bulkApprove()
await batch.bulkReject('Invalid credentials')
await batch.bulkActivate()
await batch.bulkDeactivate('Expired license')
await batch.bulkDelete('Withdrawn by practitioner')
```

### `useDocumentBatchOperations()`

Specialized hook for document batch operations.

```typescript
const batch = useDocumentBatchOperations()

await batch.bulkDelete('Obsolete documents')
await batch.bulkDownload() // Downloads as ZIP
await batch.bulkUpdateCategory('Compliance')
await batch.bulkUpdateTags(['reviewed', 'approved'], 'add')
```

## Components

### SelectableRow

Table row with checkbox for selection.

```typescript
<SelectableRow
  id={item.id}
  isSelected={batch.isSelected(item.id)}
  onSelect={() => batch.selectItem(item.id, item)}
  onToggle={() => batch.toggleItem(item.id, item)}
  disabled={false}
>
  <TableCell>{item.name}</TableCell>
  {/* More cells */}
</SelectableRow>
```

### SelectAllCheckbox

Header checkbox with indeterminate state.

```typescript
<SelectAllCheckbox
  isAllSelected={batch.isAllSelected}
  isIndeterminate={batch.isIndeterminate}
  onSelectAll={() => batch.selectAll(items)}
  onClearSelection={batch.clearSelection}
  totalCount={items.length}
  selectedCount={batch.selectedCount}
/>
```

### BatchActionBar

Floating action bar with batch actions.

```typescript
<BatchActionBar
  selectedCount={batch.selectedCount}
  actions={[
    {
      id: 'approve',
      label: 'Approve',
      icon: <CheckCircle />,
      onClick: handleApprove,
      variant: 'default'
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: <XCircle />,
      onClick: handleReject,
      variant: 'destructive'
    }
  ]}
  onClearSelection={batch.clearSelection}
  position="bottom" // or "top"
/>
```

### ConfirmBatchDialog

Confirmation dialog before executing batch operation.

```typescript
<ConfirmBatchDialog
  open={showConfirm}
  onOpenChange={setShowConfirm}
  actionType={BatchActionType.LICENSE_APPROVE}
  selectedCount={batch.selectedCount}
  onConfirm={handleConfirm}
  requiresReason={true} // Show reason textarea
/>
```

### BatchProgressDialog

Real-time progress tracking dialog.

```typescript
<BatchProgressDialog
  open={batch.showProgressDialog}
  onOpenChange={batch.setShowProgressDialog}
  operation={batch.activeOperation}
  onCancel={handleCancel} // Optional
/>
```

Shows:
- Overall progress bar
- Success/failed/skipped counts
- Per-item status
- Estimated time remaining
- Cancel button (optional)

### BatchResultDialog

Results dialog with success/failure breakdown.

```typescript
<BatchResultDialog
  open={batch.showResultDialog}
  onOpenChange={batch.setShowResultDialog}
  result={batch.lastResult}
  onUndo={batch.canUndo() ? batch.undo : undefined}
  onRetryFailed={handleRetry}
  onExport={handleExport}
/>
```

Shows:
- Success/failure statistics
- Tabs for successful and failed items
- Error messages for failed items
- Undo button (if operation is undoable)
- Retry failed items button
- Export report button

## Batch Action Types

### License Actions
- `LICENSE_APPROVE` - Approve licenses
- `LICENSE_REJECT` - Reject licenses
- `LICENSE_SUSPEND` - Suspend licenses
- `LICENSE_RENEW` - Renew licenses
- `LICENSE_REVOKE` - Revoke licenses
- `LICENSE_DELETE` - Delete licenses

### Affiliation Actions
- `AFFILIATION_APPROVE` - Approve affiliations
- `AFFILIATION_REJECT` - Reject affiliations
- `AFFILIATION_ACTIVATE` - Activate affiliations
- `AFFILIATION_DEACTIVATE` - Deactivate affiliations
- `AFFILIATION_DELETE` - Delete affiliations

### Document Actions
- `DOCUMENT_DELETE` - Delete documents
- `DOCUMENT_DOWNLOAD` - Download documents
- `DOCUMENT_SHARE` - Share documents
- `DOCUMENT_UPDATE_CATEGORY` - Update category
- `DOCUMENT_UPDATE_TAGS` - Update tags

### Inspection Actions
- `INSPECTION_SCHEDULE` - Schedule inspections
- `INSPECTION_CANCEL` - Cancel inspections
- `INSPECTION_RESCHEDULE` - Reschedule inspections

### Generic Actions
- `BULK_UPDATE` - Generic bulk update
- `BULK_DELETE` - Generic bulk delete
- `BULK_EXPORT` - Generic bulk export

## Keyboard Shortcuts

Use the `useBatchKeyboardShortcuts` hook:

```typescript
import { useBatchKeyboardShortcuts } from '@/hooks/useBatchKeyboardShortcuts'

useBatchKeyboardShortcuts({
  onSelectAll: () => batch.selectAll(items),
  onClearSelection: batch.clearSelection,
  onUndo: batch.undo,
  onDelete: handleDelete,
  enabled: true
})
```

**Available shortcuts:**
- `Ctrl/Cmd + A`: Select all items
- `Escape`: Clear selection
- `Ctrl/Cmd + Z`: Undo last operation
- `Delete`: Delete selected items (with confirmation)
- `Shift + Click`: Range selection

## Undo/Redo

### Undoable Operations

Operations that can be undone:
- License approve/reject/suspend
- Affiliation approve/reject/activate/deactivate
- Document category/tags updates

### Non-Undoable Operations

Operations that cannot be undone (destructive):
- License delete/revoke
- Affiliation delete
- Document delete
- Inspection cancel

### Usage

```typescript
const batch = useBatchOperations('licenses')

// Execute operation
await batch.bulkApprove()

// Check if can undo
if (batch.canUndo()) {
  // Undo the operation
  await batch.undo()
}

// Redo if available
if (batch.canRedo()) {
  await batch.redo()
}
```

## Audit Logging

All batch operations are automatically logged to the audit system.

```typescript
// Automatic logging includes:
- Action type
- Number of items processed
- Success/failure counts
- Per-item results with error messages
- User context (user ID, name, email, role)
- Timestamps and metadata
```

View batch operations in the Audit Logs section under Administration.

## Progress Tracking

### Real-time Updates

```typescript
await batch.executeBatch(BatchActionType.LICENSE_APPROVE, {
  onProgress: (progress) => {
    console.log(`${progress.processed}/${progress.total} (${progress.percentage}%)`)
    console.log(`Succeeded: ${progress.succeeded}, Failed: ${progress.failed}`)
    if (progress.estimatedTimeRemaining) {
      console.log(`Est. time remaining: ${progress.estimatedTimeRemaining}ms`)
    }
  },
  onItemComplete: (result) => {
    console.log(`Item ${result.itemId}: ${result.success ? 'Success' : 'Failed'}`)
  },
  onComplete: (operation) => {
    console.log('Operation complete!', operation)
  }
})
```

### Concurrency Control

```typescript
// Process 10 items in parallel (default is 5)
await batch.executeBatch(BatchActionType.LICENSE_APPROVE, {
  concurrency: 10
})
```

## Complete Example

### License Management with Batch Operations

```typescript
import { useState } from 'react'
import { useLicenseBatchOperations } from '@/hooks/useBatchOperations'
import { useBatchKeyboardShortcuts } from '@/hooks/useBatchKeyboardShortcuts'
import {
  SelectableRow,
  SelectAllCheckbox,
  BatchActionBar,
  ConfirmBatchDialog,
  BatchProgressDialog,
  BatchResultDialog,
} from '@/components/batch'
import { CheckCircle, XCircle, Ban } from 'lucide-react'
import { BatchActionType } from '@/types/batch'

export function LicenseListWithBatchOps() {
  const [licenses] = useState([...]) // Your license data
  const batch = useLicenseBatchOperations()
  const [showConfirm, setShowConfirm] = useState(false)
  const [currentAction, setCurrentAction] = useState<BatchActionType | null>(null)

  // Keyboard shortcuts
  useBatchKeyboardShortcuts({
    onSelectAll: () => batch.selectAll(licenses),
    onClearSelection: batch.clearSelection,
    onUndo: batch.canUndo() ? batch.undo : undefined,
    enabled: true
  })

  // Actions
  const actions = [
    {
      id: 'approve',
      label: 'Approve',
      icon: <CheckCircle className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction(BatchActionType.LICENSE_APPROVE)
        setShowConfirm(true)
      },
      variant: 'default' as const
    },
    {
      id: 'reject',
      label: 'Reject',
      icon: <XCircle className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction(BatchActionType.LICENSE_REJECT)
        setShowConfirm(true)
      },
      variant: 'destructive' as const
    },
    {
      id: 'suspend',
      label: 'Suspend',
      icon: <Ban className="w-4 h-4" />,
      onClick: () => {
        setCurrentAction(BatchActionType.LICENSE_SUSPEND)
        setShowConfirm(true)
      },
      variant: 'secondary' as const
    }
  ]

  const handleConfirm = async (reason?: string) => {
    if (!currentAction) return

    switch (currentAction) {
      case BatchActionType.LICENSE_APPROVE:
        await batch.bulkApprove({ reason })
        break
      case BatchActionType.LICENSE_REJECT:
        await batch.bulkReject(reason || 'Rejected', { reason })
        break
      case BatchActionType.LICENSE_SUSPEND:
        await batch.bulkSuspend(reason || 'Suspended', undefined, { reason })
        break
    }

    setShowConfirm(false)
    setCurrentAction(null)
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <SelectAllCheckbox
              isAllSelected={batch.isAllSelected}
              isIndeterminate={batch.isIndeterminate}
              onSelectAll={() => batch.selectAll(licenses)}
              onClearSelection={batch.clearSelection}
              totalCount={licenses.length}
              selectedCount={batch.selectedCount}
            />
            <TableHead>License #</TableHead>
            <TableHead>Facility</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {licenses.map(license => (
            <SelectableRow
              key={license.id}
              id={license.id}
              isSelected={batch.isSelected(license.id)}
              onSelect={() => batch.selectItem(license.id, license)}
            >
              <TableCell>{license.licenseNumber}</TableCell>
              <TableCell>{license.facility}</TableCell>
              <TableCell>{license.status}</TableCell>
            </SelectableRow>
          ))}
        </TableBody>
      </Table>

      {/* Floating action bar */}
      <BatchActionBar
        selectedCount={batch.selectedCount}
        actions={actions}
        onClearSelection={batch.clearSelection}
      />

      {/* Confirmation dialog */}
      {currentAction && (
        <ConfirmBatchDialog
          open={showConfirm}
          onOpenChange={setShowConfirm}
          actionType={currentAction}
          selectedCount={batch.selectedCount}
          onConfirm={handleConfirm}
          requiresReason={
            currentAction === BatchActionType.LICENSE_REJECT ||
            currentAction === BatchActionType.LICENSE_SUSPEND
          }
        />
      )}

      {/* Progress dialog */}
      <BatchProgressDialog
        open={batch.showProgressDialog}
        onOpenChange={batch.setShowProgressDialog}
        operation={batch.activeOperation}
      />

      {/* Result dialog */}
      <BatchResultDialog
        open={batch.showResultDialog}
        onOpenChange={batch.setShowResultDialog}
        result={batch.lastResult}
        onUndo={batch.canUndo() ? batch.undo : undefined}
      />
    </div>
  )
}
```

## Backend API Integration

### Expected Endpoints

The system expects these backend endpoints:

```
POST /api/method/compliance_360.api.batch.execute
POST /api/method/compliance_360.api.batch.licenses.bulk_approve
POST /api/method/compliance_360.api.batch.licenses.bulk_reject
POST /api/method/compliance_360.api.batch.licenses.bulk_suspend
POST /api/method/compliance_360.api.batch.licenses.bulk_renew
POST /api/method/compliance_360.api.batch.licenses.bulk_delete
POST /api/method/compliance_360.api.batch.affiliations.bulk_approve
POST /api/method/compliance_360.api.batch.affiliations.bulk_reject
POST /api/method/compliance_360.api.batch.documents.bulk_delete
POST /api/method/compliance_360.api.batch.documents.bulk_download
GET  /api/method/compliance_360.api.batch.get_status
```

### Request Format

```typescript
{
  action_type: string
  items: Array<{ id: string, data?: any }>
  metadata?: Record<string, any>
}
```

### Response Format

```typescript
{
  message: {
    operation_id: string
    total: number
    succeeded: number
    failed: number
    items: Array<{
      item_id: string
      success: boolean
      error?: string
      data?: any
    }>
  }
}
```

## Best Practices

### 1. Always Show Confirmation

```typescript
// ✅ Good - Show confirmation before destructive actions
setShowConfirmDialog(true)

// ❌ Bad - No confirmation
await batch.bulkDelete()
```

### 2. Provide Reasons for Rejections

```typescript
// ✅ Good - Require reason for rejections
<ConfirmBatchDialog requiresReason={true} />

// ❌ Bad - No reason required
<ConfirmBatchDialog requiresReason={false} />
```

### 3. Handle Partial Failures

```typescript
const result = await batch.bulkApprove()

if (result.failed > 0) {
  // Offer retry for failed items
  // Or show detailed error report
}
```

### 4. Clear Selection After Success

```typescript
// The hook automatically clears selection on full success
// For partial success, let user decide

if (result.success) {
  // All items succeeded - selection cleared automatically
} else {
  // Some failed - keep selection so user can retry
}
```

### 5. Use Appropriate Concurrency

```typescript
// For fast operations
await batch.executeBatch(action, { concurrency: 10 })

// For slow/heavy operations
await batch.executeBatch(action, { concurrency: 3 })
```

## Troubleshooting

### Selection Not Working

- Check that context string is unique per list
- Verify items have unique `id` fields
- Ensure selection methods are called with correct parameters

### Undo Not Available

- Check if action type is undoable (see Undo/Redo section)
- Verify operation completed successfully
- Check undo stack hasn't exceeded max size (50)

### Progress Not Updating

- Ensure `onProgress` callback is provided
- Check backend is returning proper response format
- Verify concurrency setting isn't too high

### Audit Logs Not Appearing

- Verify audit middleware is initialized
- Check user context is set (see audit logging docs)
- Ensure backend audit endpoints are working

## Testing

```typescript
import { renderHook, act } from '@testing-library/react'
import { useBatchOperations } from '@/hooks/useBatchOperations'

describe('Batch Operations', () => {
  it('selects and executes batch operation', async () => {
    const { result } = renderHook(() => useBatchOperations('test'))

    // Select items
    act(() => {
      result.current.selectItem('item-1', { id: 'item-1', name: 'Item 1' })
      result.current.selectItem('item-2', { id: 'item-2', name: 'Item 2' })
    })

    expect(result.current.selectedCount).toBe(2)

    // Execute batch operation
    await act(async () => {
      const batchResult = await result.current.executeBatch('bulk_update')
      expect(batchResult.total).toBe(2)
    })
  })
})
```

## Summary

The batch operations system provides a complete solution for:

✅ Multi-select with keyboard shortcuts
✅ Batch execution with progress tracking
✅ Undo/redo for reversible operations
✅ Automatic audit logging
✅ Specialized hooks per module
✅ Beautiful, accessible UI components
✅ Comprehensive error handling
✅ Real-time progress updates

Ready to use in licenses, affiliations, documents, and inspections modules.
