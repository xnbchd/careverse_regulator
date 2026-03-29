import { Checkbox } from "@/components/ui/checkbox"
import { TableHead } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface SelectAllCheckboxProps {
  isAllSelected: boolean
  isIndeterminate: boolean
  onSelectAll: () => void
  onClearSelection: () => void
  totalCount: number
  selectedCount: number
  disabled?: boolean
}

export function SelectAllCheckbox({
  isAllSelected,
  isIndeterminate,
  onSelectAll,
  onClearSelection,
  totalCount,
  selectedCount,
  disabled = false,
}: SelectAllCheckboxProps) {
  const handleCheckedChange = (checked: boolean) => {
    if (checked) {
      onSelectAll()
    } else {
      onClearSelection()
    }
  }

  const tooltipContent = isAllSelected
    ? "Deselect all"
    : isIndeterminate
      ? `${selectedCount} of ${totalCount} selected. Click to select all.`
      : "Select all"

  return (
    <TableHead className="w-12 pr-0">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onCheckedChange={handleCheckedChange}
              disabled={disabled || totalCount === 0}
              aria-label="Select all rows"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TableHead>
  )
}
