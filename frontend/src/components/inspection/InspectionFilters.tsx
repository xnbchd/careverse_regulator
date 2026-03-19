import { useState } from 'react'
import { Input, Button, Popover, Radio, Space, Badge } from 'antd'
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import DateRangeSelector, { type DateRange } from './DateRangeSelector'
import FilterTags, { type FilterTag } from './FilterTags'

interface InspectionFiltersProps {
  searchText: string
  onSearchChange: (value: string) => void
  selectedStatuses: string[]
  onStatusChange: (statuses: string[]) => void
  sortOrder: 'asc' | 'desc' | 'recent'
  onSortChange: (order: 'asc' | 'desc' | 'recent') => void
  dateRange: DateRange | null
  onDateRangeChange: (range: DateRange | null) => void
  activeFilterCount?: number
}

export default function InspectionFilters({
  searchText,
  onSearchChange,
  selectedStatuses,
  onStatusChange,
  sortOrder,
  onSortChange,
  dateRange,
  onDateRangeChange,
  activeFilterCount = 0,
}: InspectionFiltersProps) {
  const [filterOpen, setFilterOpen] = useState(false)
  const [sortOpen, setSortOpen] = useState(false)
  const [tempStatuses, setTempStatuses] = useState(selectedStatuses)
  const { isMobile } = useResponsive()

  // Build filter tags
  const filterTags: FilterTag[] = []

  // Status filter tag
  if (!selectedStatuses.includes('all')) {
    const statusLabel = selectedStatuses[0] === 'completed'
      ? 'Completed'
      : selectedStatuses[0] === 'non compliant'
      ? 'Non Compliant'
      : 'Pending'
    filterTags.push({
      key: 'status',
      label: `Status: ${statusLabel}`,
      onRemove: () => onStatusChange(['all']),
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
    onStatusChange(['all'])
    onDateRangeChange(null)
    onSearchChange('')
  }

  const handleApplyFilter = () => {
    onStatusChange(tempStatuses)
    setFilterOpen(false)
  }

  const handleFilterOpenChange = (open: boolean) => {
    if (open) {
      setTempStatuses(selectedStatuses)
    }
    setFilterOpen(open)
  }

  const filterContent = (
    <div style={{ width: '280px', padding: '8px' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
          Filter by Status
        </div>
        <Radio.Group
          value={tempStatuses.includes('all') ? 'all' : tempStatuses[0]}
          onChange={(e) => {
            const value = e.target.value
            if (value === 'all') {
              setTempStatuses(['all'])
            } else {
              setTempStatuses([value])
            }
          }}
          style={{ width: '100%' }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Radio value="all">All Statuses</Radio>
            <Radio value="completed">Completed</Radio>
            <Radio value="non compliant">Non Compliant</Radio>
            <Radio value="pending">Pending</Radio>
          </Space>
        </Radio.Group>
      </div>
      <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: '1px solid #EAECF0' }}>
        <Button
          style={{ flex: 1 }}
          onClick={() => {
            setTempStatuses(['all'])
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
      <Radio.Group
        value={sortOrder}
        onChange={(e) => {
          onSortChange(e.target.value)
          setSortOpen(false)
        }}
        style={{ width: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <Radio value="asc">Facility Name (A-Z)</Radio>
          <Radio value="desc">Facility Name (Z-A)</Radio>
          <Radio value="recent">Most Recent</Radio>
        </Space>
      </Radio.Group>
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
