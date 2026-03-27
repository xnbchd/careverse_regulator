import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FacilityLicensesDashboard } from './FacilityLicensesDashboard'
import { ApplicationsDashboard } from './ApplicationsDashboard'
import { LicenseAppealsDashboard } from './LicenseAppealsDashboard'
import { Scale, ShieldCheck, FileText } from 'lucide-react'

export function LicensesDashboard() {
  const [activeTab, setActiveTab] = useState('licenses')

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">License Management</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage health facility and professional licenses and applications
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="licenses" className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" />
            Licenses
          </TabsTrigger>
          <TabsTrigger value="applications" className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            Applications
          </TabsTrigger>
          <TabsTrigger value="appeals" className="flex items-center gap-1.5">
            <Scale className="h-4 w-4" />
            Appeals
          </TabsTrigger>
        </TabsList>

        <TabsContent value="licenses" className="mt-6">
          <FacilityLicensesDashboard />
        </TabsContent>

        <TabsContent value="applications" className="mt-6">
          <ApplicationsDashboard />
        </TabsContent>

        <TabsContent value="appeals" className="mt-6">
          <LicenseAppealsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
