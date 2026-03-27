import { useState } from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import dayjs, { Dayjs } from "dayjs"
import type { DateRange as CalendarDateRange } from "react-day-picker"

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
  const [tempRange, setTempRange] = useState<CalendarDateRange | undefined>(undefined)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  const presets = [
    {
      key: "today",
      label: "Today",
      getValue: () => {
        const today = dayjs()
        return {
          start: today.format("YYYY-MM-DD"),
          end: today.format("YYYY-MM-DD"),
          label: `Today (${today.format("MMM D")})`,
        }
      },
    },
    {
      key: "7d",
      label: "Last 7 days",
      getValue: () => {
        const end = dayjs()
        const start = end.subtract(6, "day")
        return {
          start: start.format("YYYY-MM-DD"),
          end: end.format("YYYY-MM-DD"),
          label: `Last 7 days (${start.format("MMM D")} - ${end.format("MMM D")})`,
        }
      },
    },
    {
      key: "30d",
      label: "Last 30 days",
      getValue: () => {
        const end = dayjs()
        const start = end.subtract(29, "day")
        return {
          start: start.format("YYYY-MM-DD"),
          end: end.format("YYYY-MM-DD"),
          label: `Last 30 days (${start.format("MMM D")} - ${end.format("MMM D")})`,
        }
      },
    },
    {
      key: "thisMonth",
      label: "This Month",
      getValue: () => {
        const start = dayjs().startOf("month")
        const end = dayjs().endOf("month")
        return {
          start: start.format("YYYY-MM-DD"),
          end: end.format("YYYY-MM-DD"),
          label: `This Month (${start.format("MMM D")} - ${end.format("MMM D")})`,
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
      setTempRange(undefined)
      setOpen(false)
    }
  }

  const handleCustomApply = () => {
    if (tempRange?.from && tempRange?.to) {
      const start = dayjs(tempRange.from)
      const end = dayjs(tempRange.to)
      onChange({
        start: start.format("YYYY-MM-DD"),
        end: end.format("YYYY-MM-DD"),
        label: `${start.format("MMM D")} - ${end.format("MMM D, YYYY")}`,
      })
      setSelectedPreset("custom")
      setOpen(false)
    }
  }

  const handleClear = () => {
    onChange(null)
    setTempRange(undefined)
    setSelectedPreset(null)
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // Initialize temp range with current value if exists
      if (value) {
        setTempRange({
          from: dayjs(value.start).toDate(),
          to: dayjs(value.end).toDate(),
        })
      }
    } else {
      setTempRange(undefined)
    }
    setOpen(newOpen)
  }

  const content = (
    <div className="p-3">
      <div className="mb-4">
        <div className="text-sm font-semibold mb-3 text-start">Select Date Range</div>

        {/* Preset Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((preset) => (
            <Button
              key={preset.key}
              size="sm"
              variant={selectedPreset === preset.key ? "default" : "outline"}
              onClick={() => handlePresetClick(preset.key)}
            >
              {preset.label}
            </Button>
          ))}
        </div>

        {/* Custom Date Picker */}
        <div className="mb-3">
          <div className="text-xs font-medium text-muted-foreground mb-2 text-start">
            Or select custom range:
          </div>
          <Calendar
            mode="range"
            selected={tempRange}
            onSelect={(range) => {
              setTempRange(range)
              setSelectedPreset("custom")
            }}
            numberOfMonths={1}
            className="rounded-md border"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-3 border-t border-border">
        <Button variant="outline" className="flex-1" onClick={handleClear}>
          Clear
        </Button>
        <Button
          className="flex-1"
          onClick={handleCustomApply}
          disabled={!tempRange?.from || !tempRange?.to}
        >
          Apply
        </Button>
      </div>
    </div>
  )

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex items-center gap-2",
            value && "bg-blue-50 border-primary text-primary dark:bg-blue-950"
          )}
        >
          <CalendarIcon className="w-4 h-4 shrink-0" />
          {showLabel && <span className="truncate">{value ? value.label : "Date Range"}</span>}
          {!showLabel && value && <span className="text-xs">●</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        {content}
      </PopoverContent>
    </Popover>
  )
}
