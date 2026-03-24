import type {
  AuditAction,
  AuditEntity,
  AuditSeverity,
} from '@/types/audit'

/**
 * Audit logging middleware and utilities for automatic tracking
 */

interface AuditContext {
  userId: string
  userName: string
  userEmail: string
  userRole?: string
}

interface AuditConfig {
  enabled: boolean
  logReads: boolean // Whether to log read operations (can be verbose)
  logNavigation: boolean // Whether to log page navigation
  logErrors: boolean // Whether to log JavaScript errors
  excludeActions?: AuditAction[] // Actions to skip logging
  excludeEntities?: AuditEntity[] // Entities to skip logging
}

const defaultConfig: AuditConfig = {
  enabled: true,
  logReads: false, // Disabled by default to reduce noise
  logNavigation: false, // Disabled by default
  logErrors: true,
  excludeActions: [],
  excludeEntities: [],
}

let currentConfig = { ...defaultConfig }
let auditContext: AuditContext | null = null

/**
 * Initialize audit middleware with configuration
 */
export function initializeAuditMiddleware(config: Partial<AuditConfig>) {
  currentConfig = { ...defaultConfig, ...config }
}

/**
 * Set the current user context for audit logging
 */
export function setAuditContext(context: AuditContext | null) {
  auditContext = context
}

/**
 * Get the current audit configuration
 */
export function getAuditConfig(): AuditConfig {
  return { ...currentConfig }
}

/**
 * Check if an action should be logged based on configuration
 */
export function shouldLogAction(
  action: AuditAction,
  entity: AuditEntity
): boolean {
  if (!currentConfig.enabled) return false

  // Check if action is excluded
  if (currentConfig.excludeActions?.includes(action)) return false

  // Check if entity is excluded
  if (currentConfig.excludeEntities?.includes(entity)) return false

  // Check if read logging is disabled
  if (!currentConfig.logReads && action === ('read' as AuditAction)) return false

  return true
}

/**
 * Wrap an async function with automatic audit logging
 *
 * @example
 * const approveWithAudit = withAuditLog(
 *   approveLicense,
 *   {
 *     action: AuditAction.LICENSE_APPROVE,
 *     entity: AuditEntity.LICENSE,
 *     getDescription: (licenseId) => `Approved license ${licenseId}`,
 *     getEntityId: (licenseId) => licenseId,
 *   }
 * )
 *
 * await approveWithAudit('LIC-2024-001')
 */
export function withAuditLog<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  config: {
    action: AuditAction
    entity: AuditEntity
    getDescription: (...args: TArgs) => string
    getEntityId?: (...args: TArgs) => string
    getEntityName?: (...args: TArgs) => string
    getDetails?: (...args: TArgs) => Record<string, any>
    getChangesBefore?: (...args: TArgs) => Record<string, any>
    getChangesAfter?: (result: TReturn, ...args: TArgs) => Record<string, any>
    severity?: AuditSeverity
  }
): (...args: TArgs) => Promise<TReturn> {
  return async (...args: TArgs) => {
    const startTime = Date.now()
    let success = false
    let error: Error | null = null
    let result: TReturn

    try {
      result = await fn(...args)
      success = true
      return result
    } catch (err) {
      error = err as Error
      throw err
    } finally {
      // Log the event (don't await to avoid blocking)
      if (shouldLogAction(config.action, config.entity)) {
        const duration = Date.now() - startTime

        // Import dynamically to avoid circular dependencies
        import('@/stores/auditStore').then(({ useAuditStore }) => {
          const store = useAuditStore.getState()

          store.logEvent({
            action: config.action,
            entity: config.entity,
            entityId: config.getEntityId?.(...args),
            entityName: config.getEntityName?.(...args),
            userId: auditContext?.userId || 'unknown',
            userName: auditContext?.userName || 'Unknown User',
            userEmail: auditContext?.userEmail || 'unknown@localhost',
            userRole: auditContext?.userRole,
            severity: config.severity || ('medium' as AuditSeverity),
            description: config.getDescription(...args),
            details: {
              ...config.getDetails?.(...args),
              duration,
            },
            changesBefore: config.getChangesBefore?.(...args),
            changesAfter: success && result ? config.getChangesAfter?.(result, ...args) : undefined,
            success,
            errorMessage: error?.message,
            userAgent: navigator.userAgent,
          }).catch(err => {
            console.error('Failed to log audit event:', err)
          })
        })
      }
    }
  }
}

/**
 * Higher-order function to create audit-logged API methods
 *
 * @example
 * const api = {
 *   approveLicense: createAuditedMethod(
 *     (licenseId: string) => apiClient.post('/approve', { licenseId }),
 *     {
 *       action: AuditAction.LICENSE_APPROVE,
 *       entity: AuditEntity.LICENSE,
 *       getDescription: (licenseId) => `Approved license ${licenseId}`,
 *     }
 *   ),
 * }
 */
