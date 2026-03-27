import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { updateUser } from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import type { FrappeUser, PortalRole } from "@/types/user"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: FrappeUser | null
  onSuccess: () => void
}

const PORTAL_ROLES: PortalRole[] = ["Regulator Admin", "Inspection Manager", "Regulator User"]

function getPortalRole(roles: string[]): PortalRole | "" {
  return PORTAL_ROLES.find((r) => roles.includes(r)) ?? ""
}

export default function EditUserDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: EditUserDialogProps) {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [idNumber, setIdNumber] = useState("")
  const [phone, setPhone] = useState("")
  const [role, setRole] = useState<PortalRole | "">("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      // Backend returns full_name only (not first_name / last_name separately).
      // Split on the first space so multi-part last names stay intact.
      const fullName = (user.full_name || "").trim()
      const spaceIdx = fullName.indexOf(" ")
      const parsedFirst = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName
      const parsedLast = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : ""

      setFirstName(parsedFirst)
      setLastName(parsedLast)
      setIdNumber(user.username || "")
      setPhone(user.mobile_no || "")
      setRole(getPortalRole(user.roles))
      setError(null)
    }
  }, [user])

  const handleClose = () => {
    if (!submitting) {
      setError(null)
      onOpenChange(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setError(null)

    if (!firstName.trim() || !lastName.trim() || !role) {
      setError("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    try {
      await updateUser({
        user_id: user.name,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        username: idNumber.trim() || undefined,
        mobile_no: phone.trim() || undefined,
        roles: [role],
      })

      showSuccess(`User ${user.email} updated successfully`)
      onOpenChange(false)
      onSuccess()
    } catch (err: any) {
      const msg = err?.message || "Failed to update user."
      setError(msg)
      showError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>
            Update account details for <span className="font-medium">{user?.email}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input value={user?.email || ""} disabled className="font-mono bg-muted" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editFirstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editFirstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editLastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editLastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={submitting}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editIdNumber">ID Number</Label>
            <Input
              id="editIdNumber"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editPhone">Phone Number</Label>
            <Input
              id="editPhone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="editRole">
              Assigned Role <span className="text-destructive">*</span>
            </Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as PortalRole)}
              disabled={submitting}
            >
              <SelectTrigger id="editRole">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {PORTAL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
