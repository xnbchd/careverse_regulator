import { createFileRoute, useNavigate } from '@tanstack/react-router'
import AppLayout from '@/components/AppLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, RefreshCw, AlertCircle, Save } from 'lucide-react'
import { useFormsStore } from '@/stores/formsStore'
import { useAuthStore } from '@/stores/authStore'
import { format } from 'date-fns'

export const Route = createFileRoute('/forms')({
  component: FormsPage,
})

function FormsPage() {
  const navigate = useNavigate()
  const { drafts, deleteDraft } = useFormsStore()
  const user = useAuthStore((state) => state.user)

  const handleNavigate = (route: string) => {
    navigate({ to: `/${route}` as any })
  }

  const handleLogout = () => {
    window.location.href = '/logout?redirect-to=/'
  }

  const handleSwitchToDesk = () => {
    window.location.href = '/app'
  }

  const getFormTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      license_application: 'License Application',
      license_renewal: 'License Renewal',
      license_appeal: 'License Appeal',
    }
    return labels[type] || type
  }

  return (
    <AppLayout
      currentRoute="forms"
      pageTitle="Forms"
      pageSubtitle="Submit applications, renewals, and appeals"
      onNavigate={handleNavigate}
      onOpenNotifications={() => handleNavigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={handleSwitchToDesk}
      user={user}
    >
      <div className="space-y-6">
        {/* New Forms Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Start New Form</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  License Application
                </CardTitle>
                <CardDescription>Apply for a new facility license</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => alert('License application form - implementation pending')}
                >
                  Start Application
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  License Renewal
                </CardTitle>
                <CardDescription>Renew an existing license</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => alert('License renewal form - implementation pending')}
                >
                  Start Renewal
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Submit Appeal
                </CardTitle>
                <CardDescription>Appeal a license decision</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  className="w-full"
                  onClick={() => alert('Appeal submission form - implementation pending')}
                >
                  Start Appeal
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Saved Drafts Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Saved Drafts</h2>
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Save className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No saved drafts</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your progress will be automatically saved as you fill out forms
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {drafts.map((draft) => (
                <Card key={draft.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{getFormTypeLabel(draft.formType)}</CardTitle>
                        <CardDescription>
                          Last saved: {format(new Date(draft.lastSaved), 'PPp')}
                          {' • '}
                          Step {draft.currentStep + 1}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            alert(
                              `Continue draft ${draft.id} - Form implementation pending`
                            )
                          }
                        >
                          Continue
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => {
                            if (
                              confirm(
                                'Are you sure you want to delete this draft? This action cannot be undone.'
                              )
                            ) {
                              deleteDraft(draft.id)
                            }
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card>
          <CardHeader>
            <CardTitle>Form Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>Auto-save:</strong> Your progress is automatically saved as you complete each
              step
            </p>
            <p>
              <strong>Draft Expiration:</strong> Saved drafts expire after 30 days of inactivity
            </p>
            <p>
              <strong>Required Documents:</strong> Please have all required documents ready before
              starting
            </p>
            <p>
              <strong>Help:</strong> Contact support if you need assistance completing forms
            </p>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
