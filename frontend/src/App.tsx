import { useEffect, useMemo, useState } from 'react'
import { Spin } from 'antd'
import DashboardView from '@/components/DashboardView'
import AppLayout from '@/components/AppLayout'
import ProfileView from '@/components/ProfileView'
import RoadmapShell from '@/components/RoadmapShell'
import UnauthorizedPage from '@/components/UnauthorizedPage'
import InspectionView from '@/components/inspection'
import { useAuthStore } from '@/stores/authStore'

const DEFAULT_FAVICON = '/assets/careverse_regulator/compliance-360/favicon.svg?v=20260313a'

const KNOWN_ROUTES = new Set([
  'dashboard',
  'dashboard/empty',
  'affiliations',
  'users-roles',
  'regulator-settings',
  'license-management',
  'inspection',
  'notifications-center',
  'profile',
])

interface RouteMeta {
  title: string
  subtitle: string
}

const ROUTE_META: Record<string, RouteMeta> = {
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Compliance signals and priority actions.',
  },
  'dashboard/empty': {
    title: 'Dashboard',
    subtitle: 'No live data connected yet.',
  },
  affiliations: {
    title: 'Affiliation Operations',
    subtitle: 'Review affiliation confirmations and escalations.',
  },
  'users-roles': {
    title: 'User & Role Administration',
    subtitle: 'Manage access boundaries and operator permissions.',
  },
  'regulator-settings': {
    title: 'Regulator Settings',
    subtitle: 'Configure governance defaults and threshold rules.',
  },
  'license-management': {
    title: 'License Management',
    subtitle: 'Process approvals, renewals, and enforcement outcomes.',
  },
  inspection: {
    title: 'Inspection Management',
    subtitle: 'Schedule and view facility inspections.',
  },
  'notifications-center': {
    title: 'Notifications Center',
    subtitle: 'Track reminders, alerts, and follow-up actions.',
  },
  profile: {
    title: 'Profile',
    subtitle: 'Manage account identity and session controls.',
  },
}

