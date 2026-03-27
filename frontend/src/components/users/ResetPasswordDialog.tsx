import { useState } from "react"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Loader2, KeyRound } from "lucide-react"
import { triggerPasswordReset } from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import { useNotificationStore } from "@/stores/notificationStore"
import type { FrappeUser } from "@/types/user"

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: FrappeUser | null
}

export default function ResetPasswordDialog({
  open,
  onOpenChange,
  user,
}: ResetPasswordDialogProps) {
  const [submitting, setSubmitting] = useState(false)
  const addNotification = useNotificationStore((s) => s.addNotification)

  const handleConfirm = async () => {
    if (!user) return

    setSubmitting(true)
    try {
      await triggerPasswordReset(user.name)

      showSuccess(`Password reset email sent to ${user.email}`)
      addNotification({
        type: "info",
        category: "system",
        title: "Password Reset Sent",
        message: `Password reset email sent to ${user.email}.`,
        actionUrl: "/users-roles",
        actionLabel: "View Users",
      })

      onOpenChange(false)
    } catch (err: any) {
      showError(err?.message || "Failed to send password reset email")
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user?.full_name || user?.email || "this user"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Reset Password
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3">
              <p>
                You are about to reset the password for{" "}
                <span className="font-medium text-foreground">{displayName}</span> ({user?.email}).
              </p>
              <div className="bg-muted/50 border border-border rounded-lg p-3 space-y-1.5">
                <p className="text-sm font-medium text-foreground">
                  The following actions will be taken:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                  <li>Current password will be invalidated</li>
                  <li>
                    A password reset link will be sent to{" "}
                    <span className="font-mono text-foreground">{user?.email}</span>
                  </li>
                  <li>User will be prompted to set a new password upon next login</li>
                </ul>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
