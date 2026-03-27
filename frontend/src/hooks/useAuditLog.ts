import { useCallback } from "react"
import { useAuditStore } from "@/stores/auditStore"
import { useAuthStore } from "@/stores/authStore"
import type { AuditAction, AuditEntity, AuditSeverity, AuditLog } from "@/types/audit"
import { getActionSeverity } from "@/types/audit"

/**
 * Hook for logging audit events with automatic user context
 *
 * @example
 * const { logEvent } = useAuditLog()
 *
 * // Simple usage
 * await logEvent({
 *   action: AuditAction.LICENSE_APPROVE,
 *   entity: AuditEntity.LICENSE,
 *   entityId: 'LIC-2024-001',
 *   description: 'Approved license application',
 * })
 *
 * // With change tracking
 * await logEvent({
 *   action: AuditAction.UPDATE,
 *   entity: AuditEntity.LICENSE,
 *   entityId: 'LIC-2024-001',
 *   description: 'Updated license status',
 *   changesBefore: { status: 'Pending' },
 *   changesAfter: { status: 'Active' },
 * })
 */
export function useAuditLog() {
  const logEvent = useAuditStore((state) => state.logEvent)
  const user = useAuthStore((state) => state.user)

  /**
   * Log an audit event with automatic user context
   */
  const log = useCallback(
    async (params: {
      action: AuditAction
      entity: AuditEntity
      entityId?: string
      entityName?: string
      description: string
      details?: Record<string, any>
      changesBefore?: Record<string, any>
      changesAfter?: Record<string, any>
      severity?: AuditSeverity
      success?: boolean
      errorMessage?: string
      metadata?: Record<string, any>
    }) => {
      try {
        // Get user context
        const userId = user?.email || "system"
        const userName = user?.name || user?.fullName || user?.email || "System"
        const userEmail = user?.email || "system@localhost"
        const userRole = user?.role || "Unknown"

        // Get browser context
        const ipAddress = undefined // IP should come from backend
        const userAgent = navigator.userAgent
        const sessionId = sessionStorage.getItem("sessionId") || undefined

        // Determine severity if not provided
        const severity = params.severity || getActionSeverity(params.action)

        // Success defaults to true unless explicitly set to false or error message provided
        const success = params.success !== undefined ? params.success : !params.errorMessage

        // Log the event
        await logEvent({
          ...params,
          userId,
          userName,
          userEmail,
          userRole,
          severity,
          ipAddress,
          userAgent,
          sessionId,
          success,
        })
      } catch (error) {
        console.error("Failed to log audit event:", error)
        // Don't throw - audit logging should not break the application
      }
    },
    [logEvent, user]
  )

  /**
   * Log a successful action
   */
  const logSuccess = useCallback(
    async (params: {
      action: AuditAction
      entity: AuditEntity
      entityId?: string
      entityName?: string
      description: string
      details?: Record<string, any>
      changesBefore?: Record<string, any>
      changesAfter?: Record<string, any>
      severity?: AuditSeverity
    }) => {
      await log({ ...params, success: true })
    },
    [log]
  )

  /**
   * Log a failed action
   */
  const logFailure = useCallback(
    async (params: {
      action: AuditAction
      entity: AuditEntity
      entityId?: string
      entityName?: string
      description: string
      errorMessage: string
      details?: Record<string, any>
      severity?: AuditSeverity
    }) => {
      await log({ ...params, success: false })
    },
    [log]
  )

  /**
   * Log a CRUD create action
   */
  const logCreate = useCallback(
    async (params: {
      entity: AuditEntity
      entityId: string
      entityName: string
      details?: Record<string, any>
      changesAfter?: Record<string, any>
    }) => {
      await log({
        action: "create" as AuditAction,
        description: `Created ${params.entityName}`,
        ...params,
      })
    },
    [log]
  )

  /**
   * Log a CRUD read action
   */
  const logRead = useCallback(
    async (params: {
      entity: AuditEntity
      entityId: string
      entityName: string
      details?: Record<string, any>
    }) => {
      await log({
        action: "read" as AuditAction,
        description: `Viewed ${params.entityName}`,
        severity: "low" as AuditSeverity,
        ...params,
      })
    },
    [log]
  )

  /**
   * Log a CRUD update action
   */
  const logUpdate = useCallback(
    async (params: {
      entity: AuditEntity
      entityId: string
      entityName: string
      changesBefore: Record<string, any>
      changesAfter: Record<string, any>
      details?: Record<string, any>
    }) => {
      await log({
        action: "update" as AuditAction,
        description: `Updated ${params.entityName}`,
        ...params,
      })
    },
    [log]
  )

  /**
   * Log a CRUD delete action
   */
  const logDelete = useCallback(
    async (params: {
      entity: AuditEntity
      entityId: string
      entityName: string
      changesBefore?: Record<string, any>
      details?: Record<string, any>
    }) => {
      await log({
        action: "delete" as AuditAction,
        description: `Deleted ${params.entityName}`,
        severity: "critical" as AuditSeverity,
        ...params,
      })
    },
    [log]
  )

  /**
   * Log authentication events
   */
  const logAuth = useCallback(
    async (params: {
      action: "login" | "logout" | "session_expire" | "password_change"
      success?: boolean
      errorMessage?: string
      details?: Record<string, any>
    }) => {
      const descriptions: Record<string, string> = {
        login: "User logged in",
        logout: "User logged out",
        session_expire: "User session expired",
        password_change: "User changed password",
      }

      await log({
        action: params.action as AuditAction,
        entity: "user" as AuditEntity,
        entityId: user?.email || "unknown",
        entityName: user?.name || user?.fullName || "User",
        description: descriptions[params.action],
        success: params.success,
        errorMessage: params.errorMessage,
        details: params.details,
      })
    },
    [log, user]
  )

  /**
   * Log export actions
   */
  const logExport = useCallback(
    async (params: {
      entity: AuditEntity
      format: string
      description?: string
      details?: Record<string, any>
    }) => {
      await log({
        action: "export_data" as AuditAction,
        entity: params.entity,
        description: params.description || `Exported ${params.entity} data as ${params.format}`,
        details: {
          format: params.format,
          ...params.details,
        },
      })
    },
    [log]
  )

  return {
    log,
    logSuccess,
    logFailure,
    logCreate,
    logRead,
    logUpdate,
    logDelete,
    logAuth,
    logExport,
  }
}
