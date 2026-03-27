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
import { Loader2 } from "lucide-react"
import { deleteUser, updateUser } from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import type { FrappeUser } from "@/types/user"

interface DisableUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: FrappeUser | null
  action: "disable" | "enable"
  onSuccess: () => void
}

export default function DisableUserDialog({
  open,
  onOpenChange,
  user,
  action,
  onSuccess,
}: DisableUserDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const handleConfirm = async () => {
    if (!user) return

    setSubmitting(true)
    try {
      if (action === "disable") {
        await deleteUser(user.name)
        showSuccess(`${user.full_name || user.email} has been disabled`)
      } else {
        await updateUser({ user_id: user.name, enabled: 1 })
        showSuccess(`${user.full_name || user.email} has been enabled`)
      }
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      showError(err?.message || `Failed to ${action} user`)
    } finally {
      setSubmitting(false)
    }
  }

  const displayName = user?.full_name || user?.email || "this user"

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {action === "disable" ? "Disable User Account" : "Enable User Account"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action === "disable" ? (
              <>
                This will disable <span className="font-medium text-foreground">{displayName}</span>
                &apos;s account. They will no longer be able to log in to the portal.
              </>
            ) : (
              <>
                This will re-enable{" "}
                <span className="font-medium text-foreground">{displayName}</span>&apos;s account.
                They will be able to log in again.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant={action === "disable" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {action === "disable" ? "Disabling..." : "Enabling..."}
              </>
            ) : action === "disable" ? (
              "Disable User"
            ) : (
              "Enable User"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
