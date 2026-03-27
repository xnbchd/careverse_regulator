/**
 * Audit Log Types and Interfaces
 */

// ============================================================================
// Enums
// ============================================================================

export enum AuditAction {
  // CRUD Operations
  CREATE = "create",
  READ = "read",
  UPDATE = "update",
  DELETE = "delete",

  // License Actions
  LICENSE_APPROVE = "license_approve",
  LICENSE_DENY = "license_deny",
  LICENSE_SUSPEND = "license_suspend",
  LICENSE_RENEW = "license_renew",
  LICENSE_REVOKE = "license_revoke",
  LICENSE_EXPIRE = "license_expire",

  // Affiliation Actions
  AFFILIATION_APPROVE = "affiliation_approve",
  AFFILIATION_REJECT = "affiliation_reject",
  AFFILIATION_ACTIVATE = "affiliation_activate",
  AFFILIATION_DEACTIVATE = "affiliation_deactivate",

  // Inspection Actions
  INSPECTION_SCHEDULE = "inspection_schedule",
  INSPECTION_COMPLETE = "inspection_complete",
  INSPECTION_CANCEL = "inspection_cancel",
  INSPECTION_FAIL = "inspection_fail",

  // Document Actions
  DOCUMENT_UPLOAD = "document_upload",
  DOCUMENT_DOWNLOAD = "document_download",
  DOCUMENT_DELETE = "document_delete",
  DOCUMENT_SHARE = "document_share",

  // Form Actions
  FORM_SUBMIT = "form_submit",
  FORM_APPROVE = "form_approve",
  FORM_REJECT = "form_reject",

  // Bulk Actions
  BULK_APPROVE = "bulk_approve",
  BULK_REJECT = "bulk_reject",
  BULK_UPDATE = "bulk_update",
  BULK_DELETE = "bulk_delete",

  // Authentication
  LOGIN = "login",
  LOGOUT = "logout",
  SESSION_EXPIRE = "session_expire",
  PASSWORD_CHANGE = "password_change",

  // Settings
  SETTINGS_UPDATE = "settings_update",
  NOTIFICATION_SETTINGS_UPDATE = "notification_settings_update",

  // Export
  EXPORT_DATA = "export_data",
  REPORT_GENERATE = "report_generate",
}

export enum AuditEntity {
  LICENSE = "license",
  AFFILIATION = "affiliation",
  INSPECTION = "inspection",
  DOCUMENT = "document",
  FORM = "form",
  USER = "user",
  NOTIFICATION = "notification",
  SETTINGS = "settings",
  REPORT = "report",
  SYSTEM = "system",
}

export enum AuditSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

// ============================================================================
// Core Types
// ============================================================================

export interface AuditLog {
  id: string
  timestamp: string
  action: AuditAction
  entity: AuditEntity
  entityId?: string
  entityName?: string
  userId: string
  userName: string
  userEmail: string
  userRole?: string
  severity: AuditSeverity
  description: string
  details?: Record<string, any>
  changesBefore?: Record<string, any>
  changesAfter?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  sessionId?: string
  success: boolean
  errorMessage?: string
  metadata?: Record<string, any>
}

export interface AuditLogSearchParams {
  query?: string
  action?: AuditAction
  entity?: AuditEntity
  entityId?: string
  userId?: string
  severity?: AuditSeverity
  startDate?: string
  endDate?: string
  success?: boolean
  page?: number
  pageSize?: number
  sortBy?: "timestamp" | "action" | "entity" | "severity"
  sortOrder?: "asc" | "desc"
}

