import { useEffect, useMemo, useState } from "react"
import {
  AppWindow,
  ClipboardCheck,
  LayoutDashboard,
  Link as LinkIcon,
  LogOut,
  PanelLeft,
  PanelLeftClose,
  Moon,
  Network,
  ShieldCheck,
  Settings,
  Sun,
  Users,
  User,
  ChevronDown,
  ChevronRight,
  BarChart3,
  FileText,
  FileEdit,
  ScrollText,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import NotificationCenter from "@/components/shared/NotificationCenter"
import { GlobalSearch } from "@/components/shared/GlobalSearch"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useResponsive } from "@/hooks/useResponsive"
import type { PortalUser } from "@/types/auth"
import { useThemeStore } from "@/stores/themeStore"
import { cn } from "@/lib/utils"

interface AppLayoutProps {
  children: React.ReactNode
  currentRoute: string
  pageTitle: string
  pageSubtitle?: string
  onNavigate: (route: string) => void
  onOpenNotifications: () => void
  onLogout: () => void
  onSwitchToDesk: () => void
  user: PortalUser | null
}

function getUserInitials(fullName?: string, email?: string): string {
  const value = fullName || email || "U"
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("")
}

function selectedMenuKeyForRoute(route: string): string {
  if (route.startsWith("license-management")) return "license-management"
  if (route.startsWith("affiliations")) return "affiliations"
  if (route.startsWith("inspection")) return "inspection"
  if (route.startsWith("analytics")) return "analytics"
  if (route.startsWith("documents")) return "documents"
  if (route.startsWith("forms")) return "forms"
  if (route.startsWith("audit-logs")) return "audit-logs"
  if (route.startsWith("users-roles")) return "users-roles"
  if (route.startsWith("regulator-settings")) return "regulator-settings"
  if (route.startsWith("dashboard")) return "dashboard"
  return "dashboard"
}

