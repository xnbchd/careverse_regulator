import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Save, RotateCcw, AlertCircle } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'
import { toast } from 'sonner'
import GovernanceSettingsSection from './GovernanceSettingsSection'
import ThresholdSettingsSection from './ThresholdSettingsSection'
import SystemSettingsSection from './SystemSettingsSection'

export default function RegulatorSettingsView() {
  const {
    settings,
    hasChanges,
    isSaving,
    initialize,
    updateGovernance,
    updateThresholds,
    updateSystem,
    saveSettings,
    resetSettings,
    resetToDefaults,
  } = useSettingsStore()

  useEffect(() => {
    initialize()
  }, [initialize])

  const handleSave = async () => {
    try {
      await saveSettings()
      toast.success('Settings saved successfully')
    } catch (error) {
      toast.error('Failed to save settings')
    }
  }

  const handleReset = () => {
    resetSettings()
    toast.info('Changes discarded')
  }

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
      resetToDefaults()
      toast.info('Settings reset to defaults')
    }
  }

  return (
    <div className="space-y-6">
      {/* Unsaved Changes Banner */}
      {hasChanges && (
        <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
                  You have unsaved changes
                </p>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  Remember to save your changes before leaving this page.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  disabled={isSaving}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Discard
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="governance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="thresholds">Thresholds</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="governance" className="space-y-4">
          <GovernanceSettingsSection
            settings={settings.governance}
            onUpdate={updateGovernance}
          />
        </TabsContent>

        <TabsContent value="thresholds" className="space-y-4">
          <ThresholdSettingsSection
            settings={settings.thresholds}
            onUpdate={updateThresholds}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemSettingsSection
            settings={settings.system}
            onUpdate={updateSystem}
          />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleResetDefaults}
              disabled={isSaving}
            >
              Reset to Defaults
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard Changes
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
