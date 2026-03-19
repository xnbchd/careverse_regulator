import { useState } from 'react'
import { Button, DatePicker, Popover, Space } from 'antd'
import { CalendarOutlined } from '@ant-design/icons'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

export interface DateRange {
  start: string // YYYY-MM-DD
  end: string // YYYY-MM-DD
  label: string // e.g., "Last 7 days (Mar 12-19)"
}

interface DateRangeSelectorProps {
  value: DateRange | null
  onChange: (range: DateRange | null) => void
  showLabel?: boolean
}

export default function DateRangeSelector({
  value,
  onChange,
  showLabel = true,
}: DateRangeSelectorProps) {
  const [open, setOpen] = useState(false)
  const [tempRange, setTempRange] = useState<[Dayjs, Dayjs] | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const presets = [
    {
      key: 'today',
      label: 'Today',
      getValue: () => {
        const today = dayjs()
        return {
          start: today.format('YYYY-MM-DD'),
          end: today.format('YYYY-MM-DD'),
          label: `Today (${today.format('MMM D')})`,
        }
      },
    },
    {
      key: '7d',
      label: 'Last 7 days',
      getValue: () => {
        const end = dayjs()
        const start = end.subtract(6, 'day')
        return {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD'),
          label: `Last 7 days (${start.format('MMM D')} - ${end.format('MMM D')})`,
        }
      },
    },
    {
      key: '30d',
      label: 'Last 30 days',
      getValue: () => {
        const end = dayjs()
        const start = end.subtract(29, 'day')
        return {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD'),
          label: `Last 30 days (${start.format('MMM D')} - ${end.format('MMM D')})`,
        }
      },
    },
    {
      key: 'thisMonth',
      label: 'This Month',
      getValue: () => {
        const start = dayjs().startOf('month')
        const end = dayjs().endOf('month')
        return {
          start: start.format('YYYY-MM-DD'),
          end: end.format('YYYY-MM-DD'),
          label: `This Month (${start.format('MMM D')} - ${end.format('MMM D')})`,
        }
      },
    },
  ]

  const handlePresetClick = (presetKey: string) => {
    const preset = presets.find((p) => p.key === presetKey)
    if (preset) {
      const range = preset.getValue()
      onChange(range)
      setSelectedPreset(presetKey)
      setTempRange(null)
      setOpen(false)
    }
  }

  const handleCustomApply = () => {
    if (tempRange && tempRange[0] && tempRange[1]) {
      const [start, end] = tempRange
      onChange({
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
        label: `${start.format('MMM D')} - ${end.format('MMM D, YYYY')}`,
      })
      setSelectedPreset('custom')
      setOpen(false)
    }
  }

  const handleClear = () => {
    onChange(null)
    setTempRange(null)
    setSelectedPreset(null)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Initialize temp range with current value if exists
      if (value) {
        setTempRange([dayjs(value.start), dayjs(value.end)])
      }
    } else {
      setTempRange(null)
    }
    setOpen(newOpen)
  }

  const content = (
    <div style={{ width: '380px', padding: '12px' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
          Select Date Range
        </div>

        {/* Preset Buttons */}
        <Space size={8} wrap style={{ marginBottom: '16px' }}>
          {presets.map((preset) => (
            <Button
              key={preset.key}
              size="small"
              type={selectedPreset === preset.key ? 'primary' : 'default'}
              onClick={() => handlePresetClick(preset.key)}
              style={
                selectedPreset === preset.key
                  ? {
                      backgroundColor: '#11b5a1',
                      borderColor: '#11b5a1',
                    }
                  : undefined
              }
            >
              {preset.label}
            </Button>
          ))}
        </Space>

        {/* Custom Date Picker */}
        <div style={{ marginBottom: '12px' }}>
          <div
            style={{ fontSize: '13px', fontWeight: 500, color: '#667085', marginBottom: '8px' }}
          >
            Or select custom range:
          </div>
          <RangePicker
            value={tempRange}
            onChange={(dates) => {
              setTempRange(dates as [Dayjs, Dayjs] | null)
              setSelectedPreset('custom')
            }}
            style={{ width: '100%' }}
            format="MMM D, YYYY"
            allowClear
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{ display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #EAECF0' }}
      >
        <Button style={{ flex: 1 }} onClick={handleClear}>
          Clear
        </Button>
        <Button
          type="primary"
          style={{
            flex: 1,
            backgroundColor: '#11b5a1',
            borderColor: '#11b5a1',
          }}
          onClick={handleCustomApply}
          disabled={!tempRange}
        >
          Apply
        </Button>
      </div>
    </div>
  )

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
    >
      <Button
        icon={<CalendarOutlined />}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: value ? '#F0F9FF' : undefined,
          borderColor: value ? '#11b5a1' : undefined,
          color: value ? '#11b5a1' : undefined,
        }}
      >
        {showLabel && (value ? value.label : 'Date Range')}
        {!showLabel && value && <span style={{ fontSize: '10px' }}>●</span>}
      </Button>
    </Popover>
  )
}
