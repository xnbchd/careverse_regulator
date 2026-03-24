import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SystemSettings } from '@/types/settings'

interface SystemSettingsSectionProps {
  settings: SystemSettings
  onUpdate: (updates: Partial<SystemSettings>) => void
}

export default function SystemSettingsSection({
  settings,
  onUpdate,
}: SystemSettingsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>System Preferences</CardTitle>
        <CardDescription>
          Configure notification preferences, regional settings, and display options.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable Notifications */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive notifications for important updates and alerts
            </p>
          </div>
          <Switch
            checked={settings.enableNotifications}
            onCheckedChange={(checked) => onUpdate({ enableNotifications: checked })}
          />
        </div>

        {/* Notification Frequency */}
        <div className="space-y-2">
          <Label htmlFor="notificationFreq">Notification Frequency</Label>
          <Select
            value={settings.notificationFrequency}
            onValueChange={(value: any) => onUpdate({ notificationFrequency: value })}
          >
            <SelectTrigger id="notificationFreq">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily Digest</SelectItem>
              <SelectItem value="weekly">Weekly Summary</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            How often you receive notification updates
          </p>
        </div>

        {/* Default Language */}
        <div className="space-y-2">
          <Label htmlFor="language">Default Language</Label>
          <Select
            value={settings.defaultLanguage}
            onValueChange={(value) => onUpdate({ defaultLanguage: value })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="sw">Swahili</SelectItem>
              <SelectItem value="fr">French</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Preferred language for the interface
          </p>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select
            value={settings.timezone}
            onValueChange={(value) => onUpdate({ timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
              <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
              <SelectItem value="Africa/Cairo">Central Africa Time (CAT)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Your local timezone for date and time display
          </p>
        </div>

        {/* Date Format */}
        <div className="space-y-2">
          <Label htmlFor="dateFormat">Date Format</Label>
          <Select
            value={settings.dateFormat}
            onValueChange={(value) => onUpdate({ dateFormat: value })}
          >
            <SelectTrigger id="dateFormat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY (25/03/2026)</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY (03/25/2026)</SelectItem>
              <SelectItem value="YYYY-MM-DD">YYYY-MM-DD (2026-03-25)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Preferred format for displaying dates
          </p>
        </div>

        {/* Dark Mode */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Enable Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Use dark theme for reduced eye strain
            </p>
          </div>
          <Switch
            checked={settings.enableDarkMode}
            onCheckedChange={(checked) => onUpdate({ enableDarkMode: checked })}
          />
        </div>
      </CardContent>
    </Card>
  )
}
