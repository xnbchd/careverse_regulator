import { useState, useMemo, useEffect } from "react"
import { useResponsive } from "@/hooks/useResponsive"
import { useUserStore } from "@/stores/userStore"
import dayjs from "dayjs"
import {
  Calendar as CalendarIcon,
  AlertCircle,
  X,
  ChevronsUpDown,
  Check,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

interface ScheduleInspectionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  formData: {
    facility: string
    inspector: string
    date: string
    note: string
  }
  setFormData: (data: ScheduleInspectionModalProps["formData"]) => void
  facilities: Array<{ value: string; label: string }>
  loading?: boolean
  error?: string | null
}

export default function ScheduleInspectionModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  facilities,
  loading = false,
  error = null,
}: ScheduleInspectionModalProps) {
  const { isMobile } = useResponsive()
  const { inspectors, searchInspectors } = useUserStore()
  const [facilityOpen, setFacilityOpen] = useState(false)
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [inspectorSearchValue, setInspectorSearchValue] = useState("")
  const [searchedInspectors, setSearchedInspectors] = useState(inspectors)
  const [inspectorSearchLoading, setInspectorSearchLoading] = useState(false)

  const selectedDate = formData.date ? dayjs(formData.date, "DD/MM/YYYY").toDate() : undefined

  const selectedFacilityLabel = useMemo(
    () => facilities.find((f) => f.value === formData.facility)?.label || "",
    [facilities, formData.facility]
  )

  const selectedInspectorLabel = useMemo(() => {
    const allInspectors = [...inspectors, ...searchedInspectors]
    const inspector = allInspectors.find((i) => i.name === formData.inspector)
    return inspector?.full_name || ""
  }, [inspectors, searchedInspectors, formData.inspector])

  // Debounced search for inspectors
  useEffect(() => {
    if (!inspectorOpen) return

    const timer = setTimeout(async () => {
      if (inspectorSearchValue.trim().length === 0) {
        setSearchedInspectors(inspectors)
        return
      }

      setInspectorSearchLoading(true)
      try {
        const results = await searchInspectors(inspectorSearchValue)
        setSearchedInspectors(results)
      } catch (error) {
        console.error("Failed to search inspectors:", error)
        setSearchedInspectors(inspectors)
      } finally {
        setInspectorSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [inspectorSearchValue, inspectorOpen, inspectors, searchInspectors])

  // Reset search when modal opens/closes
  useEffect(() => {
    if (open) {
      setSearchedInspectors(inspectors)
      setInspectorSearchValue("")
    }
  }, [open, inspectors])

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className={cn(
          "gap-0 max-h-[90vh] flex flex-col p-0",
          isMobile ? "w-full h-full max-w-full rounded-none" : "max-w-[640px]"
        )}
      >
        <DialogHeader className="px-6 pt-6 pb-4 shrink-0 border-b">
          <DialogTitle className={cn("text-start", isMobile ? "text-base" : "text-lg")}>
            Facility Inspection
          </DialogTitle>
          <DialogDescription className={cn("text-start", isMobile ? "text-xs" : "text-sm")}>
            Fill in the details below to generate report
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex flex-col gap-4">
            {error && (
              <Alert variant="destructive" className="relative pr-10">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex-1">{error}</AlertDescription>
                <button
                  onClick={() => {}}
                  className="absolute top-3 right-3 text-destructive hover:text-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </Alert>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="facility" className="text-sm font-medium text-start">
                Facility <span className="text-destructive">*</span>
              </Label>
              <Popover open={facilityOpen} onOpenChange={setFacilityOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={facilityOpen}
                    className="w-full justify-between h-10"
                  >
                    <span className="truncate text-start">
                      {selectedFacilityLabel || "Select Facility"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command>
                    <CommandInput placeholder="Search facility..." />
                    <CommandList>
                      <CommandEmpty>No facility found.</CommandEmpty>
                      <CommandGroup>
                        {facilities.map((facility) => (
                          <CommandItem
                            key={facility.value}
                            value={facility.label}
                            onSelect={() => {
                              setFormData({ ...formData, facility: facility.value })
                              setFacilityOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 shrink-0",
                                formData.facility === facility.value ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <span className="truncate">{facility.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inspector" className="text-sm font-medium text-start">
                Inspector (User) <span className="text-destructive">*</span>
              </Label>
              <Popover open={inspectorOpen} onOpenChange={setInspectorOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={inspectorOpen}
                    className="w-full justify-between h-10"
                  >
                    <span className="truncate text-start">
                      {selectedInspectorLabel || "Select Inspector"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                >
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search inspector..."
                      value={inspectorSearchValue}
                      onValueChange={setInspectorSearchValue}
                    />
                    <CommandList>
                      {inspectorSearchLoading ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      ) : searchedInspectors.length === 0 ? (
                        <CommandEmpty>No inspector found.</CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {searchedInspectors.map((inspector) => (
                            <CommandItem
                              key={inspector.name}
                              value={inspector.full_name}
                              onSelect={() => {
                                setFormData({ ...formData, inspector: inspector.name })
                                setInspectorOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4 shrink-0",
                                  formData.inspector === inspector.name
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <span className="truncate">{inspector.full_name}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date" className="text-sm font-medium text-start">
                Set Inspection Date <span className="text-destructive">*</span>
              </Label>
              <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn(
                      "w-full h-10 justify-start text-left font-normal text-start",
                      !formData.date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                    <span className="truncate text-start">{formData.date || "Pick a date"}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData({ ...formData, date: dayjs(date).format("DD/MM/YYYY") })
                        setDatePickerOpen(false)
                      }
                    }}
                    disabled={(date) => {
                      const today = dayjs().startOf("day")
                      return dayjs(date).isBefore(today)
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="note" className="text-sm font-medium text-start">
                Note To Inspector
              </Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Check Safety Compliance"
                rows={4}
                className="resize-none w-full text-start"
              />
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t px-6 py-4 bg-background">
          <div className={cn("flex gap-3", isMobile ? "flex-col-reverse" : "flex-row")}>
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className={cn("flex-1", isMobile && "w-full")}
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmit}
              disabled={!formData.facility || !formData.inspector || !formData.date || loading}
              className={cn("flex-1", isMobile && "w-full")}
            >
              {loading ? "Scheduling..." : "Schedule Inspection"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
