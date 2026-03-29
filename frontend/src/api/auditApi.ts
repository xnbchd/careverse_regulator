import apiClient from "./client"
import type {
  AuditLog,
  AuditLogSearchParams,
  AuditLogListResponse,
  AuditLogStats,
  EntityHistory,
  AuditExportRequest,
} from "@/types/audit"
import { AuditAction, AuditEntity, AuditSeverity } from "@/types/audit"

const API_BASE = "/api/method/compliance_360.api.audit"

/**
 * Log an audit event
 */
export async function logAuditEvent(log: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
  const response = await apiClient.post<{ message: any }>(`${API_BASE}.log_event`, {
    action: log.action,
    entity: log.entity,
    entity_id: log.entityId,
    entity_name: log.entityName,
    user_id: log.userId,
    user_name: log.userName,
    user_email: log.userEmail,
    user_role: log.userRole,
    severity: log.severity,
    description: log.description,
    details: log.details,
    changes_before: log.changesBefore,
    changes_after: log.changesAfter,
    ip_address: log.ipAddress,
    user_agent: log.userAgent,
    session_id: log.sessionId,
    success: log.success,
    error_message: log.errorMessage,
    metadata: log.metadata,
  })

  return transformAuditLog(response.message)
}

/**
 * List audit logs with filtering and pagination
 */
export async function listAuditLogs(
  params: AuditLogSearchParams = {}
): Promise<AuditLogListResponse> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.list_logs`, {
    params: {
      query: params.query,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId,
      user_id: params.userId,
      severity: params.severity,
      start_date: params.startDate,
      end_date: params.endDate,
      success: params.success,
      page: params.page,
      page_size: params.pageSize,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
    },
    cache: false, // Don't cache audit logs
  })

  const data = response.message
  return {
    logs: data.logs.map(transformAuditLog),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  }
}

/**
 * Get single audit log by ID
 */
export async function getAuditLog(logId: string): Promise<AuditLog> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_log`, {
    params: { log_id: logId },
  })

  return transformAuditLog(response.message)
}

/**
 * Get audit statistics
 */
export async function getAuditStats(dateRange?: {
  startDate: string
  endDate: string
}): Promise<AuditLogStats> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_stats`, {
    params: {
      start_date: dateRange?.startDate,
      end_date: dateRange?.endDate,
    },
    cache: true,
    cacheTime: 2 * 60 * 1000, // Cache for 2 minutes
  })

  const data = response.message
  return {
    totalLogs: data.total_logs,
    logsByAction: data.logs_by_action,
    logsByEntity: data.logs_by_entity,
    logsBySeverity: data.logs_by_severity,
    recentActivity: data.recent_activity.map(transformAuditLog),
    topUsers: data.top_users,
  }
}

/**
 * Get entity audit history
 */
export async function getEntityHistory(
  entityType: AuditEntity,
  entityId: string
): Promise<EntityHistory> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_entity_history`, {
    params: {
      entity_type: entityType,
      entity_id: entityId,
    },
  })

  const data = response.message
  return {
    entityId,
    entityType,
    changes: data.changes,
    logs: data.logs.map(transformAuditLog),
  }
}

/**
 * Export audit logs
 */
export async function exportAuditLogs(request: AuditExportRequest): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    `${API_BASE}.export_logs`,
    {
      format: request.format,
      filters: request.filters,
      include_details: request.includeDetails,
      include_changes: request.includeChanges,
    },
    {
      // Response will be a file blob
      headers: {
        Accept:
          request.format === "pdf"
            ? "application/pdf"
            : request.format === "csv"
              ? "text/csv"
              : "application/json",
      },
    }
  )

  return response as unknown as Blob
}

/**
 * Transform backend audit log to frontend format
 */
function transformAuditLog(data: any): AuditLog {
  return {
    id: data.name || data.id,
    timestamp: data.timestamp || data.creation,
    action: data.action,
    entity: data.entity,
    entityId: data.entity_id,
    entityName: data.entity_name,
    userId: data.user_id,
    userName: data.user_name,
    userEmail: data.user_email,
    userRole: data.user_role,
    severity: data.severity,
    description: data.description,
    details: data.details,
    changesBefore: data.changes_before,
    changesAfter: data.changes_after,
    ipAddress: data.ip_address,
    userAgent: data.user_agent,
    sessionId: data.session_id,
    success: data.success,
    errorMessage: data.error_message,
    metadata: data.metadata,
  }
}

// ============================================================================
// Mock Data (for development)
// ============================================================================

const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "AUDIT-001",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    action: AuditAction.LICENSE_APPROVE,
    entity: AuditEntity.LICENSE,
    entityId: "LIC-2024-001",
    entityName: "General Hospital License",
    userId: "user-001",
    userName: "John Regulator",
    userEmail: "john@regulator.gov",
    userRole: "Senior Inspector",
    severity: AuditSeverity.HIGH,
    description: "Approved license application for General Hospital",
    details: {
      licenseType: "Hospital",
      validityPeriod: "5 years",
    },
    changesBefore: { status: "Pending" },
    changesAfter: { status: "Approved", approvedBy: "john@regulator.gov" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0...",
    success: true,
  },
  {
    id: "AUDIT-002",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    action: AuditAction.DOCUMENT_UPLOAD,
    entity: AuditEntity.DOCUMENT,
    entityId: "DOC-001",
    entityName: "Facility Plan.pdf",
    userId: "user-002",
    userName: "Jane Operator",
    userEmail: "jane@hospital.com",
    userRole: "Facility Manager",
    severity: AuditSeverity.LOW,
    description: "Uploaded facility plan document",
    details: {
      fileSize: "2.4 MB",
      category: "Application",
    },
    ipAddress: "192.168.1.105",
    success: true,
  },
  {
    id: "AUDIT-003",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    action: AuditAction.BULK_APPROVE,
    entity: AuditEntity.AFFILIATION,
    userId: "user-001",
    userName: "John Regulator",
    userEmail: "john@regulator.gov",
    severity: AuditSeverity.HIGH,
    description: "Bulk approved 15 affiliation requests",
    details: {
      totalProcessed: 15,
      succeeded: 15,
      failed: 0,
    },
    ipAddress: "192.168.1.100",
    success: true,
  },
]

/**
 * Mock implementation for development
 */
export async function listAuditLogsMock(
  params: AuditLogSearchParams = {}
): Promise<AuditLogListResponse> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filtered = [...MOCK_AUDIT_LOGS]

  // Apply filters
  if (params.query) {
    const query = params.query.toLowerCase()
    filtered = filtered.filter(
      (log) =>
        log.description.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.entityName?.toLowerCase().includes(query)
    )
  }

  if (params.action) {
    filtered = filtered.filter((log) => log.action === params.action)
  }

  if (params.entity) {
    filtered = filtered.filter((log) => log.entity === params.entity)
  }

  if (params.userId) {
    filtered = filtered.filter((log) => log.userId === params.userId)
  }

  if (params.severity) {
    filtered = filtered.filter((log) => log.severity === params.severity)
  }

  if (params.success !== undefined) {
    filtered = filtered.filter((log) => log.success === params.success)
  }

  // Sort
  const sortBy = params.sortBy || "timestamp"
  const sortOrder = params.sortOrder || "desc"
  filtered.sort((a, b) => {
    const aVal = a[sortBy] as any
    const bVal = b[sortBy] as any

    if (sortOrder === "desc") {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })

  // Paginate
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginated = filtered.slice(start, end)

  return {
    logs: paginated,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  }
}