export default function AppLayout({
  children,
  currentRoute,
  pageTitle,
  pageSubtitle,
  onNavigate,
  onLogout,
  onSwitchToDesk,
  user,
}: AppLayoutProps) {
  const { isMobile, isTablet } = useResponsive()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const isDarkMode = mode === "dark"

  useEffect(() => {
    setCollapsed(isTablet)
  }, [isTablet])

  const selectedMenuKey = useMemo(() => selectedMenuKeyForRoute(currentRoute), [currentRoute])
  const pageContext =
    selectedMenuKey === "dashboard" ? "Workspace overview" : "Operational workspace"
  const displayUsername = user?.name || user?.email || "User"
  const displayCompany = user?.companyDisplayName || user?.company || "Company not configured"
  const brandTitle = user?.companyDisplayName || user?.company || "Compliance360"
  const brandSubtitle = user?.companyAbbr || "Regulator Portal"

  // Check if user should see "Switch to Desk" link
  // Hide for Field Inspector and Chief Inspector roles (they should use portal only)
  const canSwitchToDesk = user?.roles?.some(
    (role) =>
      role === "System Manager" ||
      role === "Regulator Admin" ||
      role === "Regulator Manager" ||
      role === "Compliance Regulator" ||
      role === "Regulator User"
  )

  // Keyboard shortcut: Cmd+K / Ctrl+K to open search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        setSearchOpen((prev) => true)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const menuItems = [
    {
      key: "dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
    },
    {
      key: "analytics",
      icon: BarChart3,
      label: "Analytics",
      disabled: true,
    },
    {
      key: "documents",
      icon: FileText,
      label: "Documents",
      disabled: true,
    },
    {
      key: "forms",
      icon: FileEdit,
      label: "Forms",
      disabled: true,
    },
    {
      key: "modules",
      icon: AppWindow,
      label: "Modules",
      children: [
        {
          key: "license-management",
          icon: ShieldCheck,
          label: "Licenses",
        },
        {
          key: "affiliations",
          icon: Network,
          label: "Affiliations",
        },
        {
          key: "inspection",
          icon: ClipboardCheck,
          label: "Inspection",
        },
      ],
    },
    {
      key: "administration",
      icon: Settings,
      label: "Administration",
      children: [
        {
          key: "users-roles",
          icon: Users,
          label: "Users & Roles",
        },
        {
          key: "audit-logs",
          icon: ScrollText,
          label: "Audit Logs",
        },
        {
          key: "regulator-settings",
          icon: Settings,
          label: "Settings",
        },
      ],
    },
  ]

  const [openGroups, setOpenGroups] = useState<string[]>(["modules", "administration"])

  const handleMenuClick = (key: string) => {
    onNavigate(key)
    if (isMobile || isTablet) {
      setMobileMenuVisible(false)
    }
  }

  const toggleGroup = (key: string) => {
    setOpenGroups((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const renderNavItem = (item: (typeof menuItems)[0], depth = 0) => {
    const Icon = item.icon
    const isSelected = selectedMenuKey === item.key
    const hasChildren = "children" in item && item.children
    const isOpen = openGroups.includes(item.key)
    const isDisabled = "disabled" in item && item.disabled

    if (hasChildren) {
      return (
        <div key={item.key} className={depth === 0 ? "mt-4" : ""}>
          {!collapsed && (
            <button
              onClick={() => toggleGroup(item.key)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
              )}
            >
              <span>{item.label}</span>
              <ChevronRight
                className={cn(
                  "w-3.5 h-3.5 transition-transform duration-200",
                  isOpen && "rotate-90"
                )}
              />
            </button>
          )}
          {collapsed && (
            <button
              onClick={() => toggleGroup(item.key)}
              className="w-full flex items-center justify-center px-3 py-2 hover:bg-accent rounded-md transition-colors"
            >
              <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />
            </button>
          )}
          {!collapsed && isOpen && (
            <div className="mt-0.5 space-y-0.5">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    if (isDisabled) {
      return (
        <button
          key={item.key}
          disabled
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium cursor-not-allowed",
            collapsed ? "justify-center" : "justify-start",
            "text-muted-foreground/40"
          )}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </button>
      )
    }

    return (
      <button
        key={item.key}
        onClick={() => handleMenuClick(item.key)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          collapsed ? "justify-center" : "justify-start",
          isSelected
            ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    )
  }

  const renderLogo = () => (
    <div
      className={cn(
        "border-b border-border mb-2 transition-all",
        collapsed ? "flex items-center justify-center h-16 px-0" : "px-4 py-3"
      )}
    >
      <div
        className={cn("flex items-center gap-3", collapsed ? "justify-center" : "justify-start")}
      >
        {collapsed ? (
          <div className="w-9 h-9 shrink-0 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-semibold">
            {(brandTitle || "C").trim().charAt(0).toUpperCase()}
          </div>
        ) : (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug line-clamp-2">{brandTitle}</p>
            <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider mt-0.5">
              {brandSubtitle}
            </p>
          </div>
        )}
      </div>
    </div>
  )

  const renderSidebar = () => (
    <aside
      className={cn(
        "fixed left-0 top-0 bottom-0 z-50 overflow-auto bg-card border-r border-border transition-all duration-200",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {renderLogo()}
      <nav className="p-2 space-y-1">{menuItems.map((item) => renderNavItem(item))}</nav>
    </aside>
  )

  const renderMobileNav = () => (
    <Sheet open={mobileMenuVisible} onOpenChange={setMobileMenuVisible}>
      <SheetContent side="left" className="w-72 p-0">
        {renderLogo()}
        <nav className="p-2 space-y-1">{menuItems.map((item) => renderNavItem(item))}</nav>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && !isTablet && renderSidebar()}
      {(isMobile || isTablet) && renderMobileNav()}

      <div
        className={cn(
          "transition-all duration-200",
          isMobile || isTablet ? "ml-0" : collapsed ? "ml-20" : "ml-64"
        )}
      >
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-card/80 backdrop-blur-lg px-3 md:px-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  isMobile || isTablet ? setMobileMenuVisible(true) : setCollapsed(!collapsed)
                }
                className={cn(isMobile ? "w-9 h-9" : "w-10 h-10")}
              >
                {isMobile || isTablet ? (
                  <PanelLeft className="w-4 h-4" />
                ) : collapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </Button>

              <div className="h-8 w-px bg-border" />

              <img
                src={`${import.meta.env.BASE_URL}compliance-logo.svg`}
                alt="Compliance360"
                className="h-7 w-auto object-contain"
              />

              <div className="h-8 w-px bg-border" />

              <div className="flex flex-col">
                <h1 className="text-sm font-semibold leading-tight">{pageTitle}</h1>
              </div>
            </div>

            {/* Search bar for desktop */}
            {!isMobile && !isTablet && (
              <Button
                variant="outline"
                className="w-80 justify-between text-muted-foreground font-normal"
                onClick={() => setSearchOpen(true)}
              >
                <span className="flex items-center">
                  <Search className="w-4 h-4 mr-2" />
                  Search...
                </span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </Button>
            )}

            <div className="flex items-center gap-2">
              {/* Search icon for mobile/tablet */}
              {(isMobile || isTablet) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className={cn(isMobile ? "w-9 h-9" : "w-10 h-10")}
                >
                  <Search className="w-4 h-4" />
                </Button>
              )}

              <NotificationCenter />

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleMode}
                    className={cn(isMobile ? "w-9 h-9" : "w-10 h-10")}
                  >
                    {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isDarkMode ? "Light Mode" : "Dark Mode"}</TooltipContent>
              </Tooltip>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.userImage || undefined} alt={displayUsername} />
                      <AvatarFallback className="text-xs">
                        {getUserInitials(user?.fullName, user?.email)}
                      </AvatarFallback>
                    </Avatar>
                    {!isMobile && (
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium leading-tight">{displayUsername}</span>
                        <span className="text-xs text-muted-foreground leading-tight">
                          {displayCompany}
                        </span>
                      </div>
                    )}
                    {!isMobile && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onNavigate("profile")}>
                    <User className="w-4 h-4 mr-2" />
                    View profile
                  </DropdownMenuItem>
                  {canSwitchToDesk && (
                    <DropdownMenuItem onClick={onSwitchToDesk}>
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Switch to Desk
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
      {searchOpen && <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />}
    </div>
  )
}
