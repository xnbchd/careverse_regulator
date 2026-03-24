import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { UserFilters as Filters } from '@/types/user'

interface UserFiltersProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  onClearFilters: () => void
}

export default function UserFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: UserFiltersProps) {
  const hasActiveFilters =
    filters.role !== 'all' ||
    filters.status !== 'all' ||
    !!filters.search

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <Select
          value={filters.role || 'all'}
          onValueChange={(value) => onFilterChange({ role: value as any })}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Administrator">Administrator</SelectItem>
            <SelectItem value="Inspector">Inspector</SelectItem>
            <SelectItem value="Reviewer">Reviewer</SelectItem>
            <SelectItem value="Analyst">Analyst</SelectItem>
            <SelectItem value="Viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFilterChange({ status: value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto"
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
