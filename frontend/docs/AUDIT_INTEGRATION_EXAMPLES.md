# Audit Logging Integration Examples

Examples of integrating audit logging into existing modules.

## Document Management Integration

### Adding Audit Logging to Document Upload

```typescript
// In your document upload component
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity } from '@/types/audit'
import { uploadDocument } from '@/api/documentApi'

function DocumentUploadComponent() {
  const { log } = useAuditLog()

  const handleUpload = async (file: File, category: string) => {
    try {
      // Upload the document
      const document = await uploadDocument({
        file,
        category,
        description: 'Uploaded via portal',
      })

      // Log the upload
      await log({
        action: AuditAction.DOCUMENT_UPLOAD,
        entity: AuditEntity.DOCUMENT,
        entityId: document.id,
        entityName: document.fileName,
        description: `Uploaded document: ${document.fileName}`,
        details: {
          fileName: document.fileName,
          fileSize: document.fileSize,
          mimeType: document.mimeType,
          category: document.category,
        },
        changesAfter: {
          status: document.status,
          uploadedAt: document.uploadedAt,
        },
      })

      showSuccess('Document uploaded successfully')
    } catch (error) {
      // Log the failure
      await log({
        action: AuditAction.DOCUMENT_UPLOAD,
        entity: AuditEntity.DOCUMENT,
        entityName: file.name,
        description: 'Failed to upload document',
        success: false,
        errorMessage: error.message,
        details: {
          fileName: file.name,
          fileSize: file.size,
          category,
        },
      })

      showError('Failed to upload document')
    }
  }
}
```

### Adding Audit Logging to Document Download

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity } from '@/types/audit'

