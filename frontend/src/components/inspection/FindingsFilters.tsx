import { useState } from 'react'
import { Input, Button, Popover, Checkbox, Space, Badge } from 'antd'
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import DateRangeSelector, { type DateRange } from './DateRangeSelector'
import FilterTags, { type FilterTag } from './FilterTags'

interface FindingsFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedSeverities: string[]
  onSeverityChange: (severities: string[]) => void
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortOrder: 'asc' | 'desc' | 'recent'
  onSortChange: (order: 'asc' | 'desc' | 'recent') => void
  dateRange: DateRange | null
  onDateRangeChange: (range: DateRange | null) => void
  activeFilterCount?: number
}

export default function FindingsFilters({
  searchText,
  onSearchChange,
  selectedSeverities,
  onSeverityChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount = 0,
}: FindingsFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [tempSeverities, setTempSeverities] = useState(selectedSeverities)
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses)
  const { isMobile } = useResponsive()

  // Build filter tags
  const filterTags: FilterTag[] = []

  // Severity filter tags
  if (!selectedSeverities.includes('all')) {
    selectedSeverities.forEach((severity) => {
      if (severity !== 'all') {
        const label = severity.charAt(0).toUpperCase() + severity.slice(1)
        filterTags.push({
          key: `severity-${severity}`,
          label: `Severity: ${label}`,
          onRemove: () => {
            const newSeverities = selectedSeverities.filter(s => s !== severity)
            onSeverityChange(newSeverities.length === 0 ? ['all'] : newSeverities)
          },
        })
      }
    })
  }

  // Status filter tags
  if (!selectedStatuses.includes('all')) {
    selectedStatuses.forEach((status) => {
      if (status !== 'all') {
        const label = status.charAt(0).toUpperCase() + status.slice(1)
        filterTags.push({
          key: `status-${status}`,
          label: `Status: ${label}`,
          onRemove: () => {
            const newStatuses = selectedStatuses.filter(s => s !== status)
            onStatusChange(newStatuses.length === 0 ? ['all'] : newStatuses)
          },
        })
      }
    })
  }

  // Date range filter tag
  if (dateRange) {
    filterTags.push({
      key: 'date',
      label: dateRange.label,
      onRemove: () => onDateRangeChange(null),
    })
  }

  // Search filter tag
  if (searchText) {
    filterTags.push({
      key: 'search',
      label: `Search: "${searchText}"`,
      onRemove: () => onSearchChange(''),
    })
  }

  const handleClearAllFilters = () => {
    onSeverityChange(['all'])
    onStatusChange(['all'])
    onDateRangeChange(null)
    onSearchChange('')
  }

  const handleApplyFilter = () => {
    onSeverityChange(tempSeverities)
    onStatusChange(tempStatuses)
    setFilterOpen(false)
  }

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempSeverities(selectedSeverities)
      setTempStatuses(selectedStatuses)
    }
    setFilterOpen(open)
  }

  const filterContent = (
    <div style={{ width: '280px', padding: '8px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
          Filter by Severity
        </div>
        <Checkbox.Group
          value={tempSeverities}
          onChange={(values) => setTempSeverities(values as string[])}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox value="all">All Severities</Checkbox>
            <Checkbox value="critical">Critical</Checkbox>
            <Checkbox value="major">Major</Checkbox>
            <Checkbox value="minor">Minor</Checkbox>
          </Space>
        </Checkbox.Group>
      </div>

      <div style={{ marginBottom: '12px', paddingTop: '12px', borderTop: '1px solid #EAECF0' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
          Filter by Status
        </div>
        <Checkbox.Group
          value={tempStatuses}
          onChange={(values) => setTempStatuses(values as string[])}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Checkbox value="all">All Statuses</Checkbox>
            <Checkbox value="open">Open</Checkbox>
            <Checkbox value="in progress">In Progress</Checkbox>
            <Checkbox value="resolved">Resolved</Checkbox>
          </Space>
        </Checkbox.Group>
      </div>

      <div style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #EAECF0' }}>
        <Button
          style={{ flex: 1 }}
          onClick={() => {
            setTempSeverities(['all'])
            setTempStatuses(['all'])
            onSeverityChange(['all'])
            onStatusChange(['all'])
            setFilterOpen(false)
          }}
        >
          Clear
        </Button>
        <Button
          type="primary"
          style={{
            flex: 1,
            backgroundColor: '#11b5a1',
            borderColor: '#11b5a1',
          }}
          onClick={handleApplyFilter}
        >
          Apply
        </Button>
      </div>
    </div>
  )

  const sortContent = (
    <div style={{ width: '220px', padding: '8px' }}>
      <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
        Sort by
      </div>
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          type={sortOrder === 'asc' ? 'primary' : 'text'}
          block
          style={sortOrder === 'asc' ? { backgroundColor: '#11b5a1', borderColor: '#11b5a1' } : {}}
          onClick={() => {
            onSortChange('asc')
            setSortOpen(false)
          }}
        >
          Facility Name (A-Z)
        </Button>
        <Button
          type={sortOrder === 'desc' ? 'primary' : 'text'}
          block
          style={sortOrder === 'desc' ? { backgroundColor: '#11b5a1', borderColor: '#11b5a1' } : {}}
          onClick={() => {
            onSortChange('desc')
            setSortOpen(false)
          }}
        >
          Facility Name (Z-A)
        </Button>
        <Button
          type={sortOrder === 'recent' ? 'primary' : 'text'}
          block
          style={sortOrder === 'recent' ? { backgroundColor: '#11b5a1', borderColor: '#11b5a1' } : {}}
          onClick={() => {
            onSortChange('recent')
            setSortOpen(false)
          }}
        >
          Most Recent
        </Button>
      </Space>
    </div>
  )

  return (
    <div style={{ width: isMobile ? '100%' : 'auto' }}>
      {/* Filter Controls */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: filterTags.length > 0 ? '12px' : 0 }}>
        <Input
          placeholder="Search by facility name"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{ width: isMobile ? '100%' : 400 }}
        />
        <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Popover
              content={filterContent}
              title={null}
              trigger="click"
              open={filterOpen}
              onOpenChange={handleFilterOpenChange}
              placement="bottomRight"
            >
              <Badge count={activeFilterCount} offset={[-8, 8]}>
                <Button
                  icon={<FilterOutlined />}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: isMobile ? 1 : 'none' }}
                >
                  {!isMobile && 'Filters'}
                </Button>
              </Badge>
            </Popover>
          </div>

          <DateRangeSelector
            value={dateRange}
            onChange={onDateRangeChange}
            showLabel={!isMobile}
          />

          <Popover
            content={sortContent}
            title={null}
            trigger="click"
            open={sortOpen}
            onOpenChange={setSortOpen}
            placement="bottomRight"
          >
            <Button
              icon={<SortAscendingOutlined />}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: isMobile ? 1 : 'none' }}
            >
              {!isMobile && 'Sort'}
            </Button>
          </Popover>
        </div>
      </div>

      {/* Active Filter Tags */}
      <FilterTags tags={filterTags} onClearAll={filterTags.length > 1 ? handleClearAllFilters : undefined} />
    </div>
  )
}
