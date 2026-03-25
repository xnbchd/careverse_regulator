import { Checkbox } from '@/components/ui/checkbox'
import { TableRow, TableCell } from '@/components/ui/table'
import { cn } from '@/lib/utils'

interface SelectableRowProps {
  id: string
  isSelected: boolean
  onSelect: (id: string) => void
  onToggle?: (id: string) => void
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export function SelectableRow({
  id,
  isSelected,
  onSelect,
  onToggle,
  children,
  disabled = false,
  className,
}: SelectableRowProps) {
  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      onSelect(id)
    } else if (onToggle) {
      onToggle(id)
    }
  }

  const handleRowClick = (e: React.MouseEvent) => {
    // If clicking on the checkbox itself, let the checkbox handler deal with it
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
      return
    }

    // Handle shift+click for range selection in the parent component
    if (e.shiftKey && onToggle) {
      onToggle(id)
    }
  }

  return (
    <TableRow
      className={cn(
        'cursor-pointer transition-colors',
        isSelected && 'bg-muted/50',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      onClick={handleRowClick}
      data-selected={isSelected}
      data-row-id={id}
    >
      <TableCell className="w-12 pr-0">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleCheckboxChange}
          disabled={disabled}
          aria-label={`Select row ${id}`}
        />
      </TableCell>
      {children}
    </TableRow>
  )
}
