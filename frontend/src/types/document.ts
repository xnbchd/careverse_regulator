export enum DocumentCategory {
  LICENSE = "license",
  CERTIFICATE = "certificate",
  INSPECTION_REPORT = "inspection_report",
  APPEAL = "appeal",
  APPLICATION = "application",
  AFFILIATION = "affiliation",
  COMPLIANCE = "compliance",
  CORRESPONDENCE = "correspondence",
  OTHER = "other",
}

export enum DocumentStatus {
  ACTIVE = "active",
  ARCHIVED = "archived",
  DELETED = "deleted",
}

export interface Document {
  id: string
  name: string
  fileName: string
  fileSize: number
  mimeType: string
  category: DocumentCategory
  status: DocumentStatus
  uploadedBy: string
  uploadedByName?: string
  uploadedAt: string
  updatedAt: string
  description?: string
  tags: string[]
  version: number

  // Associations
  licenseNumber?: string
  affiliationId?: string
  inspectionId?: string
  applicationId?: string

  // File URL
  downloadUrl?: string
  previewUrl?: string

  // Metadata
  metadata?: Record<string, any>
}

export interface DocumentUploadRequest {
  file: File
  category: DocumentCategory
  description?: string
  tags?: string[]
  licenseNumber?: string
  affiliationId?: string
  inspectionId?: string
  applicationId?: string
}

export interface DocumentUpdateRequest {
  name?: string
  description?: string
  category?: DocumentCategory
  tags?: string[]
  status?: DocumentStatus
}

export interface DocumentSearchParams {
  query?: string
  category?: DocumentCategory
  status?: DocumentStatus
  tags?: string[]
  licenseNumber?: string
  affiliationId?: string
  inspectionId?: string
  applicationId?: string
  uploadedBy?: string
  startDate?: string
  endDate?: string
  page?: number
  pageSize?: number
  sortBy?: "name" | "uploadedAt" | "fileSize" | "category"
  sortOrder?: "asc" | "desc"
}

export interface DocumentListResponse {
  documents: Document[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DocumentVersion {
  version: number
  uploadedAt: string
  uploadedBy: string
  uploadedByName?: string
  fileSize: number
  downloadUrl: string
}

export interface DocumentWithVersions extends Document {
  versions: DocumentVersion[]
}

// Frontend-only helper types
export interface UploadProgress {
  file: File
  progress: number
  status: "pending" | "uploading" | "completed" | "error"
  error?: string
  documentId?: string
}

export const SUPPORTED_FILE_TYPES = {
  // Documents
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.ms-excel": [".xls"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],

  // Images
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
  "image/gif": [".gif"],
  "image/webp": [".webp"],

  // Archives
  "application/zip": [".zip"],
  "application/x-rar-compressed": [".rar"],
} as const

export const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB

export function getCategoryLabel(category: DocumentCategory): string {
  const labels: Record<DocumentCategory, string> = {
    [DocumentCategory.LICENSE]: "License",
    [DocumentCategory.CERTIFICATE]: "Certificate",
    [DocumentCategory.INSPECTION_REPORT]: "Inspection Report",
    [DocumentCategory.APPEAL]: "Appeal",
    [DocumentCategory.APPLICATION]: "Application",
    [DocumentCategory.AFFILIATION]: "Affiliation",
    [DocumentCategory.COMPLIANCE]: "Compliance",
    [DocumentCategory.CORRESPONDENCE]: "Correspondence",
    [DocumentCategory.OTHER]: "Other",
  }
  return labels[category]
}

export function getCategoryColor(category: DocumentCategory): string {
  const colors: Record<DocumentCategory, string> = {
    [DocumentCategory.LICENSE]: "text-blue-600 bg-blue-50 border-blue-200",
    [DocumentCategory.CERTIFICATE]: "text-green-600 bg-green-50 border-green-200",
    [DocumentCategory.INSPECTION_REPORT]: "text-purple-600 bg-purple-50 border-purple-200",
    [DocumentCategory.APPEAL]: "text-red-600 bg-red-50 border-red-200",
    [DocumentCategory.APPLICATION]: "text-orange-600 bg-orange-50 border-orange-200",
    [DocumentCategory.AFFILIATION]: "text-teal-600 bg-teal-50 border-teal-200",
    [DocumentCategory.COMPLIANCE]: "text-indigo-600 bg-indigo-50 border-indigo-200",
    [DocumentCategory.CORRESPONDENCE]: "text-muted-foreground bg-muted/50 border-border",
    [DocumentCategory.OTHER]: "text-slate-600 bg-slate-50 border-slate-200",
  }
  return colors[category]
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️"
  if (mimeType.includes("pdf")) return "📄"
  if (mimeType.includes("word") || mimeType.includes("document")) return "📝"
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return "📊"
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️"
  return "📎"
}

export function isPreviewSupported(mimeType: string): boolean {
  return mimeType.startsWith("image/") || mimeType === "application/pdf"
}
