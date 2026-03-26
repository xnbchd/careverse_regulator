import { useEffect, useMemo, useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import NotificationCenter from '@/components/shared/NotificationCenter'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useResponsive } from '@/hooks/useResponsive'
import type { PortalUser } from '@/types/auth'
import { useThemeStore } from '@/stores/themeStore'
import { cn } from '@/lib/utils'

const FALLBACK_BRAND_ICON = '/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a'

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
  const value = fullName || email || 'U'
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function selectedMenuKeyForRoute(route: string): string {
  if (route.startsWith('license-management')) return 'license-management'
  if (route.startsWith('affiliations')) return 'affiliations'
  if (route.startsWith('inspection')) return 'inspection'
  if (route.startsWith('analytics')) return 'analytics'
  if (route.startsWith('documents')) return 'documents'
  if (route.startsWith('forms')) return 'forms'
  if (route.startsWith('audit-logs')) return 'audit-logs'
  if (route.startsWith('users-roles')) return 'users-roles'
  if (route.startsWith('regulator-settings')) return 'regulator-settings'
  if (route.startsWith('dashboard')) return 'dashboard'
  return 'dashboard'
}

export default function AppLayout({
  children,
  currentRoute,
  pageTitle,
  pageSubtitle,
  onNavigate,
  onOpenNotifications,
  onLogout,
  onSwitchToDesk,
  user,
}: AppLayoutProps) {

  const { isMobile, isTablet } = useResponsive()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [brandLogoFailed, setBrandLogoFailed] = useState(false)
  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const isDarkMode = mode === 'dark'

  useEffect(() => {
    setCollapsed(isTablet)
  }, [isTablet])

  const selectedMenuKey = useMemo(() => selectedMenuKeyForRoute(currentRoute), [currentRoute])
  const pageContext = selectedMenuKey === 'dashboard' ? 'Workspace overview' : 'Operational workspace'
  const displayUsername = user?.name || user?.email || 'User'
  const displayCompany = user?.companyDisplayName || user?.company || 'Company not configured'
  const brandTitle = user?.companyDisplayName || user?.company || 'Compliance360'
  const brandSubtitle = user?.companyAbbr || 'Regulator Portal'
  const brandLogoUrl = user?.companyLogo || FALLBACK_BRAND_ICON

  useEffect(() => {
    setBrandLogoFailed(false)
  }, [brandLogoUrl])

  const menuItems = [
    {
      key: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      key: 'documents',
      icon: FileText,
      label: 'Documents',
    },
    {
      key: 'forms',
      icon: FileEdit,
      label: 'Forms',
    },
    {
      key: 'modules',
      icon: AppWindow,
      label: 'Modules',
      children: [
        {
          key: 'license-management',
          icon: ShieldCheck,
          label: 'Licenses',
        },
        {
          key: 'affiliations',
          icon: Network,
          label: 'Affiliations',
        },
        {
          key: 'inspection',
          icon: ClipboardCheck,
          label: 'Inspection',
        },
      ],
    },
    {
      key: 'administration',
      icon: Settings,
      label: 'Administration',
      children: [
        {
          key: 'users-roles',
          icon: Users,
          label: 'Users & Roles',
        },
        {
          key: 'audit-logs',
          icon: ScrollText,
          label: 'Audit Logs',
        },
        {
          key: 'regulator-settings',
          icon: Settings,
          label: 'Settings',
        },
      ],
    },
  ]

  const [openGroups, setOpenGroups] = useState<string[]>(['modules', 'administration'])

  const handleMenuClick = (key: string) => {
    onNavigate(key)
    if (isMobile || isTablet) {
      setMobileMenuVisible(false)
    }
  }

  const toggleGroup = (key: string) => {
    setOpenGroups(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    )
  }

  const renderNavItem = (item: typeof menuItems[0], depth = 0) => {
    const Icon = item.icon
    const isSelected = selectedMenuKey === item.key
    const hasChildren = 'children' in item && item.children
    const isOpen = openGroups.includes(item.key)

    if (hasChildren) {
      return (
        <div key={item.key}>
          <button
            onClick={() => toggleGroup(item.key)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              collapsed ? "justify-center" : "justify-between",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </div>
            {!collapsed && (
              <ChevronRight className={cn("w-4 h-4 transition-transform", isOpen && "rotate-90")} />
            )}
          </button>
          {!collapsed && isOpen && (
            <div className="ml-4 mt-1 space-y-1">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    return (
      <button
        key={item.key}
        onClick={() => handleMenuClick(item.key)}
        className={cn(
          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
          collapsed ? "justify-center" : "justify-start",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-accent hover:text-accent-foreground"
        )}
      >
        <Icon className="w-4 h-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </button>
    )
  }

  const renderLogo = () => (
    <div className={cn(
      "h-16 flex items-center border-b border-border mb-2 transition-all",
      collapsed ? "justify-center px-0" : "justify-start px-6"
    )}>
      <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-base font-semibold overflow-hidden">
        {brandLogoUrl && !brandLogoFailed ? (
          <img
            src={brandLogoUrl}
            alt={brandTitle}
            className="w-full h-full object-cover"
            onError={() => setBrandLogoFailed(true)}
          />
        ) : (
          (brandTitle || 'C').trim().charAt(0).toUpperCase()
        )}
      </div>
      {!collapsed && (
        <div className="ml-3">
          <p className="text-sm font-semibold leading-tight">{brandTitle}</p>
          <p className="text-xs text-muted-foreground font-medium">{brandSubtitle}</p>
        </div>
      )}
    </div>
  )

  const renderSidebar = () => (
    <aside className={cn(
      "fixed left-0 top-0 bottom-0 z-50 overflow-auto bg-background border-r border-border transition-all duration-200",
      collapsed ? "w-20" : "w-64"
    )}>
      {renderLogo()}
      <nav className="p-2 space-y-1">
        {menuItems.map(item => renderNavItem(item))}
      </nav>
    </aside>
  )

  const renderMobileNav = () => (
    <Sheet open={mobileMenuVisible} onOpenChange={setMobileMenuVisible}>
      <SheetContent side="left" className="w-72 p-0">
        {renderLogo()}
        <nav className="p-2 space-y-1">
          {menuItems.map(item => renderNavItem(item))}
        </nav>
      </SheetContent>
    </Sheet>
  )

  return (
    <div className="min-h-screen bg-background">
      {!isMobile && !isTablet && renderSidebar()}
      {(isMobile || isTablet) && renderMobileNav()}

      <div className={cn(
        "transition-all duration-200",
        (isMobile || isTablet) ? "ml-0" : collapsed ? "ml-20" : "ml-64"
      )}>
        <header className="sticky top-0 z-40 h-16 border-b border-border bg-background/80 backdrop-blur-lg px-3 md:px-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => (isMobile || isTablet) ? setMobileMenuVisible(true) : setCollapsed(!collapsed)}
                className={cn(isMobile ? "w-9 h-9" : "w-10 h-10")}
              >
                {(isMobile || isTablet) ? (
                  <PanelLeft className="w-4 h-4" />
                ) : collapsed ? (
                  <PanelLeft className="w-4 h-4" />
                ) : (
                  <PanelLeftClose className="w-4 h-4" />
                )}
              </Button>

              <div className="h-8 w-px bg-border" />

              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{pageContext}</span>
                <h1 className="text-sm font-semibold leading-tight">{pageTitle}</h1>
                {pageSubtitle && <span className="text-xs text-muted-foreground">{pageSubtitle}</span>}
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                <TooltipContent>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
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
                        <span className="text-xs text-muted-foreground leading-tight">{displayCompany}</span>
                      </div>
                    )}
                    {!isMobile && <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onNavigate('profile')}>
                    <User className="w-4 h-4 mr-2" />
                    View profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onSwitchToDesk}>
                    <LinkIcon className="w-4 h-4 mr-2" />
                    Switch to Desk
                  </DropdownMenuItem>
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

        <main className="p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