export function createAuditedMethod<TArgs extends any[], TReturn>(
  method: (...args: TArgs) => Promise<TReturn>,
  config: {
    action: AuditAction
    entity: AuditEntity
    getDescription: (...args: TArgs) => string
    getEntityId?: (...args: TArgs) => string
    getEntityName?: (...args: TArgs) => string
    getDetails?: (...args: TArgs) => Record<string, any>
    severity?: AuditSeverity
  }
) {
  return withAuditLog(method, config)
}

/**
 * Decorator for automatic error logging
 * Captures unhandled errors and logs them as audit events
 */
export function setupErrorLogging() {
  if (!currentConfig.logErrors) return

  // Capture unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    import('@/stores/auditStore').then(({ useAuditStore }) => {
      const store = useAuditStore.getState()

      store.logEvent({
        action: 'delete' as AuditAction, // Using delete as it's critical severity
        entity: 'system' as AuditEntity,
        userId: auditContext?.userId || 'system',
        userName: auditContext?.userName || 'System',
        userEmail: auditContext?.userEmail || 'system@localhost',
        userRole: auditContext?.userRole,
        severity: 'critical' as AuditSeverity,
        description: 'Unhandled promise rejection',
        details: {
          error: event.reason?.message || String(event.reason),
          stack: event.reason?.stack,
        },
        success: false,
        errorMessage: event.reason?.message || String(event.reason),
        userAgent: navigator.userAgent,
      }).catch(err => {
        console.error('Failed to log error event:', err)
      })
    })
  })

  // Capture global errors
  window.addEventListener('error', (event) => {
    import('@/stores/auditStore').then(({ useAuditStore }) => {
      const store = useAuditStore.getState()

      store.logEvent({
        action: 'delete' as AuditAction,
        entity: 'system' as AuditEntity,
        userId: auditContext?.userId || 'system',
        userName: auditContext?.userName || 'System',
        userEmail: auditContext?.userEmail || 'system@localhost',
        userRole: auditContext?.userRole,
        severity: 'critical' as AuditSeverity,
        description: 'Global error',
        details: {
          message: event.message,
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          stack: event.error?.stack,
        },
        success: false,
        errorMessage: event.message,
        userAgent: navigator.userAgent,
      }).catch(err => {
        console.error('Failed to log error event:', err)
      })
    })
  })
}

/**
 * Track page navigation
 * Should be called when route changes
 */
export function logNavigation(route: string, params?: Record<string, string>) {
  if (!currentConfig.logNavigation) return

  import('@/stores/auditStore').then(({ useAuditStore }) => {
    const store = useAuditStore.getState()

    store.logEvent({
      action: 'read' as AuditAction,
      entity: 'system' as AuditEntity,
      userId: auditContext?.userId || 'unknown',
      userName: auditContext?.userName || 'Unknown User',
      userEmail: auditContext?.userEmail || 'unknown@localhost',
      userRole: auditContext?.userRole,
      severity: 'low' as AuditSeverity,
      description: `Navigated to ${route}`,
      details: {
        route,
        params,
      },
      success: true,
      userAgent: navigator.userAgent,
    }).catch(err => {
      console.error('Failed to log navigation:', err)
    })
  })
}

/**
 * Batch log multiple events
 * Useful for bulk operations
 */
export async function logBatchOperation(
  operation: {
    action: AuditAction
    entity: AuditEntity
    description: string
    items: Array<{
      entityId: string
      entityName?: string
      success: boolean
      errorMessage?: string
    }>
    details?: Record<string, any>
  }
) {
  if (!shouldLogAction(operation.action, operation.entity)) return

  const { useAuditStore } = await import('@/stores/auditStore')
  const store = useAuditStore.getState()

  const totalProcessed = operation.items.length
  const succeeded = operation.items.filter(item => item.success).length
  const failed = totalProcessed - succeeded

  // Log summary event
  await store.logEvent({
    action: operation.action,
    entity: operation.entity,
    userId: auditContext?.userId || 'unknown',
    userName: auditContext?.userName || 'Unknown User',
    userEmail: auditContext?.userEmail || 'unknown@localhost',
    userRole: auditContext?.userRole,
    severity: failed > 0 ? ('high' as AuditSeverity) : ('medium' as AuditSeverity),
    description: operation.description,
    details: {
      totalProcessed,
      succeeded,
      failed,
      items: operation.items.map(item => ({
        id: item.entityId,
        name: item.entityName,
        success: item.success,
        error: item.errorMessage,
      })),
      ...operation.details,
    },
    success: failed === 0,
    errorMessage: failed > 0 ? `${failed} items failed` : undefined,
    userAgent: navigator.userAgent,
  })
}
