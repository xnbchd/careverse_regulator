import apiClient from "./client"
import type {
  Document,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentSearchParams,
  DocumentListResponse,
  DocumentWithVersions,
} from "@/types/document"

const API_BASE = "/api/method/compliance_360.api.document_management"

/**
 * Upload a new document
 */
export async function uploadDocument(request: DocumentUploadRequest): Promise<Document> {
  const formData = new FormData()
  formData.append("file", request.file)
  formData.append("category", request.category)

  if (request.description) {
    formData.append("description", request.description)
  }

  if (request.tags && request.tags.length > 0) {
    formData.append("tags", JSON.stringify(request.tags))
  }

  // Associations
  if (request.licenseNumber) {
    formData.append("license_number", request.licenseNumber)
  }
  if (request.affiliationId) {
    formData.append("affiliation_id", request.affiliationId)
  }
  if (request.inspectionId) {
    formData.append("inspection_id", request.inspectionId)
  }
  if (request.applicationId) {
    formData.append("application_id", request.applicationId)
  }

  const response = await apiClient.post<{ message: any }>(`${API_BASE}.upload_document`, formData)

  return transformBackendDocument(response.message)
}

/**
 * List documents with filters and pagination
 */
export async function listDocuments(
  params: DocumentSearchParams = {}
): Promise<DocumentListResponse> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.list_documents`, {
    params: {
      query: params.query,
      category: params.category,
      status: params.status,
      tags: params.tags?.join(","),
      license_number: params.licenseNumber,
      affiliation_id: params.affiliationId,
      inspection_id: params.inspectionId,
      application_id: params.applicationId,
      uploaded_by: params.uploadedBy,
      start_date: params.startDate,
      end_date: params.endDate,
      page: params.page,
      page_size: params.pageSize,
      sort_by: params.sortBy,
      sort_order: params.sortOrder,
    },
  })

  const data = response.message
  return {
    documents: data.documents.map(transformBackendDocument),
    total: data.total,
    page: data.page,
    pageSize: data.page_size,
    totalPages: data.total_pages,
  }
}

/**
 * Get a single document by ID
 */
export async function getDocument(documentId: string): Promise<Document> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_document`, {
    params: { document_id: documentId },
  })
  return transformBackendDocument(response.message)
}

/**
 * Get document with version history
 */
