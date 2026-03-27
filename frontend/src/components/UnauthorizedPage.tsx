import {
  Lock,
  LogIn,
  BarChart3,
  CheckCircle,
  FileSearch,
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  LogOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useResponsive } from "@/hooks/useResponsive"
import { useThemeStore } from "@/stores/themeStore"

interface UnauthorizedPageProps {
  mode: "guest" | "forbidden" | "tenant-misconfigured"
  userEmail?: string
  accessMessage?: string
  onLogin: () => void
  onContinueLimited?: () => void
  onLogout?: () => void
  onSwitchToDesk?: () => void
}

export default function UnauthorizedPage({
  mode,
  userEmail,
  accessMessage,
  onLogin,
  onContinueLimited,
  onLogout,
  onSwitchToDesk,
}: UnauthorizedPageProps) {
  const { isMobile } = useResponsive()
  const colorMode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const isDarkMode = colorMode === "dark"

  const isGuest = mode === "guest"
  const isTenantMisconfigured = mode === "tenant-misconfigured"

  const pageTitle = isGuest
    ? "Sign In Required"
    : isTenantMisconfigured
    ? "Company Setup Required"
    : "Access Restricted"
  const pageDescription = isGuest
    ? "Welcome to Compliance 360. Sign in with your authorized credentials to continue."
    : isTenantMisconfigured
    ? "Your account needs exactly one assigned company before this portal can open."
    : "Your current role does not include this workspace."
  const guidance = isTenantMisconfigured
    ? accessMessage ||
      "Ask your administrator to assign one Company User Permission to this account."
    : isGuest
    ? "Use your work credentials to continue."
    : accessMessage || "Ask your administrator to assign the correct portal role."

  const features = [
    {
      icon: BarChart3,
      title: "Executive Monitoring",
      description: "Real-time oversight of regulator operations, queues, and compliance workload.",
    },
    {
      icon: FileSearch,
      title: "Centralized Approvals",
      description:
        "Streamlined workflow for processing licensing decisions, renewals, and sanctions.",
    },
    {
      icon: ShieldCheck,
      title: "Unified Registry",
      description: "Single source of truth for health workers, facilities, and lifecycle records.",
    },
  ]

  const handlePrimaryAction = () => {
    if (isGuest || isTenantMisconfigured || !onContinueLimited) {
      onLogin()
      return
    }

    onContinueLimited()
  }

  const primaryLabel = isGuest
    ? "Sign In to Dashboard"
    : isTenantMisconfigured
    ? "Re-open Sign In"
    : onContinueLimited
    ? "Continue (Limited Access)"
    : "Sign In to Dashboard"

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-secondary/20 relative overflow-hidden">
      {/* Glassmorphic decorative shapes */}
      <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/10 dark:bg-primary/20 blur-[80px] -top-24 -left-24 pointer-events-none" />
      <div className="absolute w-[400px] h-[400px] rounded-full bg-green-500/10 dark:bg-green-500/20 blur-[80px] -bottom-12 -right-12 pointer-events-none" />

      <header className="sticky top-0 z-10 bg-background/70 dark:bg-background/70 backdrop-blur-lg border-b border-border px-5 py-4">
        <div className="max-w-7xl w-full mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src="/assets/careverse_regulator/compliance-360/compliance-logo.svg"
              alt="Compliance 360"
              className="h-7 w-auto"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={toggleMode} className="rounded-lg">
            {isDarkMode ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
            {isDarkMode ? "Light" : "Dark"} Mode
          </Button>
        </div>
      </header>

      <main className="flex items-center justify-center px-5 py-9 relative z-[1]">
        <div className="max-w-7xl w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <Card className="bg-card/90 dark:bg-card/90 backdrop-blur-sm shadow-lg">
                <CardContent className={isMobile ? "p-6" : "p-10"}>
                  <div className="flex flex-col gap-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center text-primary">
                      <Lock className="w-6 h-6" />
                    </div>

                    <div>
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block mb-2.5">
                        Organization Portal
                      </span>
                      <h1
                        className={`font-medium tracking-tight leading-tight ${
                          isMobile ? "text-2xl" : "text-3xl"
                        }`}
                      >
                        {pageTitle}
                      </h1>
                      <p className="text-sm leading-relaxed text-muted-foreground mt-3">
                        {pageDescription}
                      </p>
                    </div>

                    <Button
                      size="lg"
                      onClick={handlePrimaryAction}
                      className="w-full h-12 text-sm font-medium bg-gradient-to-r from-primary to-green-600 hover:from-primary/90 hover:to-green-600/90 shadow-lg shadow-primary/25"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      {primaryLabel}
                      <ArrowRight className="w-4 h-4 ml-3" />
                    </Button>

                    {(onSwitchToDesk || (!isGuest && onLogout)) && (
                      <div className="flex flex-wrap gap-2">
                        {onSwitchToDesk && (
                          <Button
                            variant="outline"
                            onClick={onSwitchToDesk}
                            className="h-10 font-medium"
                          >
                            <Monitor className="w-4 h-4 mr-2" />
                            Open Desk
                          </Button>
                        )}
                        {!isGuest && onLogout && (
                          <Button
                            variant="destructive"
                            onClick={onLogout}
                            className="h-10 font-medium"
                          >
                            <LogOut className="w-4 h-4 mr-2" />
                            Log Out
                          </Button>
                        )}
                      </div>
                    )}

                    <div className="p-4 rounded-xl bg-muted/50 dark:bg-muted/50 border border-border">
                      <h5 className="text-sm font-medium text-primary mb-3">
                        {isGuest ? "After You Sign In" : "Current Account"}
                      </h5>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {isGuest ? guidance : userEmail || "Unknown user"}
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-muted/50 dark:bg-muted/50 border border-border">
                      <h5 className="text-sm font-medium mb-2">Need Help?</h5>
                      <p className="text-xs text-muted-foreground">{guidance}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col gap-7 px-3">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-primary dark:text-green-400 block mb-3">
                  Executive Platform
                </span>
                <h2 className="text-3xl font-medium mb-2.5">Smarter Organization Management</h2>
                <p className="text-sm text-muted-foreground">
                  Compliance 360 provides integrated oversight of health workers, facilities,
                  licenses, and compliance actions.
                </p>
              </div>

              <div className="grid gap-4">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <Card
                      key={index}
                      className="bg-card/90 dark:bg-card/90 backdrop-blur-sm shadow-md transition-all hover:shadow-lg"
                    >
                      <CardContent className="p-4.5">
                        <div className="flex gap-4 items-start">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0 text-primary">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-medium mb-1">{feature.title}</h5>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 ml-auto self-center shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              <div className="mt-4 flex items-center gap-3 text-muted-foreground text-xs">
                <ShieldCheck className="w-4.5 h-4.5" />
                <span>Secured by enterprise-grade authentication and audit controls</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
