import { Monitor, LogOut, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

interface ProfileViewProps {
  userName: string
  userEmail: string
  userRole: string
  onOpenDesk: () => void
  onLogout: () => void
}

export default function ProfileView({
  userName,
  userEmail,
  userRole,
  onOpenDesk,
  onLogout,
}: ProfileViewProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex flex-col gap-3.5">
            <Badge variant="secondary" className="w-fit">
              <User className="w-3 h-3 mr-1.5" />
              Signed in operator
            </Badge>

            <h3 className="text-2xl font-semibold tracking-tight truncate">{userName}</h3>

            <p className="text-sm text-muted-foreground">
              Verify identity, role, and active session context for this regulator workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-muted-foreground">Email</span>
                <strong className="text-sm font-semibold truncate">{userEmail}</strong>
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-sm text-muted-foreground">Role</span>
                <strong className="text-sm font-semibold truncate">{userRole}</strong>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="outline" onClick={onOpenDesk}>
                <Monitor className="w-4 h-4 mr-2" />
                Open Desk
              </Button>
              <Button variant="destructive" onClick={onLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
