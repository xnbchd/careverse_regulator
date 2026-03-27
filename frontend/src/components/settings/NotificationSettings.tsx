import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useNotificationStore, createNotification } from "@/stores/notificationStore"
import { toast } from "sonner"

export default function NotificationSettings() {
  const { preferences, updatePreferences, addNotification } = useNotificationStore()

  const handleToggleEnabled = (enabled: boolean) => {
    updatePreferences({ enabled })
    toast.success(`Notifications ${enabled ? "enabled" : "disabled"}`)
  }

  const handleToggleToasts = (showToasts: boolean) => {
    updatePreferences({ showToasts })
  }

  const handleToggleSound = (playSound: boolean) => {
    updatePreferences({ playSound })
    if (playSound) {
      toast.success("Sound notifications enabled")
    }
  }

  const handleToggleCategory = (
    category: keyof typeof preferences.categories,
    enabled: boolean
  ) => {
    updatePreferences({
      categories: {
        ...preferences.categories,
        [category]: enabled,
      },
    })
  }

  const handleTestNotification = () => {
    addNotification(createNotification.systemUpdate("This is a test notification"))
    toast.success("Test notification sent")
  }

  const categoryLabels = {
    affiliation: "Affiliations",
    license: "Licenses",
    inspection: "Inspections",
    system: "System",
    bulk_action: "Bulk Actions",
  }

  const categoryDescriptions = {
    affiliation: "Professional affiliation approvals and status changes",
    license: "License approvals, denials, renewals, and expiry warnings",
    inspection: "Inspection scheduling and completion notifications",
    system: "System updates, maintenance, and important announcements",
    bulk_action: "Completion status of bulk operations",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Notification Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage how you receive notifications and alerts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Control your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important events
              </p>
            </div>
            <Switch checked={preferences.enabled} onCheckedChange={handleToggleEnabled} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Show Toast Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Display temporary notifications on screen
              </p>
            </div>
            <Switch
              checked={preferences.showToasts}
              onCheckedChange={handleToggleToasts}
              disabled={!preferences.enabled}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Play Sound</Label>
              <p className="text-sm text-muted-foreground">
                Play a sound when receiving notifications
              </p>
            </div>
            <Switch
              checked={preferences.playSound}
              onCheckedChange={handleToggleSound}
              disabled={!preferences.enabled}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Categories</CardTitle>
          <CardDescription>Choose which types of notifications you want to receive</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(preferences.categories).map(([category, enabled]) => (
            <div key={category}>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>{categoryLabels[category as keyof typeof categoryLabels]}</Label>
                  <p className="text-sm text-muted-foreground">
                    {categoryDescriptions[category as keyof typeof categoryDescriptions]}
                  </p>
                </div>
                <Switch
                  checked={enabled}
                  onCheckedChange={(checked) =>
                    handleToggleCategory(category as keyof typeof preferences.categories, checked)
                  }
                  disabled={!preferences.enabled}
                />
              </div>
              {category !== "bulk_action" && <Separator className="mt-6" />}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Test Notifications</CardTitle>
          <CardDescription>Send a test notification to see how it appears</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestNotification} disabled={!preferences.enabled}>
            Send Test Notification
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
