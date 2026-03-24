# Audit Logging System

Complete audit trail and activity tracking for regulatory compliance.

## Overview

The audit logging system provides comprehensive tracking of all user actions, system events, and data changes. It includes:

- **Automatic tracking** of user context (user ID, name, email, role)
- **Change tracking** with before/after snapshots
- **Severity levels** (low, medium, high, critical)
- **Filtering and search** capabilities
- **Export functionality** (CSV, JSON, PDF)
- **Entity history** showing complete timeline for any entity
- **Statistics and analytics** for audit insights

## Quick Start

### Basic Usage

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity } from '@/types/audit'

function MyComponent() {
  const { log } = useAuditLog()

  const handleApprove = async (licenseId: string) => {
    try {
      await approveLicense(licenseId)

      // Log successful approval
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: licenseId,
        entityName: 'Hospital License',
        description: 'Approved license application',
      })
    } catch (error) {
      // Log failed attempt
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: licenseId,
        description: 'Failed to approve license',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

## Core Concepts

### Audit Actions

40+ predefined actions covering all system operations:

- **CRUD**: `CREATE`, `READ`, `UPDATE`, `DELETE`
- **License**: `LICENSE_APPROVE`, `LICENSE_DENY`, `LICENSE_SUSPEND`, `LICENSE_REVOKE`, `LICENSE_RENEW`
- **Affiliation**: `AFFILIATION_APPROVE`, `AFFILIATION_REJECT`
- **Inspection**: `INSPECTION_SCHEDULE`, `INSPECTION_COMPLETE`
- **Document**: `DOCUMENT_UPLOAD`, `DOCUMENT_DOWNLOAD`, `DOCUMENT_DELETE`
- **Bulk**: `BULK_APPROVE`, `BULK_REJECT`, `BULK_UPDATE`, `BULK_DELETE`
- **Auth**: `LOGIN`, `LOGOUT`, `SESSION_EXPIRE`, `PASSWORD_CHANGE`
- **Export**: `EXPORT_DATA`, `REPORT_GENERATE`

### Audit Entities

10 entity types representing system resources:

- `LICENSE`, `AFFILIATION`, `INSPECTION`
- `DOCUMENT`, `FORM`
- `USER`, `NOTIFICATION`, `SETTINGS`
- `REPORT`, `SYSTEM`

### Severity Levels

Automatic severity assignment based on action type:

- **CRITICAL**: Delete operations, license revoke/suspend, bulk delete
- **HIGH**: License approve/deny, bulk operations, inspection failure
- **MEDIUM**: Update operations, form submissions, settings changes
- **LOW**: Read operations, general activity

## Using the Hook

### `useAuditLog()`

The primary hook for audit logging with automatic user context.

#### Basic Logging

```typescript
const { log } = useAuditLog()

await log({
  action: AuditAction.UPDATE,
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  entityName: 'Hospital License',
  description: 'Updated license details',
})
```

#### With Change Tracking

```typescript
await log({
  action: AuditAction.UPDATE,
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  description: 'Changed license status',
  changesBefore: { status: 'Pending', reviewedBy: null },
  changesAfter: { status: 'Approved', reviewedBy: 'john@regulator.gov' },
})
```

#### With Additional Details

```typescript
await log({
  action: AuditAction.DOCUMENT_UPLOAD,
  entity: AuditEntity.DOCUMENT,
  entityId: 'DOC-001',
  entityName: 'Facility Plan.pdf',
  description: 'Uploaded facility plan',
  details: {
    fileSize: '2.4 MB',
    mimeType: 'application/pdf',
    category: 'Application Documents',
  },
})
```

### Convenience Methods

#### Success/Failure Logging

```typescript
const { logSuccess, logFailure } = useAuditLog()

// Log success
await logSuccess({
  action: AuditAction.LICENSE_APPROVE,
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  description: 'License approved successfully',
})

// Log failure
await logFailure({
  action: AuditAction.LICENSE_APPROVE,
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  description: 'License approval failed',
  errorMessage: 'Missing required documents',
})
```

#### CRUD Operations

```typescript
const { logCreate, logRead, logUpdate, logDelete } = useAuditLog()

// Create
await logCreate({
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  entityName: 'New Hospital License',
  changesAfter: { status: 'Pending', type: 'Hospital' },
})

// Read
await logRead({
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  entityName: 'Hospital License',
})

// Update
await logUpdate({
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  entityName: 'Hospital License',
  changesBefore: { status: 'Pending' },
  changesAfter: { status: 'Active' },
})

// Delete
await logDelete({
  entity: AuditEntity.LICENSE,
  entityId: 'LIC-001',
  entityName: 'Hospital License',
  changesBefore: { status: 'Draft' },
})
```

#### Authentication Events

```typescript
const { logAuth } = useAuditLog()

// Login
await logAuth({
  action: 'login',
  success: true,
  details: { loginMethod: '2FA' },
})

// Logout
await logAuth({
  action: 'logout',
})

// Password change
await logAuth({
  action: 'password_change',
  success: true,
})
```

#### Export Operations

```typescript
const { logExport } = useAuditLog()

await logExport({
  entity: AuditEntity.LICENSE,
  format: 'CSV',
  description: 'Exported all active licenses',
  details: {
    recordCount: 150,
    filters: { status: 'Active' },
  },
})
```

## Middleware and Automation

### Wrap Functions with Audit Logging

```typescript
import { withAuditLog } from '@/lib/auditMiddleware'
import { AuditAction, AuditEntity } from '@/types/audit'

const approveLicenseWithAudit = withAuditLog(
  approveLicense,
  {
    action: AuditAction.LICENSE_APPROVE,
    entity: AuditEntity.LICENSE,
    getDescription: (licenseId) => `Approved license ${licenseId}`,
    getEntityId: (licenseId) => licenseId,
    getDetails: (licenseId) => ({ timestamp: new Date().toISOString() }),
    getChangesAfter: (result, licenseId) => ({
      status: 'Approved',
      approvedAt: result.approvedAt
    }),
  }
)

// Now calling the function automatically logs
await approveLicenseWithAudit('LIC-001')
```

### Batch Operations

```typescript
import { logBatchOperation } from '@/lib/auditMiddleware'

const results = await Promise.all(
  licenseIds.map(id => approveLicense(id).catch(err => ({ error: err })))
)

await logBatchOperation({
  action: AuditAction.BULK_APPROVE,
  entity: AuditEntity.LICENSE,
  description: 'Bulk approved licenses',
  items: licenseIds.map((id, index) => ({
    entityId: id,
    entityName: `License ${id}`,
    success: !results[index].error,
    errorMessage: results[index].error?.message,
  })),
  details: {
    totalAttempted: licenseIds.length,
  },
})
```

### Error Logging

Set up automatic error capture:

```typescript
import { setupErrorLogging, initializeAuditMiddleware } from '@/lib/auditMiddleware'

// Initialize with configuration
initializeAuditMiddleware({
  enabled: true,
  logReads: false,      // Don't log read operations (reduces noise)
  logNavigation: false, // Don't log page navigation
  logErrors: true,      // Capture unhandled errors
})

// Set up error handlers
setupErrorLogging()
```

### Set User Context

Update audit context when user logs in:

```typescript
import { setAuditContext } from '@/lib/auditMiddleware'

// On login
setAuditContext({
  userId: user.email,
  userName: user.name,
  userEmail: user.email,
  userRole: user.role,
})

// On logout
setAuditContext(null)
```

## Viewing Audit Logs

### Audit Log Viewer Component

```typescript
import { AuditLogViewer } from '@/components/audit'

function AuditPage() {
  return <AuditLogViewer />
}
```

Features:
- Search by description, user, or entity
- Filter by action, entity, severity, status
- Sort and paginate results
- Export to CSV, JSON, or PDF
- Click any log to view details

### Audit Statistics Dashboard

```typescript
import { AuditStats } from '@/components/audit'

function AuditDashboard() {
  return <AuditStats />
}
```

Shows:
- Total events and high-risk count
- Top actions and entities
- Severity distribution
- Most active users
- Recent activity timeline

### Audit Log Detail Dialog

```typescript
import { AuditLogDetail } from '@/components/audit'
import { useAuditStore } from '@/stores/auditStore'

function MyComponent() {
  const { selectedLog, selectLog } = useAuditStore()
  const [showDetail, setShowDetail] = useState(false)

  return (
    <AuditLogDetail
      open={showDetail}
      onClose={() => {
        setShowDetail(false)
        selectLog(null)
      }}
    />
  )
}
```

Shows:
- Complete log details
- Before/after changes comparison
- Technical details (IP, user agent, session)
- Entity history timeline

## Store Integration

### Using the Audit Store

```typescript
import { useAuditStore } from '@/stores/auditStore'

function MyComponent() {
  const {
    logs,
    fetchLogs,
    setFilters,
    exportLogs,
    fetchEntityHistory,
  } = useAuditStore()

  // Fetch logs
  useEffect(() => {
    fetchLogs()
  }, [])

  // Apply filters
  const handleFilter = () => {
    setFilters({
      action: AuditAction.LICENSE_APPROVE,
      severity: AuditSeverity.HIGH,
      startDate: '2024-01-01',
    })
  }

  // Export
  const handleExport = async () => {
    await exportLogs(AuditExportFormat.CSV)
  }

  // Get entity history
  const viewHistory = async () => {
    await fetchEntityHistory(AuditEntity.LICENSE, 'LIC-001')
  }
}
```

## Backend API Endpoints

The system expects these API endpoints:

```
POST /api/method/compliance_360.api.audit.log_event
GET  /api/method/compliance_360.api.audit.list_logs
GET  /api/method/compliance_360.api.audit.get_log
GET  /api/method/compliance_360.api.audit.get_stats
GET  /api/method/compliance_360.api.audit.get_entity_history
POST /api/method/compliance_360.api.audit.export_logs
```

See `src/api/auditApi.ts` for complete API client implementation.

## Best Practices

### 1. Always Log Critical Actions

```typescript
// ✅ Good - Log both success and failure
try {
  await deleteUser(userId)
  await log({
    action: AuditAction.DELETE,
    entity: AuditEntity.USER,
    entityId: userId,
    description: 'User deleted',
    severity: AuditSeverity.CRITICAL,
  })
} catch (error) {
  await log({
    action: AuditAction.DELETE,
    entity: AuditEntity.USER,
    entityId: userId,
    description: 'Failed to delete user',
    success: false,
    errorMessage: error.message,
  })
  throw error
}
```

### 2. Include Change Tracking for Updates

```typescript
// ✅ Good - Track what changed
await log({
  action: AuditAction.UPDATE,
  entity: AuditEntity.LICENSE,
  entityId: license.id,
  description: 'Updated license',
  changesBefore: oldLicense,
  changesAfter: updatedLicense,
})
```

### 3. Add Context in Details

```typescript
// ✅ Good - Include relevant context
await log({
  action: AuditAction.BULK_APPROVE,
  entity: AuditEntity.LICENSE,
  description: 'Bulk approved licenses',
  details: {
    count: licenses.length,
    criteria: filters,
    duration: '2.3s',
  },
})
```

### 4. Use Appropriate Severity

```typescript
// Let the system assign severity automatically
await log({
  action: AuditAction.LICENSE_REVOKE, // Auto-assigned CRITICAL
  entity: AuditEntity.LICENSE,
  // ...
})

// Or override if needed
await log({
  action: AuditAction.UPDATE,
  entity: AuditEntity.SETTINGS,
  severity: AuditSeverity.HIGH, // Override default MEDIUM
  // ...
})
```

### 5. Don't Block on Audit Logging

```typescript
// ✅ Good - Audit logging shouldn't break the app
const { log } = useAuditLog() // Already handles errors internally

// The hook catches errors and logs them, won't throw
await log({ ... })

// Continue with your logic
return result
```

### 6. Avoid Logging Sensitive Data

```typescript
// ❌ Bad - Don't log passwords, tokens, PII
await log({
  details: {
    password: user.password,        // Never log passwords
    ssn: user.socialSecurity,       // Never log PII
    apiKey: config.apiKey,          // Never log credentials
  }
})

// ✅ Good - Log metadata only
await log({
  details: {
    passwordChanged: true,
    apiKeyRotated: true,
  }
})
```

## Configuration

### Audit Middleware Configuration

```typescript
import { initializeAuditMiddleware } from '@/lib/auditMiddleware'

initializeAuditMiddleware({
  enabled: true,              // Master switch
  logReads: false,            // Log READ operations (verbose)
  logNavigation: false,       // Log page navigation (verbose)
  logErrors: true,            // Log unhandled errors
  excludeActions: [           // Skip these actions
    AuditAction.READ,
  ],
  excludeEntities: [          // Skip these entities
    AuditEntity.NOTIFICATION,
  ],
})
```

## Mock Data

For development without a backend, the system includes mock data:

```typescript
import { listAuditLogsMock } from '@/api/auditApi'

// Use mock implementation
const response = await listAuditLogsMock({
  query: 'approve',
  page: 1,
  pageSize: 20,
})
```

The mock includes 3 sample audit logs for testing.

## Testing

### Example Test

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuditLog } from '@/hooks/useAuditLog'
import { useAuditStore } from '@/stores/auditStore'

