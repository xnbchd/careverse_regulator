import { apiClient } from "@/api/client"
import { getCsrfToken } from "@/utils/boot"
import type {
  FrappeUser,
  CreateUserPayload,
  UpdateUserPayload,
  BulkCreateResult,
  PaginationInfo,
  UserActivityReport,
  ActivityReportDetail,
  ActivityLogEntry,
} from "@/types/user"

const USER_API = "/api/method/compliance_360.api.user_management.user"
const PASSWORD_API = "/api/method/compliance_360.api.user_management.password_reset"
const ACTIVITY_API = "/api/method/compliance_360.api.metrics.user_activity"

// ---------------------------------------------------------------------------
// Response envelope helpers
// ---------------------------------------------------------------------------

// The backend api_response_formatter merges {status, data, pagination} directly
// into frappe.local.response. For whitelisted methods that use it, Frappe wraps
// the return value under `message`, but since api_response_formatter uses
// frappe.local.response.update() and returns None, the shape varies:
//
//   - If api_response_formatter is used:  { status, data, pagination }  (top-level)
//   - If the method returns a dict:       { message: { status, data, pagination } }
//
// We handle both cases transparently.

interface ApiEnvelope<T> {
  status?: string
  data?: T
  pagination?: PaginationInfo
  message?: {
    status?: string
    data?: T
    pagination?: PaginationInfo
    message?: string
  } | null
}

function extractData<T>(response: ApiEnvelope<T>): T {
  // Try top-level first (api_response_formatter path)
  if (response.data !== undefined) {
    return response.data
  }
  // Fallback to nested message path
  if (response.message && typeof response.message === "object" && "data" in response.message) {
    return response.message.data as T
  }
  return [] as unknown as T
}

function extractPagination<T>(response: ApiEnvelope<T>): PaginationInfo | null {
  // Try top-level first
  if (response.pagination) {
    return response.pagination
  }
  // Fallback to nested message path
  if (response.message && typeof response.message === "object" && response.message.pagination) {
    return response.message.pagination
  }
  return null
}

// ---------------------------------------------------------------------------
// User CRUD
// ---------------------------------------------------------------------------

export interface FetchUsersParams {
  page?: number
  page_size?: number
  search?: string
  enabled?: 0 | 1
  include_roles?: 0 | 1
  sort_field?: string
  sort_order?: "asc" | "desc"
}

export interface FetchUsersResult {
  users: FrappeUser[]
  pagination: PaginationInfo | null
}

export async function fetchUsers(params: FetchUsersParams = {}): Promise<FetchUsersResult> {
  const response = await apiClient.get<ApiEnvelope<FrappeUser[]>>(`${USER_API}.list_users`, {
    params: {
      page: params.page ?? 1,
      page_size: params.page_size ?? 20,
      search: params.search || undefined,
      enabled: params.enabled,
      include_roles: params.include_roles ?? 1,
      sort_field: params.sort_field ?? "creation",
      sort_order: params.sort_order ?? "desc",
    },
    cache: false,
  })

  return {
    users: extractData(response) || [],
    pagination: extractPagination(response),
  }
}

export async function createUser(payload: CreateUserPayload): Promise<FrappeUser> {
  const response = await apiClient.post<ApiEnvelope<FrappeUser>>(`${USER_API}.create_user`, {
    ...payload,
    roles: JSON.stringify(payload.roles),
  })
  return extractData(response)
}

export async function updateUser(payload: UpdateUserPayload): Promise<FrappeUser> {
  const body: Record<string, any> = { ...payload }
  if (payload.roles) {
    body.roles = JSON.stringify(payload.roles)
  }

  const response = await apiClient.post<ApiEnvelope<FrappeUser>>(`${USER_API}.update_user`, body)
  return extractData(response)
}

export async function deleteUser(
  userId: string
): Promise<{ user_id: string; action: string; message: string }> {
  const response = await apiClient.post<
    ApiEnvelope<{ user_id: string; action: string; message: string }>
  >(`${USER_API}.delete_user`, { user_id: userId, force: 0 })
  return extractData(response)
}

// ---------------------------------------------------------------------------
// Bulk upload
// ---------------------------------------------------------------------------

export async function bulkCreateUsers(file: File, dryRun = false): Promise<BulkCreateResult> {
  const formData = new FormData()
  formData.append("file", file)
  if (dryRun) {
    formData.append("dry_run", "1")
  }

  const response = await apiClient.post<ApiEnvelope<BulkCreateResult>>(
    `${USER_API}.bulk_create_users`,
    formData
  )
  return extractData(response)
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

export async function triggerPasswordReset(
  userId: string
): Promise<{ user_id: string; reset_link_sent: boolean; message: string }> {
  const response = await apiClient.post<
    ApiEnvelope<{ user_id: string; reset_link_sent: boolean; message: string }>
  >(`${PASSWORD_API}.trigger_password_reset`, { user_id: userId })
  return extractData(response)
}

// ---------------------------------------------------------------------------
// Activity reports
// ---------------------------------------------------------------------------

export interface CreateActivityReportParams {
  from_date: string
  to_date: string
  target_user?: string
}

export async function createActivityReport(
  params: CreateActivityReportParams
): Promise<UserActivityReport> {
  const response = await apiClient.post<ApiEnvelope<UserActivityReport>>(
    `${ACTIVITY_API}.create_user_activity_report`,
    params
  )
  return extractData(response)
}

export interface ListActivityReportsParams {
  page?: number
  page_size?: number
  status?: string
  target_user?: string
  sort_order?: "asc" | "desc"
}

export interface ListActivityReportsResult {
  reports: UserActivityReport[]
  pagination: PaginationInfo | null
}

export async function listActivityReports(
  params: ListActivityReportsParams = {}
): Promise<ListActivityReportsResult> {
  const response = await apiClient.get<ApiEnvelope<UserActivityReport[]>>(
    `${ACTIVITY_API}.list_activity_reports`,
    {
      params: {
        page: params.page ?? 1,
        page_size: params.page_size ?? 10,
        status: params.status || undefined,
        target_user: params.target_user || undefined,
        sort_order: params.sort_order ?? "desc",
      },
      cache: false,
    }
  )

  return {
    reports: extractData(response) || [],
    pagination: extractPagination(response),
  }
}

export async function viewActivityReportDetails(
  reportId: string,
  page = 1,
  pageSize = 20
): Promise<{ report: ActivityReportDetail; pagination: PaginationInfo | null }> {
  const response = await apiClient.get<ApiEnvelope<ActivityReportDetail>>(
    `${ACTIVITY_API}.view_activity_report_details`,
    {
      params: { report_id: reportId, page, page_size: pageSize },
      cache: false,
    }
  )

  return {
    report: extractData(response),
    pagination: extractPagination(response),
  }
}

export async function downloadActivityReport(reportId: string): Promise<void> {
  const csrfToken = getCsrfToken()
  const url = `${ACTIVITY_API}.download_user_activity_report?report_id=${encodeURIComponent(
    reportId
  )}`

  const response = await fetch(url, {
    credentials: "include",
    headers: csrfToken ? { "X-Frappe-CSRF-Token": csrfToken } : {},
  })

  if (!response.ok) {
    throw new Error("Failed to download report")
  }

  const blob = await response.blob()
  const downloadUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = downloadUrl
  a.download = `user_activity_report_${reportId}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(downloadUrl)
}

export async function deleteActivityReport(reportId: string): Promise<void> {
  await apiClient.post(`${ACTIVITY_API}.delete_user_activity_report`, { report_id: reportId })
}