export async function getDocumentWithVersions(documentId: string): Promise<DocumentWithVersions> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_document_versions`, {
    params: { document_id: documentId },
  })
  const data = response.message

  return {
    ...transformBackendDocument(data.document),
    versions: data.versions.map((v: any) => ({
      version: v.version,
      uploadedAt: v.uploaded_at,
      uploadedBy: v.uploaded_by,
      uploadedByName: v.uploaded_by_name,
      fileSize: v.file_size,
      downloadUrl: v.download_url,
    })),
  }
}

/**
 * Update document metadata
 */
export async function updateDocument(
  documentId: string,
  updates: DocumentUpdateRequest
): Promise<Document> {
  const response = await apiClient.put<{ message: any }>(`${API_BASE}.update_document`, {
    document_id: documentId,
    ...updates,
    tags: updates.tags ? updates.tags : undefined,
  })

  return transformBackendDocument(response.message)
}

/**
 * Delete a document (soft delete)
 */
export async function deleteDocument(documentId: string): Promise<void> {
  await apiClient.delete(`${API_BASE}.delete_document`, {
    params: { document_id: documentId },
  })
}

/**
 * Get download URL for a document
 */
export function getDownloadUrl(documentId: string): string {
  return `${API_BASE}.download_document?document_id=${documentId}`
}

/**
 * Get preview URL for a document (for supported types)
 */
export function getPreviewUrl(documentId: string): string {
  return `${API_BASE}.preview_document?document_id=${documentId}`
}

/**
 * Transform backend document format to frontend format
 */
function transformBackendDocument(doc: any): Document {
  return {
    id: doc.name || doc.id,
    name: doc.document_name || doc.name,
    fileName: doc.file_name,
    fileSize: doc.file_size,
    mimeType: doc.mime_type,
    category: doc.category,
    status: doc.status,
    uploadedBy: doc.uploaded_by,
    uploadedByName: doc.uploaded_by_name,
    uploadedAt: doc.uploaded_at || doc.creation,
    updatedAt: doc.updated_at || doc.modified,
    description: doc.description,
    tags: doc.tags ? (typeof doc.tags === "string" ? JSON.parse(doc.tags) : doc.tags) : [],
    version: doc.version || 1,
    licenseNumber: doc.license_number,
    affiliationId: doc.affiliation_id,
    inspectionId: doc.inspection_id,
    applicationId: doc.application_id,
    downloadUrl: doc.download_url || getDownloadUrl(doc.name || doc.id),
    previewUrl: doc.preview_url || getPreviewUrl(doc.name || doc.id),
    metadata: doc.metadata,
  }
}

// Mock data for development (remove when backend is ready)
const MOCK_DOCUMENTS: Document[] = [
  {
    id: "DOC-001",
    name: "Facility License Certificate",
    fileName: "license_cert_2024.pdf",
    fileSize: 245678,
    mimeType: "application/pdf",
    category: "license" as any,
    status: "active" as any,
    uploadedBy: "user@example.com",
    uploadedByName: "John Doe",
    uploadedAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    description: "Official facility license certificate for 2024",
    tags: ["license", "official", "2024"],
    version: 1,
    licenseNumber: "LIC-2024-001",
    downloadUrl: "/api/download/DOC-001",
    previewUrl: "/api/preview/DOC-001",
  },
  {
    id: "DOC-002",
    name: "Inspection Report Q1",
    fileName: "inspection_report_q1_2024.pdf",
    fileSize: 1234567,
    mimeType: "application/pdf",
    category: "inspection_report" as any,
    status: "active" as any,
    uploadedBy: "inspector@example.com",
    uploadedByName: "Jane Smith",
    uploadedAt: "2024-03-20T14:45:00Z",
    updatedAt: "2024-03-20T14:45:00Z",
    description: "Q1 2024 facility inspection report",
    tags: ["inspection", "Q1", "2024", "compliance"],
    version: 1,
    inspectionId: "INS-001",
    downloadUrl: "/api/download/DOC-002",
    previewUrl: "/api/preview/DOC-002",
  },
]

/**
 * Use mock data if backend is not available
 */
export async function listDocumentsMock(
  params: DocumentSearchParams = {}
): Promise<DocumentListResponse> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filtered = [...MOCK_DOCUMENTS]

  // Apply filters
  if (params.query) {
    const query = params.query.toLowerCase()
    filtered = filtered.filter(
      (doc) =>
        doc.name.toLowerCase().includes(query) ||
        doc.fileName.toLowerCase().includes(query) ||
        doc.description?.toLowerCase().includes(query)
    )
  }

  if (params.category) {
    filtered = filtered.filter((doc) => doc.category === params.category)
  }

  if (params.status) {
    filtered = filtered.filter((doc) => doc.status === params.status)
  }

  if (params.licenseNumber) {
    filtered = filtered.filter((doc) => doc.licenseNumber === params.licenseNumber)
  }

  if (params.affiliationId) {
    filtered = filtered.filter((doc) => doc.affiliationId === params.affiliationId)
  }

  if (params.inspectionId) {
    filtered = filtered.filter((doc) => doc.inspectionId === params.inspectionId)
  }

  // Sort
  if (params.sortBy) {
    filtered.sort((a, b) => {
      let aVal: any = a[params.sortBy!]
      let bVal: any = b[params.sortBy!]

      if (params.sortBy === "uploadedAt") {
        aVal = new Date(aVal).getTime()
        bVal = new Date(bVal).getTime()
      }

      if (params.sortOrder === "desc") {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })
  }

  // Paginate
  const page = params.page || 1
  const pageSize = params.pageSize || 20
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const paginated = filtered.slice(start, end)

  return {
    documents: paginated,
    total: filtered.length,
    page,
    pageSize,
    totalPages: Math.ceil(filtered.length / pageSize),
  }
}