describe('Audit Logging', () => {
  it('logs events with user context', async () => {
    const { result } = renderHook(() => useAuditLog())

    await act(async () => {
      await result.current.log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: 'LIC-001',
        description: 'Test approval',
      })
    })

    const { logs } = useAuditStore.getState()
    expect(logs[0]).toMatchObject({
      action: AuditAction.LICENSE_APPROVE,
      entity: AuditEntity.LICENSE,
      entityId: 'LIC-001',
    })
  })
})
```

## Troubleshooting

### Logs Not Appearing

1. Check if audit logging is enabled:
   ```typescript
   import { getAuditConfig } from '@/lib/auditMiddleware'
   console.log(getAuditConfig())
   ```

2. Verify user context is set:
   ```typescript
   // Should be set on login
   setAuditContext({ userId, userName, userEmail, userRole })
   ```

3. Check for backend API errors in console

### Export Not Working

1. Ensure backend endpoint returns proper content type:
   - CSV: `text/csv`
   - JSON: `application/json`
   - PDF: `application/pdf`

2. Check browser console for errors

3. Verify blob download logic in `auditStore.ts:exportLogs()`

### Performance Issues

1. Disable read logging if verbose:
   ```typescript
   initializeAuditMiddleware({ logReads: false })
   ```

2. Use pagination for large result sets

3. Add indexes on backend for timestamp, action, entity fields

## Complete Example

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity } from '@/types/audit'

function LicenseApprovalComponent({ license }) {
  const { log } = useAuditLog()

  const handleApprove = async () => {
    const oldStatus = license.status

    try {
      // Perform the action
      const result = await approveLicense(license.id)

      // Log success with change tracking
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        entityName: license.facilityName,
        description: `Approved ${license.licenseType} license`,
        details: {
          licenseType: license.licenseType,
          facilityName: license.facilityName,
          processingTime: result.processingTime,
        },
        changesBefore: {
          status: oldStatus,
          reviewedBy: null,
          reviewedAt: null,
        },
        changesAfter: {
          status: 'Approved',
          reviewedBy: result.reviewedBy,
          reviewedAt: result.reviewedAt,
        },
      })

      showSuccessMessage('License approved successfully')
    } catch (error) {
      // Log failure
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        entityName: license.facilityName,
        description: 'Failed to approve license',
        success: false,
        errorMessage: error.message,
        details: {
          attemptedStatus: 'Approved',
          errorCode: error.code,
        },
      })

      showErrorMessage('Failed to approve license')
    }
  }

  return (
    <Button onClick={handleApprove}>
      Approve License
    </Button>
  )
}
```

## Next Steps

1. **Integrate with existing modules**: Add audit logging to license, affiliation, inspection, and document operations
2. **Set up user context**: Call `setAuditContext()` in authentication flow
3. **Configure middleware**: Adjust `initializeAuditMiddleware()` settings for your needs
4. **Test backend integration**: Verify API endpoints are working correctly
5. **Review and refine**: Check audit logs regularly and adjust logging strategy as needed
