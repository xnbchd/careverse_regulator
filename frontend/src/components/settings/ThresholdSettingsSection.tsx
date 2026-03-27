import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ThresholdSettings } from "@/types/settings"

interface ThresholdSettingsSectionProps {
  settings: ThresholdSettings
  onUpdate: (updates: Partial<ThresholdSettings>) => void
}

export default function ThresholdSettingsSection({
  settings,
  onUpdate,
}: ThresholdSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Threshold Rules</CardTitle>
        <CardDescription>
          Define warning and critical thresholds for compliance monitoring.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Critical Finding Threshold */}
        <div className="space-y-2">
          <Label htmlFor="criticalThreshold">Critical Finding Threshold</Label>
          <Input
            id="criticalThreshold"
            type="number"
            value={settings.criticalFindingThreshold}
            onChange={(e) => onUpdate({ criticalFindingThreshold: parseInt(e.target.value) })}
            min={1}
            max={10}
          />
          <p className="text-sm text-muted-foreground">
            Number of critical findings before escalation
          </p>
        </div>

        {/* Overdue Warning Days */}
        <div className="space-y-2">
          <Label htmlFor="warningDays">Overdue Warning (days)</Label>
          <Input
            id="warningDays"
            type="number"
            value={settings.overdueDaysWarning}
            onChange={(e) => onUpdate({ overdueDaysWarning: parseInt(e.target.value) })}
            min={1}
            max={30}
          />
          <p className="text-sm text-muted-foreground">
            Days past due before showing warning status
          </p>
        </div>

        {/* Overdue Critical Days */}
        <div className="space-y-2">
          <Label htmlFor="criticalDays">Overdue Critical (days)</Label>
          <Input
            id="criticalDays"
            type="number"
            value={settings.overdueDaysCritical}
            onChange={(e) => onUpdate({ overdueDaysCritical: parseInt(e.target.value) })}
            min={1}
            max={60}
          />
          <p className="text-sm text-muted-foreground">
            Days past due before showing critical status
          </p>
        </div>

        {/* Minimum Staff Requirement */}
        <div className="space-y-2">
          <Label htmlFor="minStaff">Minimum Staff Requirement</Label>
          <Input
            id="minStaff"
            type="number"
            value={settings.minStaffRequirement}
            onChange={(e) => onUpdate({ minStaffRequirement: parseInt(e.target.value) })}
            min={1}
            max={50}
          />
          <p className="text-sm text-muted-foreground">
            Minimum staff count required for facility operations
          </p>
        </div>

        {/* Facility Capacity Threshold */}
        <div className="space-y-2">
          <Label htmlFor="capacityThreshold">Facility Capacity Threshold (%)</Label>
          <Input
            id="capacityThreshold"
            type="number"
            value={settings.facilityCapacityThreshold}
            onChange={(e) => onUpdate({ facilityCapacityThreshold: parseInt(e.target.value) })}
            min={0}
            max={100}
          />
          <p className="text-sm text-muted-foreground">
            Alert when facility utilization exceeds this percentage
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
