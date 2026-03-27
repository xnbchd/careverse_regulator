// Portal roles — the 3 actual roles in the regulator portal
export type PortalRole = "Regulator Admin" | "Inspection Manager" | "Regulator User"

// Frappe User enabled = 1 → 'active', enabled = 0 → 'disabled'
export type UserStatus = "active" | "disabled"

// Mirrors the compliance_360 UserSummary Pydantic schema
export interface FrappeUser {
  name: string // email — document primary key
  email: string
  full_name: string | null
  first_name?: string
  last_name?: string
  username: string | null // used for ID Number
  user_type: string | null
  enabled: number // 1 or 0
  mobile_no: string | null
  role_profile_name: string | null
  roles: string[]
  creation: string | null
}

// Create user form payload — maps to backend create_user kwargs
export interface CreateUserPayload {
  email: string
  first_name: string
  last_name: string
  username?: string // ID Number
  mobile_no: string
  roles: string[] // e.g. ['Regulator Admin']
  send_welcome_email: 0 | 1
  user_type?: string
  role_profile_name?: string
}

// Edit user form payload — maps to backend update_user kwargs
export interface UpdateUserPayload {
  user_id: string
  first_name?: string
  last_name?: string
  username?: string
  mobile_no?: string
  roles?: string[]
  enabled?: 0 | 1
  role_profile_name?: string
}

// Bulk upload result types
export interface BulkUserRecord {
  index: number
  status: "created" | "failed" | "would_create" | "would_fail"
  email: string
  name?: string
  error?: string
}

export interface BulkCreateResult {
  total: number
  created: number
  failed: number
  dry_run: boolean
  results: BulkUserRecord[]
}

// Pagination from api_response_formatter
export interface PaginationInfo {
  current_page: number
  page_size: number
  start: number
  end: number
  count: number
}

// User activity report
export interface UserActivityReport {
  name: string
  report_name: string
  generated_by: string
  from_date: string
  to_date: string
  target_user: string | null
  status: string
  total_events: number
  creation: string
}

export interface ActivityLogEntry {
  user_id: string
  user_name: string
  event_date: string
  event_time: string
  action: string
  ip_address: string
  source: string
  timestamp?: string
}

export interface ActivityReportDetail extends UserActivityReport {
  users: {
    user_id: string
    user_name: string
    activity_logs: ActivityLogEntry[]
  }[]
}

// Filter types for the users list
export interface UserFilters {
  search?: string
  role?: PortalRole | "all"
  status?: UserStatus | "all"
  page: number
  page_size: number
}

// Static role definitions for the Roles tab
export interface RoleDefinition {
  name: PortalRole
  description: string
  capabilities: string[]
}

// Activity report list filters
export interface ActivityReportFilters {
  from_date?: string
  to_date?: string
  target_user?: string
  page: number
  page_size: number
}
