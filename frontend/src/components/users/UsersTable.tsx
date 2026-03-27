import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { MoreHorizontal, Pencil, UserX, KeyRound, Users, UserCheck } from "lucide-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import type { FrappeUser, PortalRole } from "@/types/user"

dayjs.extend(relativeTime)

const ROLE_COLORS: Record<string, string> = {
  "Regulator Admin": "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
  "Inspection Manager": "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
  "Regulator User": "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
}

interface UsersTableProps {
  users: FrappeUser[]
  isLoading: boolean
  onEdit: (user: FrappeUser) => void
  onDisable: (user: FrappeUser) => void
  onEnable: (user: FrappeUser) => void
  onResetPassword: (user: FrappeUser) => void
}

function getPortalRole(roles: string[]): PortalRole | null {
  const portalRoles: PortalRole[] = ["Regulator Admin", "Inspection Manager", "Regulator User"]
  return portalRoles.find((r) => roles.includes(r)) ?? null
}

export default function UsersTable({
  users,
  isLoading,
  onEdit,
  onDisable,
  onEnable,
  onResetPassword,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-1/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-1">No users found</h3>
              <p className="text-sm text-muted-foreground">No users match your current filters.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-2">
      {users.map((user) => {
        const portalRole = getPortalRole(user.roles)
        const isActive = user.enabled === 1
        const initials = (user.full_name || user.email || "U")
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((p) => p.charAt(0).toUpperCase())
          .join("")

        return (
          <Card key={user.name}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {initials}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {user.full_name || user.email}
                      </h3>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1.5">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isActive ? "bg-green-500 dark:bg-green-400" : "bg-muted-foreground/50"
                          }`}
                        />
                        <span className="text-xs text-muted-foreground">
                          {isActive ? "Active" : "Disabled"}
                        </span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => onEdit(user)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          {isActive && (
                            <DropdownMenuItem onClick={() => onResetPassword(user)}>
                              <KeyRound className="h-4 w-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {isActive ? (
                            <DropdownMenuItem
                              onClick={() => onDisable(user)}
                              className="text-destructive"
                            >
                              <UserX className="h-4 w-4 mr-2" />
                              Disable User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => onEnable(user)}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Enable User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {portalRole && (
                      <Badge className={ROLE_COLORS[portalRole] || "bg-muted text-foreground"}>
                        {portalRole}
                      </Badge>
                    )}
                    {user.mobile_no && (
                      <Badge variant="outline" className="text-xs">
                        {user.mobile_no}
                      </Badge>
                    )}
                    {user.username && (
                      <Badge variant="secondary" className="text-xs font-mono">
                        ID: {user.username}
                      </Badge>
                    )}
                    {user.creation && (
                      <Badge variant="secondary" className="text-xs">
                        Joined {dayjs(user.creation).fromNow()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
