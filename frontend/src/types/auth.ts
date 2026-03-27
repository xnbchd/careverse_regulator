export type AuthStatus = "loading" | "authenticated" | "guest"
export type AccessIssue =
  | "missing_company_permission"
  | "multiple_company_permissions"
  | "role_forbidden"
  | null

export interface PortalUser {
  name: string
  email: string
  fullName: string
  userImage?: string | null
  company?: string | null
  companyDisplayName?: string | null
  companyAbbr?: string | null
  companyLogo?: string | null
  faviconUrl?: string | null
  roles: string[]
}

export interface AuthState {
  status: AuthStatus
  user: PortalUser | null
  hasPortalAccess: boolean
  accessIssue: AccessIssue
  accessMessage: string | null
  initialize: () => Promise<void>
  logout: () => Promise<void>
}
