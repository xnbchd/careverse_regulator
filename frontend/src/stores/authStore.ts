import { create } from "zustand"
import type { AuthState, PortalUser } from "@/types/auth"
import {
  getActiveCompanyFromBoot,
  getBootData,
  getCompanyBrandingFromBoot,
  getPortalAccessFromBoot,
  fetchAndCacheCsrfToken,
} from "@/utils/boot"

const allowedRoles = new Set([
  "System Manager",
  "Regulator Admin",
  "Regulator Manager",
  "Compliance Regulator",
  "Regulator User",
  "Chief Inspector",
  "Field Inspector",
])

interface LoggedUserResponse {
  message?: string
}

interface UserContextResponse {
  message?: {
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
    portal_access?: {
      allowed?: boolean
      reason?: string
      message?: string | null
    }
    allowed_companies?: string[]
    roles?: string[]
  }
}

function hasRoleAccess(roles: string[]): boolean {
  if (!roles.length) {
    return true
  }
  return roles.some((role) => allowedRoles.has(role))
}

function mapBootUser(): PortalUser | null {
  const boot = getBootData()
  const sessionUser = boot?.session?.user
  const branding = getCompanyBrandingFromBoot()

  if (!sessionUser || sessionUser === "Guest") {
    return null
  }

  return {
    name: boot?.user?.name || sessionUser,
    email: boot?.user?.email || sessionUser,
    fullName: boot?.user?.full_name || boot?.session?.user_fullname || sessionUser,
    userImage: boot?.user?.user_image || boot?.session?.user_image || null,
    company: branding.name || getActiveCompanyFromBoot(),
    companyDisplayName: branding.displayName,
    companyAbbr: branding.abbr,
    companyLogo: branding.logo,
    faviconUrl: branding.faviconUrl,
    roles: boot?.user?.roles || [],
  }
}

function logoutRedirect(): string {
  return "/logout?redirect-to=/"
}

function mapAccessFromBoot(): {
  companyAllowed: boolean
  accessIssue: AuthState["accessIssue"]
  accessMessage: string | null
} {
  const portalAccess = getPortalAccessFromBoot()
  if (portalAccess) {
    if (portalAccess.allowed) {
      return { companyAllowed: true, accessIssue: null, accessMessage: null }
    }

    if (portalAccess.reason === "missing_company_permission") {
      return {
        companyAllowed: false,
        accessIssue: "missing_company_permission",
        accessMessage:
          portalAccess.message ||
          "Assign exactly one Company User Permission to this user account.",
      }
    }

    if (portalAccess.reason === "multiple_company_permissions") {
      return {
        companyAllowed: false,
        accessIssue: "multiple_company_permissions",
        accessMessage:
          portalAccess.message || "This account has multiple Company permissions. Keep only one.",
      }
    }
  }

  const company = getActiveCompanyFromBoot()
  if (!company) {
    return {
      companyAllowed: false,
      accessIssue: "missing_company_permission",
      accessMessage: "Assign exactly one Company User Permission to this user account.",
    }
  }

  return { companyAllowed: true, accessIssue: null, accessMessage: null }
}

async function fetchUserContext() {
  const response = await fetch("/api/method/careverse_regulator.api.tenant.get_user_context", {
    credentials: "include",
  })
  const payload = (await response.json().catch(() => ({}))) as UserContextResponse
  return payload?.message || {}
}

export const useAuthStore = create<AuthState>((set) => ({
  status: "loading",
  user: null,
  hasPortalAccess: false,
  accessIssue: null,
  accessMessage: null,

  initialize: async () => {
    // Fetch CSRF token if not available (for dev mode on port 8080)
    if (!window.csrf_token && !window.frappe?.boot?.csrf_token) {
      await fetchAndCacheCsrfToken()
    }

    const bootUser = mapBootUser()
    if (bootUser) {
      const roleAllowed = hasRoleAccess(bootUser.roles)
      const accessFromBoot = mapAccessFromBoot()
      const hasPortalAccess = roleAllowed && accessFromBoot.companyAllowed
      const accessIssue = accessFromBoot.accessIssue || (!roleAllowed ? "role_forbidden" : null)
      const accessMessage =
        accessFromBoot.accessMessage ||
        (!roleAllowed ? "Your account does not have one of the required portal roles." : null)

      set({
        status: "authenticated",
        user: bootUser,
        hasPortalAccess,
        accessIssue,
        accessMessage,
      })
      return
    }

    try {
      const response = await fetch("/api/method/frappe.auth.get_logged_user", {
        credentials: "include",
      })
      const payload = (await response.json().catch(() => ({}))) as LoggedUserResponse
      const user = payload?.message
      if (!user || user === "Guest") {
        set({
          status: "guest",
          user: null,
          hasPortalAccess: false,
          accessIssue: null,
          accessMessage: null,
        })
        return
      }

      const bootBranding = getCompanyBrandingFromBoot()
      const fallbackUser: PortalUser = {
        name: user,
        email: user,
        fullName: user,
        roles: [],
        userImage: null,
        company: bootBranding.name || getActiveCompanyFromBoot(),
        companyDisplayName: bootBranding.displayName,
        companyAbbr: bootBranding.abbr,
        companyLogo: bootBranding.logo,
        faviconUrl: bootBranding.faviconUrl,
      }

      const context = await fetchUserContext().catch(() => ({}))
      const userRoles = context.roles || []
      const roleAllowed = hasRoleAccess(userRoles)
      const activeCompany =
        context.active_company || context.company_display_name || fallbackUser.company || null
      const branding = context.company_branding || {}
      const companyDisplayName =
        branding.display_name ||
        context.company_display_name ||
        fallbackUser.companyDisplayName ||
        activeCompany
      const companyAbbr = branding.abbr || context.company_abbr || fallbackUser.companyAbbr || null
      const companyLogo = branding.logo || context.company_logo || fallbackUser.companyLogo || null
      const faviconUrl =
        branding.favicon_url ||
        context.favicon_url ||
        companyLogo ||
        fallbackUser.faviconUrl ||
        null
      const accessAllowed = Boolean(
        roleAllowed && (context.portal_access?.allowed ?? true) && activeCompany
      )
      const accessIssue =
        context.portal_access?.reason === "multiple_company_permissions"
          ? "multiple_company_permissions"
          : context.portal_access?.reason === "missing_company_permission"
            ? "missing_company_permission"
            : !roleAllowed
              ? "role_forbidden"
              : !activeCompany
                ? "missing_company_permission"
                : null
      const accessMessage =
        context.portal_access?.message ||
        (!roleAllowed ? "Your account does not have one of the required portal roles." : null) ||
        (!activeCompany ? "Assign exactly one Company User Permission to this user account." : null)

      set({
        status: "authenticated",
        user: {
          ...fallbackUser,
          roles: userRoles,
          company: activeCompany,
          companyDisplayName,
          companyAbbr,
          companyLogo,
          faviconUrl,
        },
        hasPortalAccess: accessAllowed,
        accessIssue,
        accessMessage,
      })
    } catch {
      set({
        status: "guest",
        user: null,
        hasPortalAccess: false,
        accessIssue: null,
        accessMessage: null,
      })
    }
  },

  logout: async () => {
    set({
      status: "guest",
      user: null,
      hasPortalAccess: false,
      accessIssue: null,
      accessMessage: null,
    })
    window.location.href = logoutRedirect()
  },
}))