function DocumentListComponent() {
  const { log } = useAuditLog()

  const handleDownload = async (document: Document) => {
    try {
      // Download the document
      await downloadDocument(document.id)

      // Log the download (using logRead for low severity)
      await log({
        action: AuditAction.DOCUMENT_DOWNLOAD,
        entity: AuditEntity.DOCUMENT,
        entityId: document.id,
        entityName: document.fileName,
        description: `Downloaded document: ${document.fileName}`,
        details: {
          fileName: document.fileName,
          category: document.category,
        },
      })
    } catch (error) {
      await log({
        action: AuditAction.DOCUMENT_DOWNLOAD,
        entity: AuditEntity.DOCUMENT,
        entityId: document.id,
        entityName: document.fileName,
        description: 'Failed to download document',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

### Adding Audit Logging to Document Delete

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity, AuditSeverity } from '@/types/audit'

function DocumentActionsComponent() {
  const { log } = useAuditLog()

  const handleDelete = async (document: Document) => {
    try {
      // Delete the document
      await deleteDocument(document.id)

      // Log the deletion (CRITICAL severity)
      await log({
        action: AuditAction.DOCUMENT_DELETE,
        entity: AuditEntity.DOCUMENT,
        entityId: document.id,
        entityName: document.fileName,
        description: `Deleted document: ${document.fileName}`,
        severity: AuditSeverity.CRITICAL,
        details: {
          fileName: document.fileName,
          category: document.category,
          uploadedAt: document.uploadedAt,
        },
        changesBefore: {
          status: document.status,
          fileName: document.fileName,
        },
      })

      showSuccess('Document deleted')
    } catch (error) {
      await log({
        action: AuditAction.DOCUMENT_DELETE,
        entity: AuditEntity.DOCUMENT,
        entityId: document.id,
        entityName: document.fileName,
        description: 'Failed to delete document',
        success: false,
        errorMessage: error.message,
        severity: AuditSeverity.HIGH,
      })
    }
  }
}
```

## License Management Integration

### License Approval with Audit Logging

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity, AuditSeverity } from '@/types/audit'

function LicenseApprovalComponent({ license }) {
  const { log } = useAuditLog()

  const handleApprove = async () => {
    try {
      // Approve the license
      const result = await approveLicense(license.id)

      // Log the approval
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        entityName: license.facilityName,
        description: `Approved ${license.licenseType} license for ${license.facilityName}`,
        severity: AuditSeverity.HIGH,
        details: {
          licenseType: license.licenseType,
          licenseNumber: license.licenseNumber,
          facilityName: license.facilityName,
          validityYears: license.validityYears,
        },
        changesBefore: {
          status: license.status,
          reviewedBy: null,
          approvedAt: null,
        },
        changesAfter: {
          status: 'Approved',
          reviewedBy: result.reviewedBy,
          approvedAt: result.approvedAt,
          expiryDate: result.expiryDate,
        },
      })

      showSuccess('License approved successfully')
    } catch (error) {
      await log({
        action: AuditAction.LICENSE_APPROVE,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        entityName: license.facilityName,
        description: 'Failed to approve license',
        success: false,
        errorMessage: error.message,
        severity: AuditSeverity.HIGH,
      })
    }
  }
}
```

### License Suspension with Audit Logging

```typescript
function LicenseSuspensionComponent({ license }) {
  const { log } = useAuditLog()

  const handleSuspend = async (reason: string) => {
    try {
      const result = await suspendLicense(license.id, reason)

      await log({
        action: AuditAction.LICENSE_SUSPEND,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        entityName: license.facilityName,
        description: `Suspended license for ${license.facilityName}`,
        severity: AuditSeverity.CRITICAL,
        details: {
          reason,
          suspendedUntil: result.suspendedUntil,
          complianceIssues: result.complianceIssues,
        },
        changesBefore: {
          status: license.status,
          suspensionReason: null,
        },
        changesAfter: {
          status: 'Suspended',
          suspensionReason: reason,
          suspendedAt: result.suspendedAt,
        },
      })
    } catch (error) {
      await log({
        action: AuditAction.LICENSE_SUSPEND,
        entity: AuditEntity.LICENSE,
        entityId: license.id,
        description: 'Failed to suspend license',
        success: false,
        errorMessage: error.message,
        severity: AuditSeverity.CRITICAL,
      })
    }
  }
}
```

### Bulk License Approval

```typescript
import { logBatchOperation } from '@/lib/auditMiddleware'

function BulkLicenseApprovalComponent({ selectedLicenses }) {
  const handleBulkApprove = async () => {
    const results = await Promise.allSettled(
      selectedLicenses.map(license => approveLicense(license.id))
    )

    // Log batch operation
    await logBatchOperation({
      action: AuditAction.BULK_APPROVE,
      entity: AuditEntity.LICENSE,
      description: `Bulk approved ${selectedLicenses.length} licenses`,
      items: selectedLicenses.map((license, index) => ({
        entityId: license.id,
        entityName: license.facilityName,
        success: results[index].status === 'fulfilled',
        errorMessage: results[index].status === 'rejected'
          ? results[index].reason?.message
          : undefined,
      })),
      details: {
        totalAttempted: selectedLicenses.length,
        licenseTypes: [...new Set(selectedLicenses.map(l => l.licenseType))],
      },
    })
  }
}
```

## Affiliation Management Integration

### Affiliation Approval

```typescript
function AffiliationApprovalComponent({ affiliation }) {
  const { log } = useAuditLog()

  const handleApprove = async () => {
    try {
      await approveAffiliation(affiliation.id)

      await log({
        action: AuditAction.AFFILIATION_APPROVE,
        entity: AuditEntity.AFFILIATION,
        entityId: affiliation.id,
        entityName: `${affiliation.practitionerName} - ${affiliation.facilityName}`,
        description: `Approved affiliation for ${affiliation.practitionerName}`,
        severity: AuditSeverity.HIGH,
        details: {
          practitionerName: affiliation.practitionerName,
          practitionerId: affiliation.practitionerId,
          facilityName: affiliation.facilityName,
          facilityId: affiliation.facilityId,
          role: affiliation.role,
        },
        changesBefore: {
          status: affiliation.status,
          approvedAt: null,
        },
        changesAfter: {
          status: 'Approved',
          approvedAt: new Date().toISOString(),
        },
      })
    } catch (error) {
      await log({
        action: AuditAction.AFFILIATION_APPROVE,
        entity: AuditEntity.AFFILIATION,
        entityId: affiliation.id,
        description: 'Failed to approve affiliation',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

## Form Submission Integration

### License Application Form

```typescript
import { useAuditLog } from '@/hooks/useAuditLog'
import { AuditAction, AuditEntity } from '@/types/audit'

function LicenseApplicationForm() {
  const { log } = useAuditLog()

  const handleSubmit = async (formData: LicenseApplicationData) => {
    try {
      const result = await submitLicenseApplication(formData)

      await log({
        action: AuditAction.FORM_SUBMIT,
        entity: AuditEntity.FORM,
        entityId: result.applicationId,
        entityName: 'License Application',
        description: `Submitted license application for ${formData.facilityName}`,
        details: {
          formType: 'license_application',
          facilityName: formData.facilityName,
          licenseType: formData.licenseType,
          applicationId: result.applicationId,
        },
        changesAfter: {
          status: 'Submitted',
          submittedAt: result.submittedAt,
        },
      })

      showSuccess('Application submitted successfully')
    } catch (error) {
      await log({
        action: AuditAction.FORM_SUBMIT,
        entity: AuditEntity.FORM,
        entityName: 'License Application',
        description: 'Failed to submit license application',
        success: false,
        errorMessage: error.message,
        details: {
          formType: 'license_application',
          facilityName: formData.facilityName,
        },
      })
    }
  }
}
```

## Authentication Integration

### Login Flow

```typescript
import { setAuditContext } from '@/lib/auditMiddleware'
import { useAuditLog } from '@/hooks/useAuditLog'

function LoginComponent() {
  const { logAuth } = useAuditLog()

  const handleLogin = async (email: string, password: string) => {
    try {
      const result = await login(email, password)

      // Set audit context for future logs
      setAuditContext({
        userId: result.user.email,
        userName: result.user.name,
        userEmail: result.user.email,
        userRole: result.user.role,
      })

      // Log successful login
      await logAuth({
        action: 'login',
        success: true,
        details: {
          loginMethod: result.loginMethod,
          mfaUsed: result.mfaUsed,
        },
      })

      navigate('/dashboard')
    } catch (error) {
      // Log failed login attempt
      await logAuth({
        action: 'login',
        success: false,
        errorMessage: error.message,
        details: {
          attemptedEmail: email,
          failureReason: error.code,
        },
      })

      showError('Login failed')
    }
  }

  const handleLogout = async () => {
    await logAuth({ action: 'logout' })
    setAuditContext(null)
    navigate('/login')
  }
}
```

## Inspection Integration

### Schedule Inspection

```typescript
function InspectionSchedulingComponent() {
  const { log } = useAuditLog()

  const handleSchedule = async (inspectionData) => {
    try {
      const result = await scheduleInspection(inspectionData)

      await log({
        action: AuditAction.INSPECTION_SCHEDULE,
        entity: AuditEntity.INSPECTION,
        entityId: result.inspectionId,
        entityName: `Inspection - ${inspectionData.facilityName}`,
        description: `Scheduled inspection for ${inspectionData.facilityName}`,
        details: {
          facilityName: inspectionData.facilityName,
          facilityId: inspectionData.facilityId,
          inspectionType: inspectionData.inspectionType,
          scheduledDate: inspectionData.scheduledDate,
          inspector: inspectionData.inspectorName,
        },
        changesAfter: {
          status: 'Scheduled',
          scheduledDate: result.scheduledDate,
          assignedInspector: result.assignedInspector,
        },
      })
    } catch (error) {
      await log({
        action: AuditAction.INSPECTION_SCHEDULE,
        entity: AuditEntity.INSPECTION,
        description: 'Failed to schedule inspection',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

### Complete Inspection

```typescript
function InspectionCompletionComponent({ inspection }) {
  const { log } = useAuditLog()

  const handleComplete = async (findings) => {
    try {
      const result = await completeInspection(inspection.id, findings)

      await log({
        action: AuditAction.INSPECTION_COMPLETE,
        entity: AuditEntity.INSPECTION,
        entityId: inspection.id,
        entityName: `Inspection - ${inspection.facilityName}`,
        description: `Completed inspection for ${inspection.facilityName}`,
        details: {
          facilityName: inspection.facilityName,
          inspectionType: inspection.inspectionType,
          findingsCount: findings.length,
          violationsCount: findings.filter(f => f.isViolation).length,
          overallRating: result.overallRating,
        },
        changesBefore: {
          status: inspection.status,
          completedAt: null,
        },
        changesAfter: {
          status: 'Completed',
          completedAt: result.completedAt,
          overallRating: result.overallRating,
        },
      })
    } catch (error) {
      await log({
        action: AuditAction.INSPECTION_COMPLETE,
        entity: AuditEntity.INSPECTION,
        entityId: inspection.id,
        description: 'Failed to complete inspection',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

## Settings Management Integration

### Update System Settings

```typescript
function SettingsComponent() {
  const { log } = useAuditLog()

  const handleSaveSettings = async (newSettings, oldSettings) => {
    try {
      await updateSettings(newSettings)

      await log({
        action: AuditAction.SETTINGS_UPDATE,
        entity: AuditEntity.SETTINGS,
        description: 'Updated system settings',
        details: {
          changedFields: Object.keys(newSettings),
        },
        changesBefore: oldSettings,
        changesAfter: newSettings,
      })
    } catch (error) {
      await log({
        action: AuditAction.SETTINGS_UPDATE,
        entity: AuditEntity.SETTINGS,
        description: 'Failed to update settings',
        success: false,
        errorMessage: error.message,
      })
    }
  }
}
```

## Export/Report Integration

### Export Data with Audit Logging

```typescript
function DataExportComponent() {
  const { logExport } = useAuditLog()

  const handleExport = async (entityType: string, filters: any, format: string) => {
    try {
      const result = await exportData(entityType, filters, format)

      await logExport({
        entity: entityType as AuditEntity,
        format,
        description: `Exported ${entityType} data as ${format}`,
        details: {
          filters,
          recordCount: result.recordCount,
          fileSize: result.fileSize,
        },
      })

      downloadFile(result.blob, `${entityType}-export.${format}`)
    } catch (error) {
      await logExport({
        entity: entityType as AuditEntity,
        format,
        description: `Failed to export ${entityType} data`,
        details: {
          filters,
          errorMessage: error.message,
        },
      })
    }
  }
}
```

## Automated Middleware Example

### Create Audited API Methods

```typescript
import { createAuditedMethod } from '@/lib/auditMiddleware'
import { AuditAction, AuditEntity } from '@/types/audit'

// Wrap existing API methods with audit logging
export const auditedDocumentApi = {
  upload: createAuditedMethod(
    uploadDocument,
    {
      action: AuditAction.DOCUMENT_UPLOAD,
      entity: AuditEntity.DOCUMENT,
      getDescription: (request) => `Uploaded ${request.file.name}`,
      getEntityName: (request) => request.file.name,
      getDetails: (request) => ({
        fileName: request.file.name,
        category: request.category,
        fileSize: request.file.size,
      }),
    }
  ),

  delete: createAuditedMethod(
    deleteDocument,
    {
      action: AuditAction.DOCUMENT_DELETE,
      entity: AuditEntity.DOCUMENT,
      getDescription: (docId) => `Deleted document ${docId}`,
      getEntityId: (docId) => docId,
    }
  ),
}

// Use audited methods
await auditedDocumentApi.upload(uploadRequest)
await auditedDocumentApi.delete(documentId)
```

## Error Handling Pattern

### Consistent Error Logging

```typescript
function useAuditedAction() {
  const { log } = useAuditLog()

  const executeWithAudit = async <T>(
    action: AuditAction,
    entity: AuditEntity,
    entityId: string,
    entityName: string,
    operation: () => Promise<T>,
    options?: {
      details?: Record<string, any>
      changesBefore?: Record<string, any>
      getChangesAfter?: (result: T) => Record<string, any>
    }
  ): Promise<T> => {
    try {
      const result = await operation()

      await log({
        action,
        entity,
        entityId,
        entityName,
        description: `Executed ${action} on ${entityName}`,
        details: options?.details,
        changesBefore: options?.changesBefore,
        changesAfter: options?.getChangesAfter?.(result),
      })

      return result
    } catch (error) {
      await log({
        action,
        entity,
        entityId,
        entityName,
        description: `Failed to execute ${action} on ${entityName}`,
        success: false,
        errorMessage: error.message,
        details: options?.details,
      })

      throw error
    }
  }

  return { executeWithAudit }
}

// Usage
const { executeWithAudit } = useAuditedAction()

await executeWithAudit(
  AuditAction.LICENSE_APPROVE,
  AuditEntity.LICENSE,
  license.id,
  license.facilityName,
  () => approveLicense(license.id),
  {
    details: { licenseType: license.licenseType },
    changesBefore: { status: 'Pending' },
    getChangesAfter: (result) => ({ status: 'Approved', approvedAt: result.approvedAt }),
  }
)
```

## Integration Checklist

When adding audit logging to a module:

- [ ] Import `useAuditLog` hook
- [ ] Choose appropriate `AuditAction` and `AuditEntity`
- [ ] Log both success and failure cases
- [ ] Include entity ID and name for tracking
- [ ] Add relevant details in the `details` field
- [ ] Track changes with `changesBefore` and `changesAfter`
- [ ] Use appropriate severity level
- [ ] Don't log sensitive data (passwords, tokens, PII)
- [ ] Handle errors gracefully (audit logging shouldn't break the app)
- [ ] Test the integration with mock backend

## Testing Your Integration

```typescript
import { renderHook, act } from '@testing-library/react'
import { useAuditStore } from '@/stores/auditStore'

describe('Document Upload Audit Integration', () => {
  it('logs document upload', async () => {
    const { result } = renderHook(() => useDocumentUpload())

    await act(async () => {
      await result.current.uploadDocument(mockFile, 'Application')
    })

    const { logs } = useAuditStore.getState()
    expect(logs).toHaveLength(1)
    expect(logs[0]).toMatchObject({
      action: AuditAction.DOCUMENT_UPLOAD,
      entity: AuditEntity.DOCUMENT,
      success: true,
    })
  })

  it('logs failed upload', async () => {
    // Mock API to fail
    mockUploadDocument.mockRejectedValueOnce(new Error('Upload failed'))

    const { result } = renderHook(() => useDocumentUpload())

    await act(async () => {
      try {
        await result.current.uploadDocument(mockFile, 'Application')
      } catch (error) {
        // Expected to fail
      }
    })

    const { logs } = useAuditStore.getState()
    expect(logs[0]).toMatchObject({
      action: AuditAction.DOCUMENT_UPLOAD,
      success: false,
      errorMessage: 'Upload failed',
    })
  })
})
```
