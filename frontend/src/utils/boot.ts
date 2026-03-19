interface BootSession {
  user?: string
  user_fullname?: string
  user_image?: string | null
  active_company?: string | null
  company?: string
}

interface BootUser {
  name?: string
  email?: string
  full_name?: string
  user_image?: string | null
  roles?: string[]
  company?: string | null
  company_display_name?: string | null
  company_abbr?: string | null
  company_logo?: string | null
  allowed_companies?: string[]
  defaults?: {
    company?: string
  }
}

interface BootDefaults {
  company?: string
}

export interface BootPortalAccess {
  allowed?: boolean
  reason?: string
  message?: string | null
}

export interface BootPayload {
  csrf_token?: string
  session?: BootSession
  user?: BootUser
  active_company?: string | null
  company_display_name?: string | null
  company_abbr?: string | null
  company_logo?: string | null
  favicon_url?: string | null
  company_branding?: {
    name?: string | null
    display_name?: string | null
    abbr?: string | null
    logo?: string | null
    favicon_url?: string | null
  }
  allowed_companies?: string[]
  portal_access?: BootPortalAccess
  user_defaults?: BootDefaults
  sysdefaults?: BootDefaults
  defaults?: BootDefaults
  default_company?: string
}

declare global {
  interface Window {
    csrf_token?: string
    frappe?: {
      boot?: BootPayload
    }
  }
}

export function getBootData(): BootPayload | undefined {
  return window.frappe?.boot
}

let cachedCsrfToken: string | undefined

function getCsrfFromCookie(): string | undefined {
  const match = document.cookie.match(/csrf_token=([^;]+)/)
  return match ? match[1] : undefined
}

export function getCsrfToken(): string | undefined {
  // Try to get from window first
  const token = window.csrf_token || window.frappe?.boot?.csrf_token
  if (token) {
    cachedCsrfToken = token
    return token
  }

  // Try to get from cookie (for dev mode)
  const cookieToken = getCsrfFromCookie()
  if (cookieToken) {
    cachedCsrfToken = cookieToken
    return cookieToken
  }

  // Return cached token if available
  return cachedCsrfToken
}

export async function fetchAndCacheCsrfToken(): Promise<void> {
  try {
    // For dev mode, fetch boot data from Frappe using GET (no CSRF required)
    const response = await fetch('/api/method/careverse_regulator.www.compliance_360.get_context_for_dev', {
      method: 'GET',
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error('Failed to fetch boot data')
    }

    const data = await response.json()
    const boot = data.message

    // Set boot data if available
    if (boot) {
      if (!window.frappe) {
        window.frappe = {}
      }
      window.frappe.boot = boot

      // Get CSRF token from boot
      if (boot.csrf_token) {
        cachedCsrfToken = boot.csrf_token
        window.csrf_token = boot.csrf_token
      }
    }

    // Also try to get from cookie as fallback
    const csrfFromCookie = getCsrfFromCookie()
    if (csrfFromCookie && !cachedCsrfToken) {
      cachedCsrfToken = csrfFromCookie
      window.csrf_token = csrfFromCookie
    }
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
}

export function getActiveCompanyFromBoot(): string | null {
  const boot = getBootData()

  const candidates = [
    boot?.active_company,
    boot?.company_branding?.name,
    boot?.company_display_name,
    boot?.session?.active_company,
    boot?.user?.company,
    boot?.user?.defaults?.company,
    boot?.user_defaults?.company,
    boot?.sysdefaults?.company,
    boot?.defaults?.company,
    boot?.default_company,
    boot?.session?.company,
  ]

  for (const candidate of candidates) {
    const value = candidate?.trim()
    if (value) {
      return value
    }
  }

  return null
}

export interface CompanyBranding {
  name: string | null
  displayName: string | null
  abbr: string | null
  logo: string | null
  faviconUrl: string | null
}

export function getCompanyBrandingFromBoot(): CompanyBranding {
  const boot = getBootData()
  const branding = boot?.company_branding

  const name = branding?.name || boot?.active_company || boot?.user?.company || null
  const displayName = branding?.display_name || boot?.company_display_name || boot?.user?.company_display_name || name
  const abbr = branding?.abbr || boot?.company_abbr || boot?.user?.company_abbr || null
  const logo = branding?.logo || boot?.company_logo || boot?.user?.company_logo || null
  const faviconUrl = branding?.favicon_url || boot?.favicon_url || logo || null

  return { name, displayName, abbr, logo, faviconUrl }
}

export function getPortalAccessFromBoot(): BootPortalAccess | null {
  return getBootData()?.portal_access || null
}

export function getAllowedCompaniesFromBoot(): string[] {
  const boot = getBootData()
  const candidates = boot?.allowed_companies || boot?.user?.allowed_companies || []
  return Array.isArray(candidates) ? candidates.filter((item): item is string => !!item && typeof item === 'string') : []
}
