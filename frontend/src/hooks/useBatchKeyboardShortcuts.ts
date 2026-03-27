import { useEffect, useCallback } from "react"

interface UseBatchKeyboardShortcutsOptions {
  onSelectAll?: () => void
  onClearSelection?: () => void
  onUndo?: () => void
  onDelete?: () => void
  enabled?: boolean
}

/**
 * Hook for batch operations keyboard shortcuts
 *
 * Shortcuts:
 * - Ctrl/Cmd + A: Select all
 * - Escape: Clear selection
 * - Ctrl/Cmd + Z: Undo last operation
 * - Delete: Delete selected items (with confirmation)
 */
export function useBatchKeyboardShortcuts({
  onSelectAll,
  onClearSelection,
  onUndo,
  onDelete,
  enabled = true,
}: UseBatchKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Check if user is typing in an input/textarea
      const target = event.target as HTMLElement
      if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
        return
      }

      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0
      const ctrlOrCmd = isMac ? event.metaKey : event.ctrlKey

      // Ctrl/Cmd + A: Select all
      if (ctrlOrCmd && event.key === "a" && onSelectAll) {
        event.preventDefault()
        onSelectAll()
      }

      // Escape: Clear selection
      if (event.key === "Escape" && onClearSelection) {
        event.preventDefault()
        onClearSelection()
      }

      // Ctrl/Cmd + Z: Undo
      if (ctrlOrCmd && event.key === "z" && !event.shiftKey && onUndo) {
        event.preventDefault()
        onUndo()
      }

      // Delete key: Delete selected items
      if (event.key === "Delete" && onDelete) {
        event.preventDefault()
        onDelete()
      }
    },
    [enabled, onSelectAll, onClearSelection, onUndo, onDelete]
  )

  useEffect(() => {
    if (enabled) {
      document.addEventListener("keydown", handleKeyDown)
      return () => {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [enabled, handleKeyDown])
}

/**
 * Hook for range selection with Shift+Click
 */
export function useRangeSelection<T extends { id: string }>(
  items: T[],
  selectedIds: Set<string>,
  onSelect: (id: string, item: T) => void
) {
  let lastSelectedIndex = -1

  const handleItemClick = useCallback(
    (clickedItem: T, event: React.MouseEvent) => {
      const clickedIndex = items.findIndex((item) => item.id === clickedItem.id)

      if (event.shiftKey && lastSelectedIndex !== -1) {
        // Range select
        const start = Math.min(lastSelectedIndex, clickedIndex)
        const end = Math.max(lastSelectedIndex, clickedIndex)

        for (let i = start; i <= end; i++) {
          if (!selectedIds.has(items[i].id)) {
            onSelect(items[i].id, items[i])
          }
        }
      } else {
        // Single select/deselect
        onSelect(clickedItem.id, clickedItem)
        lastSelectedIndex = clickedIndex
      }
    },
    [items, selectedIds, onSelect]
  )

  return { handleItemClick }
}
