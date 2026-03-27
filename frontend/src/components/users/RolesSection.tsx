import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, UserPlus, X, Loader2, AlertCircle, Shield } from "lucide-react"
import { updateUser } from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import type { RoleDefinition, FrappeUser, PortalRole } from "@/types/user"

const ROLE_COLORS: Record<string, string> = {
  "Regulator Admin": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  "Inspection Manager": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  "Regulator User": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
}

const ROLE_BORDER_COLORS: Record<string, string> = {
  "Regulator Admin": "border-purple-200 dark:border-purple-800/50",
  "Inspection Manager": "border-blue-200 dark:border-blue-800/50",
  "Regulator User": "border-green-200 dark:border-green-800/50",
}

interface RolesSectionProps {
  roles: RoleDefinition[]
  users: FrappeUser[]
  onRefreshUsers?: () => void
}

export default function RolesSection({ roles, users, onRefreshUsers }: RolesSectionProps) {
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null)
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assignTargetRole, setAssignTargetRole] = useState<PortalRole | null>(null)
  const [assignUserId, setAssignUserId] = useState("")
  const [assigning, setAssigning] = useState(false)
  const [assignError, setAssignError] = useState<string | null>(null)

  const getUsersForRole = (roleName: string) => users.filter((u) => u.roles.includes(roleName))

  const handleOpenAssignDialog = (roleName: PortalRole, userId?: string) => {
    setAssignTargetRole(roleName)
    setAssignUserId(userId ?? "")
    setAssignError(null)
    setAssignDialogOpen(true)
  }

  const handleAssignRole = async () => {
    if (!assignTargetRole || !assignUserId.trim()) {
      setAssignError("Please select a user.")
      return
    }

    const user = users.find((u) => u.name === assignUserId)
    if (!user) {
      setAssignError("User not found.")
      return
    }

    if (user.roles.includes(assignTargetRole)) {
      setAssignError(`User already has the ${assignTargetRole} role.`)
      return
    }

    setAssigning(true)
    setAssignError(null)
    try {
      const newRoles = [
        ...user.roles.filter(
          (r) => ["Regulator Admin", "Inspection Manager", "Regulator User"].includes(r) === false
        ),
        assignTargetRole,
      ]

      await updateUser({
        user_id: user.name,
        roles: newRoles,
      })

      showSuccess(`Assigned ${assignTargetRole} role to ${user.full_name || user.email}`)
      setAssignDialogOpen(false)
      onRefreshUsers?.()
    } catch (err: any) {
      setAssignError(err?.message || "Failed to assign role.")
      showError("Failed to assign role")
    } finally {
      setAssigning(false)
    }
  }

  const handleRemoveRole = async (user: FrappeUser, roleName: string) => {
    try {
      const newRoles = user.roles.filter((r) => r !== roleName)
      await updateUser({
        user_id: user.name,
        roles: newRoles.length > 0 ? newRoles : undefined,
      })
      showSuccess(`Removed ${roleName} role from ${user.full_name || user.email}`)
      onRefreshUsers?.()
    } catch {
      showError("Failed to remove role")
    }
  }

  // Users without any portal role
  const unassignedUsers = users.filter(
    (u) =>
      !u.roles.some((r) => ["Regulator Admin", "Inspection Manager", "Regulator User"].includes(r))
  )

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Portal Roles</h3>
        <p className="text-sm text-muted-foreground">
          Manage the 3 defined portal roles and their user assignments.
        </p>
      </div>

      {/* Role cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {roles.map((role) => {
          const roleUsers = getUsersForRole(role.name)
          return (
            <Card
              key={role.name}
              className={`border-2 ${ROLE_BORDER_COLORS[role.name] || "border-border"}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={ROLE_COLORS[role.name] || "bg-muted text-foreground"}>
                    {role.name}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    title={`Assign user to ${role.name}`}
                    onClick={() => handleOpenAssignDialog(role.name)}
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mb-4">{role.description}</p>

                <div className="space-y-1.5 mb-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Capabilities
                  </p>
                  {role.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-3.5 w-3.5 text-green-500 dark:text-green-400 shrink-0" />
                      <span>{cap}</span>
                    </div>
                  ))}
                </div>

                {/* Users with this role */}
                <div className="border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                    Users ({roleUsers.length})
                  </p>
                  {roleUsers.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No users assigned</p>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {roleUsers.map((u) => (
                        <div key={u.name} className="flex items-center justify-between gap-2 group">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                u.enabled === 1
                                  ? "bg-green-500 dark:bg-green-400"
                                  : "bg-muted-foreground/50"
                              }`}
                            />
                            <span className="text-sm truncate">{u.full_name || u.email}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title="Remove role"
                            onClick={() => handleRemoveRole(u, role.name)}
                          >
                            <X className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Unassigned users */}
      {unassignedUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Users Without Portal Role ({unassignedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              These users exist in the system but do not have a portal role assigned.
            </p>
            <div className="space-y-2">
              {unassignedUsers.slice(0, 10).map((u) => (
                <div key={u.name} className="flex items-center justify-between gap-3 py-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        u.enabled === 1
                          ? "bg-green-500 dark:bg-green-400"
                          : "bg-muted-foreground/50"
                      }`}
                    />
                    <span className="text-sm font-medium truncate">{u.full_name || u.email}</span>
                    <span className="text-xs text-muted-foreground truncate">{u.email}</span>
                  </div>
                  <Select
                    onValueChange={(role) => {
                      handleOpenAssignDialog(role as PortalRole, u.name)
                    }}
                  >
                    <SelectTrigger className="w-[180px] h-8 text-xs">
                      <SelectValue placeholder="Assign role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Regulator Admin">Regulator Admin</SelectItem>
                      <SelectItem value="Inspection Manager">Inspection Manager</SelectItem>
                      <SelectItem value="Regulator User">Regulator User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ))}
              {unassignedUsers.length > 10 && (
                <p className="text-xs text-muted-foreground pt-1">
                  ...and {unassignedUsers.length - 10} more
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Role Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Assign Role</DialogTitle>
            <DialogDescription>
              Assign the <span className="font-medium">{assignTargetRole}</span> role to a user.
              This will replace any existing portal role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {assignError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{assignError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="assignUser">Select User</Label>
              <Select value={assignUserId} onValueChange={setAssignUserId} disabled={assigning}>
                <SelectTrigger id="assignUser">
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users
                    .filter((u) => u.enabled === 1)
                    .map((u) => (
                      <SelectItem key={u.name} value={u.name}>
                        {u.full_name || u.email} ({u.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
              disabled={assigning}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignRole} disabled={assigning || !assignUserId}>
              {assigning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Role"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