export interface AuditLogListResponse {
  logs: AuditLog[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface AuditLogStats {
  totalLogs: number
  logsByAction: Record<AuditAction, number>
  logsByEntity: Record<AuditEntity, number>
  logsBySeverity: Record<AuditSeverity, number>
  recentActivity: AuditLog[]
  topUsers: Array<{
    userId: string
    userName: string
    count: number
  }>
}

// ============================================================================
// Change Tracking
// ============================================================================

export interface ChangeRecord {
  field: string
  oldValue: any
  newValue: any
  timestamp: string
}

export interface EntityHistory {
  entityId: string
  entityType: AuditEntity
  changes: ChangeRecord[]
  logs: AuditLog[]
}

// ============================================================================
// Export Types
// ============================================================================

export enum AuditExportFormat {
  CSV = "csv",
  JSON = "json",
  PDF = "pdf",
}

export interface AuditExportRequest {
  format: AuditExportFormat
  filters?: AuditLogSearchParams
  includeDetails?: boolean
  includeChanges?: boolean
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    [AuditAction.CREATE]: "Created",
    [AuditAction.READ]: "Viewed",
    [AuditAction.UPDATE]: "Updated",
    [AuditAction.DELETE]: "Deleted",
    [AuditAction.LICENSE_APPROVE]: "License Approved",
    [AuditAction.LICENSE_DENY]: "License Denied",
    [AuditAction.LICENSE_SUSPEND]: "License Suspended",
    [AuditAction.LICENSE_RENEW]: "License Renewed",
    [AuditAction.LICENSE_REVOKE]: "License Revoked",
    [AuditAction.LICENSE_EXPIRE]: "License Expired",
    [AuditAction.AFFILIATION_APPROVE]: "Affiliation Approved",
    [AuditAction.AFFILIATION_REJECT]: "Affiliation Rejected",
    [AuditAction.AFFILIATION_ACTIVATE]: "Affiliation Activated",
    [AuditAction.AFFILIATION_DEACTIVATE]: "Affiliation Deactivated",
    [AuditAction.INSPECTION_SCHEDULE]: "Inspection Scheduled",
    [AuditAction.INSPECTION_COMPLETE]: "Inspection Completed",
    [AuditAction.INSPECTION_CANCEL]: "Inspection Cancelled",
    [AuditAction.INSPECTION_FAIL]: "Inspection Failed",
    [AuditAction.DOCUMENT_UPLOAD]: "Document Uploaded",
    [AuditAction.DOCUMENT_DOWNLOAD]: "Document Downloaded",
    [AuditAction.DOCUMENT_DELETE]: "Document Deleted",
    [AuditAction.DOCUMENT_SHARE]: "Document Shared",
    [AuditAction.FORM_SUBMIT]: "Form Submitted",
    [AuditAction.FORM_APPROVE]: "Form Approved",
    [AuditAction.FORM_REJECT]: "Form Rejected",
    [AuditAction.BULK_APPROVE]: "Bulk Approved",
    [AuditAction.BULK_REJECT]: "Bulk Rejected",
    [AuditAction.BULK_UPDATE]: "Bulk Updated",
    [AuditAction.BULK_DELETE]: "Bulk Deleted",
    [AuditAction.LOGIN]: "Logged In",
    [AuditAction.LOGOUT]: "Logged Out",
    [AuditAction.SESSION_EXPIRE]: "Session Expired",
    [AuditAction.PASSWORD_CHANGE]: "Password Changed",
    [AuditAction.SETTINGS_UPDATE]: "Settings Updated",
    [AuditAction.NOTIFICATION_SETTINGS_UPDATE]: "Notification Settings Updated",
    [AuditAction.EXPORT_DATA]: "Data Exported",
    [AuditAction.REPORT_GENERATE]: "Report Generated",
  }
  return labels[action] || action
}

export function getEntityLabel(entity: AuditEntity): string {
  const labels: Record<AuditEntity, string> = {
    [AuditEntity.LICENSE]: "License",
    [AuditEntity.AFFILIATION]: "Affiliation",
    [AuditEntity.INSPECTION]: "Inspection",
    [AuditEntity.DOCUMENT]: "Document",
    [AuditEntity.FORM]: "Form",
    [AuditEntity.USER]: "User",
    [AuditEntity.NOTIFICATION]: "Notification",
    [AuditEntity.SETTINGS]: "Settings",
    [AuditEntity.REPORT]: "Report",
    [AuditEntity.SYSTEM]: "System",
  }
  return labels[entity] || entity
}

export function getSeverityColor(severity: AuditSeverity): string {
  const colors: Record<AuditSeverity, string> = {
    [AuditSeverity.LOW]: "text-muted-foreground bg-muted/50 border-border",
    [AuditSeverity.MEDIUM]: "text-blue-600 bg-blue-50 border-blue-200",
    [AuditSeverity.HIGH]: "text-orange-600 bg-orange-50 border-orange-200",
    [AuditSeverity.CRITICAL]: "text-red-600 bg-red-50 border-red-200",
  }
  return colors[severity]
}

export function getSeverityLabel(severity: AuditSeverity): string {
  const labels: Record<AuditSeverity, string> = {
    [AuditSeverity.LOW]: "Low",
    [AuditSeverity.MEDIUM]: "Medium",
    [AuditSeverity.HIGH]: "High",
    [AuditSeverity.CRITICAL]: "Critical",
  }
  return labels[severity]
}

export function getActionSeverity(action: AuditAction): AuditSeverity {
  // Determine severity based on action type
  const criticalActions = [
    AuditAction.DELETE,
    AuditAction.LICENSE_REVOKE,
    AuditAction.LICENSE_SUSPEND,
    AuditAction.BULK_DELETE,
  ]

  const highActions = [
    AuditAction.LICENSE_APPROVE,
    AuditAction.LICENSE_DENY,
    AuditAction.AFFILIATION_REJECT,
    AuditAction.INSPECTION_FAIL,
    AuditAction.BULK_APPROVE,
    AuditAction.BULK_REJECT,
  ]

  const mediumActions = [
    AuditAction.UPDATE,
    AuditAction.LICENSE_RENEW,
    AuditAction.AFFILIATION_APPROVE,
    AuditAction.INSPECTION_COMPLETE,
    AuditAction.FORM_SUBMIT,
    AuditAction.SETTINGS_UPDATE,
  ]

  if (criticalActions.includes(action)) return AuditSeverity.CRITICAL
  if (highActions.includes(action)) return AuditSeverity.HIGH
  if (mediumActions.includes(action)) return AuditSeverity.MEDIUM
  return AuditSeverity.LOW
}

export function formatChangeValue(value: any): string {
  if (value === null || value === undefined) return "None"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (typeof value === "object") return JSON.stringify(value, null, 2)
  if (Array.isArray(value)) return value.join(", ")
  return String(value)
}