function normalizeRoute(route: string): string {
  if (!route) return 'dashboard'
  return route.replace(/^#/, '').replace(/^\/+/, '') || 'dashboard'
}

function readHashRoute(): string {
  return normalizeRoute(window.location.hash)
}

function loginUrlForRoute(route: string): string {
  return `/login?redirect-to=${encodeURIComponent(`/compliance-360#${route}`)}`
}

function logoutUrl(): string {
  return '/logout?redirect-to=/'
}

function switchToDesk(): void {
  window.location.href = '/app'
}

function resolveRouteMeta(route: string): RouteMeta {
  if (route.startsWith('dashboard/empty')) return ROUTE_META['dashboard/empty']
  if (route.startsWith('dashboard')) return ROUTE_META.dashboard
  return ROUTE_META[route] || {
    title: 'Module Shell',
    subtitle: 'Route scaffold ready for module implementation.',
  }
}

function inferFaviconType(href: string): string {
  const normalized = href.split('?')[0].toLowerCase()
  if (normalized.endsWith('.png')) return 'image/png'
  if (normalized.endsWith('.ico')) return 'image/x-icon'
  if (normalized.endsWith('.jpg') || normalized.endsWith('.jpeg')) return 'image/jpeg'
  if (normalized.endsWith('.webp')) return 'image/webp'
  return 'image/svg+xml'
}

export default function App() {
  const { status, user, hasPortalAccess, accessIssue, accessMessage, initialize } = useAuthStore()
  const [route, setRoute] = useState<string>(readHashRoute())

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (!window.location.hash) {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#dashboard`)
    }

    const syncRoute = () => setRoute(readHashRoute())
    window.addEventListener('hashchange', syncRoute)
    window.addEventListener('popstate', syncRoute)

    return () => {
      window.removeEventListener('hashchange', syncRoute)
      window.removeEventListener('popstate', syncRoute)
    }
  }, [])

  useEffect(() => {
    const faviconHref = user?.faviconUrl || user?.companyLogo || DEFAULT_FAVICON
    const faviconType = inferFaviconType(faviconHref)

    const upsertFavicon = (rel: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
      if (!link) {
        link = document.createElement('link')
        link.setAttribute('rel', rel)
        document.head.appendChild(link)
      }
      link.setAttribute('type', faviconType)
      link.setAttribute('href', faviconHref)
    }

    upsertFavicon('icon')
    upsertFavicon('alternate icon')
  }, [user?.faviconUrl, user?.companyLogo])

  const currentMeta = useMemo(() => resolveRouteMeta(route), [route])

  const navigate = (nextRoute: string) => {
    const normalized = normalizeRoute(nextRoute)
    window.history.pushState(null, '', `${window.location.pathname}${window.location.search}#${normalized}`)
    setRoute(normalized)
  }

  const handleLogout = () => {
    window.location.href = logoutUrl()
  }

  if (status === 'loading') {
    return (
      <div className="portal-loading">
        <Spin size="large" />
      </div>
    )
  }

  if (status === 'guest') {
    return (
      <UnauthorizedPage
        mode="guest"
        userEmail={user?.email}
        onLogin={() => {
          window.location.href = loginUrlForRoute(route)
        }}
        onSwitchToDesk={switchToDesk}
      />
    )
  }

  if (!hasPortalAccess) {
    const isCompanyMisconfigured = accessIssue === 'missing_company_permission' || accessIssue === 'multiple_company_permissions'
    return (
      <UnauthorizedPage
        mode={isCompanyMisconfigured ? 'tenant-misconfigured' : 'forbidden'}
        userEmail={user?.email}
        accessMessage={accessMessage || undefined}
        onLogin={() => {
          window.location.href = loginUrlForRoute(route)
        }}
        onContinueLimited={isCompanyMisconfigured ? undefined : () => navigate('dashboard/empty')}
        onLogout={handleLogout}
        onSwitchToDesk={switchToDesk}
      />
    )
  }

  return (
    <AppLayout
      currentRoute={route}
      pageTitle={currentMeta.title}
      pageSubtitle={currentMeta.subtitle}
      onNavigate={navigate}
      onOpenNotifications={() => navigate('notifications-center')}
      onLogout={handleLogout}
      onSwitchToDesk={switchToDesk}
      user={user}
    >
      <div className="hq-page-wrap">
        {route === 'dashboard' && <DashboardView emptyState={false} onNavigate={navigate} company={user?.company} />}
        {route === 'dashboard/empty' && <DashboardView emptyState onNavigate={navigate} company={user?.company} />}
        {route === 'affiliations' && (
          <RoadmapShell
            title="Affiliation Operations"
            description="Review pending professional affiliations, confirmations, and exception handling."
          />
        )}
        {route === 'users-roles' && (
          <RoadmapShell
            title="User & Role Administration"
            description="Manage onboarding, role assignment, and permission boundaries."
          />
        )}
        {route === 'regulator-settings' && (
          <RoadmapShell
            title="Regulator Settings"
            description="Configure governance defaults and compliance policy thresholds."
          />
        )}
        {route === 'license-management' && (
          <RoadmapShell
            title="License Management"
            description="Coordinate application intake, renewals, and enforcement decisions."
          />
        )}
        {route === 'inspection' && <InspectionView onNavigate={navigate} company={user?.company} />}
        {route === 'notifications-center' && (
          <RoadmapShell
            title="Notifications Center"
            description="Review platform alerts, reminders, and operational follow-up items."
          />
        )}
        {route === 'profile' && (
          <ProfileView
            userName={user?.fullName || user?.name || user?.email || 'Regulator User'}
            userEmail={user?.email || 'No email available'}
            userRole={user?.roles?.[0] || 'Regulator Operator'}
            onOpenDesk={switchToDesk}
            onLogout={handleLogout}
          />
        )}
        {!KNOWN_ROUTES.has(route) && (
          <RoadmapShell
            title="Module Shell"
            description="This route is available and ready for module-level implementation."
          />
        )}
      </div>
    </AppLayout>
  )
}
