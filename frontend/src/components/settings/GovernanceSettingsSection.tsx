import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import type { GovernanceSettings } from '@/types/settings'

interface GovernanceSettingsSectionProps {
  settings: GovernanceSettings
  onUpdate: (updates: Partial<GovernanceSettings>) => void
}

export default function GovernanceSettingsSection({
  settings,
  onUpdate,
}: GovernanceSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Governance Defaults</CardTitle>
        <CardDescription>
          Configure default policies and approval workflows for regulatory operations.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Default Inspection Frequency */}
        <div className="space-y-2">
          <Label htmlFor="inspectionFrequency">Default Inspection Frequency (days)</Label>
          <Input
            id="inspectionFrequency"
            type="number"
            value={settings.defaultInspectionFrequency}
            onChange={(e) =>
              onUpdate({ defaultInspectionFrequency: parseInt(e.target.value) })
            }
            min={1}
            max={365}
          />
          <p className="text-sm text-muted-foreground">
            How often facilities should be inspected by default
          </p>
        </div>

        {/* Compliance Grace Period */}
        <div className="space-y-2">
          <Label htmlFor="gracePeriod">Compliance Grace Period (days)</Label>
          <Input
            id="gracePeriod"
            type="number"
            value={settings.complianceGracePeriod}
            onChange={(e) =>
              onUpdate({ complianceGracePeriod: parseInt(e.target.value) })
            }
            min={0}
            max={90}
          />
          <p className="text-sm text-muted-foreground">
            Grace period for facilities to resolve non-compliance issues
          </p>
        </div>

        {/* Auto Approval Threshold */}
        <div className="space-y-2">
          <Label htmlFor="autoApproval">Auto-Approval Threshold (%)</Label>
          <Input
            id="autoApproval"
            type="number"
            value={settings.autoApprovalThreshold}
            onChange={(e) =>
              onUpdate({ autoApprovalThreshold: parseInt(e.target.value) })
            }
            min={0}
            max={100}
          />
          <p className="text-sm text-muted-foreground">
            Automatically approve applications scoring above this threshold
          </p>
        </div>

        {/* Dual Approval Required */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Require Dual Approval</Label>
            <p className="text-sm text-muted-foreground">
              Critical decisions require approval from two reviewers
            </p>
          </div>
          <Switch
            checked={settings.requireDualApproval}
            onCheckedChange={(checked) => onUpdate({ requireDualApproval: checked })}
          />
        </div>

        {/* Auto Reminders */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Auto Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Automatically send reminders for upcoming deadlines
            </p>
          </div>
          <Switch
            checked={settings.enableAutoReminders}
            onCheckedChange={(checked) => onUpdate({ enableAutoReminders: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
