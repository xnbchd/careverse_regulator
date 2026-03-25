import apiClient from './client'
import type {
  BatchActionType,
  BatchItemResult,
  BatchProgress,
} from '@/types/batch'

const API_BASE = '/api/method/compliance_360.api.batch'

// ============================================================================
// Batch Operation Types
// ============================================================================

interface BatchOperationRequest {
  action_type: string
  items: Array<{ id: string; data?: any }>
  metadata?: Record<string, any>
}

interface BatchOperationResponse {
  operation_id: string
  total: number
  succeeded: number
  failed: number
  items: Array<{
    item_id: string
    success: boolean
    error?: string
    data?: any
  }>
}

// ============================================================================
// Generic Batch Operations
// ============================================================================

/**
 * Execute a batch operation
 */
export async function executeBatchOperation(
  actionType: BatchActionType,
  items: Array<{ id: string; data?: any }>,
  metadata?: Record<string, any>
): Promise<BatchOperationResponse> {
  const response = await apiClient.post<{ message: BatchOperationResponse }>(
    `${API_BASE}.execute`,
    {
      action_type: actionType,
      items,
      metadata,
    }
  )

  return response.message
}

// ============================================================================
// License Batch Operations
// ============================================================================

/**
 * Bulk approve licenses
 */
export async function bulkApproveLicenses(
  licenseIds: string[],
  metadata?: { reason?: string }
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.licenses.bulk_approve`,
    {
      license_ids: licenseIds,
      reason: metadata?.reason,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk reject licenses
 */
export async function bulkRejectLicenses(
  licenseIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.licenses.bulk_reject`,
    {
      license_ids: licenseIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk suspend licenses
 */
export async function bulkSuspendLicenses(
  licenseIds: string[],
  reason: string,
  suspendUntil?: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.licenses.bulk_suspend`,
    {
      license_ids: licenseIds,
      reason,
      suspend_until: suspendUntil,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk renew licenses
 */
export async function bulkRenewLicenses(
  licenseIds: string[],
  validityYears: number,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.licenses.bulk_renew`,
    {
      license_ids: licenseIds,
      validity_years: validityYears,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk delete licenses
 */
export async function bulkDeleteLicenses(
  licenseIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.licenses.bulk_delete`,
    {
      license_ids: licenseIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

// ============================================================================
// Affiliation Batch Operations
// ============================================================================

/**
 * Bulk approve affiliations
 */
export async function bulkApproveAffiliations(
  affiliationIds: string[],
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.affiliations.bulk_approve`,
    {
      affiliation_ids: affiliationIds,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk reject affiliations
 */
export async function bulkRejectAffiliations(
  affiliationIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.affiliations.bulk_reject`,
    {
      affiliation_ids: affiliationIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk activate affiliations
 */
export async function bulkActivateAffiliations(
  affiliationIds: string[],
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.affiliations.bulk_activate`,
    {
      affiliation_ids: affiliationIds,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk deactivate affiliations
 */
export async function bulkDeactivateAffiliations(
  affiliationIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.affiliations.bulk_deactivate`,
    {
      affiliation_ids: affiliationIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk delete affiliations
 */
export async function bulkDeleteAffiliations(
  affiliationIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.affiliations.bulk_delete`,
    {
      affiliation_ids: affiliationIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

// ============================================================================
// Document Batch Operations
// ============================================================================

/**
 * Bulk delete documents
 */
export async function bulkDeleteDocuments(
  documentIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.documents.bulk_delete`,
    {
      document_ids: documentIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk download documents
 */
export async function bulkDownloadDocuments(
  documentIds: string[],
  metadata?: Record<string, any>
): Promise<Blob> {
  const response = await apiClient.post<Blob>(
    `${API_BASE}.documents.bulk_download`,
    {
      document_ids: documentIds,
      metadata,
    },
    {
      headers: {
        Accept: 'application/zip',
      },
    }
  )

  return response as unknown as Blob
}

/**
 * Bulk update document category
 */
export async function bulkUpdateDocumentCategory(
  documentIds: string[],
  category: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.documents.bulk_update_category`,
    {
      document_ids: documentIds,
      category,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk update document tags
 */
export async function bulkUpdateDocumentTags(
  documentIds: string[],
  tags: string[],
  operation: 'add' | 'remove' | 'replace',
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.documents.bulk_update_tags`,
    {
      document_ids: documentIds,
      tags,
      operation,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

// ============================================================================
// Inspection Batch Operations
// ============================================================================

/**
 * Bulk schedule inspections
 */
export async function bulkScheduleInspections(
  facilityIds: string[],
  scheduledDate: string,
  inspectionType: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.inspections.bulk_schedule`,
    {
      facility_ids: facilityIds,
      scheduled_date: scheduledDate,
      inspection_type: inspectionType,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

/**
 * Bulk cancel inspections
 */
export async function bulkCancelInspections(
  inspectionIds: string[],
  reason: string,
  metadata?: Record<string, any>
): Promise<BatchItemResult[]> {
  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.inspections.bulk_cancel`,
    {
      inspection_ids: inspectionIds,
      reason,
      metadata,
    }
  )

  return response.message.results.map(transformBatchItemResult)
}

// ============================================================================
// Progress Tracking
// ============================================================================

/**
 * Get batch operation status
 */
export async function getBatchOperationStatus(operationId: string): Promise<{
  status: string
  progress: BatchProgress
  items: BatchItemResult[]
}> {
  const response = await apiClient.get<{ message: any }>(
    `${API_BASE}.get_status`,
    {
      params: { operation_id: operationId },
    }
  )

  return {
    status: response.message.status,
    progress: {
      total: response.message.total,
      processed: response.message.processed,
      succeeded: response.message.succeeded,
      failed: response.message.failed,
      skipped: response.message.skipped,
      percentage: response.message.percentage,
    },
    items: response.message.items.map(transformBatchItemResult),
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Transform backend batch item result to frontend format
 */
function transformBatchItemResult(data: any): BatchItemResult {
  return {
    itemId: data.item_id || data.id,
    success: data.success,
    error: data.error,
    data: data.data,
  }
}

/**
 * Execute batch operation with progress tracking
 */
export async function executeBatchWithProgress(
  operation: () => Promise<BatchItemResult[]>,
  onProgress?: (progress: BatchProgress) => void
): Promise<BatchItemResult[]> {
  // Start tracking
  const startTime = Date.now()

  try {
    // Execute operation
    const results = await operation()

    // Calculate final progress
    const progress: BatchProgress = {
      total: results.length,
      processed: results.length,
      succeeded: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      skipped: 0,
      percentage: 100,
    }

    onProgress?.(progress)

    return results
  } catch (error) {
    console.error('Batch operation failed:', error)
    throw error
  }
}

// ============================================================================
// Mock Implementation (for development)
// ============================================================================

/**
 * Mock batch operation execution
 */
export async function executeBatchOperationMock(
  actionType: BatchActionType,
  items: Array<{ id: string; data?: any }>,
  onProgress?: (progress: BatchProgress) => void
): Promise<BatchItemResult[]> {
  const results: BatchItemResult[] = []
  const total = items.length

  for (let i = 0; i < items.length; i++) {
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    // Simulate 90% success rate
    const success = Math.random() > 0.1

    results.push({
      itemId: items[i].id,
      success,
      error: success ? undefined : 'Mock error: Processing failed',
    })

    // Report progress
    if (onProgress) {
      const processed = i + 1
      const succeeded = results.filter((r) => r.success).length
      const failed = results.filter((r) => !r.success).length

      onProgress({
        total,
        processed,
        succeeded,
        failed,
        skipped: 0,
        percentage: (processed / total) * 100,
      })
    }
  }

  return results
}
