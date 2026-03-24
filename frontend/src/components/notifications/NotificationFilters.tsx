import { Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { NotificationFilters as Filters } from '@/types/notification'

interface NotificationFiltersProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  onClearFilters: () => void
  unreadCount: number
}

export default function NotificationFilters({
  filters,
  onFilterChange,
  onClearFilters,
  unreadCount,
}: NotificationFiltersProps) {
  const hasActiveFilters =
    filters.type !== 'all' ||
    filters.status !== 'all' ||
    filters.priority !== 'all' ||
    !!filters.search

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search notifications..."
          value={filters.search || ''}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="pl-10"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <Badge variant="destructive" className="shrink-0">
            {unreadCount} Unread
          </Badge>
        )}

        {/* Type Filter */}
        <Select
          value={filters.type || 'all'}
          onValueChange={(value) => onFilterChange({ type: value as any })}
        >
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="alert">Alerts</SelectItem>
            <SelectItem value="reminder">Reminders</SelectItem>
            <SelectItem value="followup">Follow-ups</SelectItem>
            <SelectItem value="system">System</SelectItem>
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || 'all'}
          onValueChange={(value) => onFilterChange({ status: value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="unread">Unread</SelectItem>
            <SelectItem value="read">Read</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || 'all'}
          onValueChange={(value) => onFilterChange({ priority: value as any })}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
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
