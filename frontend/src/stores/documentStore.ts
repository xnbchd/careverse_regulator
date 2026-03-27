import { create } from "zustand"
import type {
  Document,
  DocumentUploadRequest,
  DocumentUpdateRequest,
  DocumentSearchParams,
  UploadProgress,
} from "@/types/document"
import {
  uploadDocument,
  listDocuments,
  listDocumentsMock,
  getDocument,
  getDocumentWithVersions,
  updateDocument,
  deleteDocument,
} from "@/api/documentApi"

interface DocumentState {
  // Documents data
  documents: Document[]
  selectedDocument: Document | null
  total: number
  page: number
  pageSize: number
  totalPages: number

  // Upload state
  uploads: Map<string, UploadProgress>

  // UI state
  loading: boolean
  uploading: boolean
  error: string | null

  // Search and filters
  searchParams: DocumentSearchParams

  // Actions
  fetchDocuments: (params?: DocumentSearchParams) => Promise<void>
  fetchDocument: (documentId: string) => Promise<void>
  uploadDocuments: (requests: DocumentUploadRequest[]) => Promise<void>
  updateDocument: (documentId: string, updates: DocumentUpdateRequest) => Promise<void>
  deleteDocument: (documentId: string) => Promise<void>
  setSearchParams: (params: DocumentSearchParams) => void
  clearError: () => void
  setPage: (page: number) => void
  clearSelection: () => void

  // Upload progress tracking
  updateUploadProgress: (fileId: string, progress: Partial<UploadProgress>) => void
  clearUploadProgress: (fileId: string) => void
  clearAllUploads: () => void
}

export const useDocumentStore = create<DocumentState>((set, get) => ({
  // Initial state
  documents: [],
  selectedDocument: null,
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  uploads: new Map(),
  loading: false,
  uploading: false,
  error: null,
  searchParams: {
    page: 1,
    pageSize: 20,
    sortBy: "uploadedAt",
    sortOrder: "desc",
  },

  // Fetch documents with filters and pagination
  fetchDocuments: async (params) => {
    set({ loading: true, error: null })
    try {
      const searchParams = params || get().searchParams

      // Use mock data for development
      // Switch to real API when backend is ready:
      // const response = await listDocuments(searchParams)
      const response = await listDocumentsMock(searchParams)

      set({
        documents: response.documents,
        total: response.total,
        page: response.page,
        pageSize: response.pageSize,
        totalPages: response.totalPages,
        searchParams,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch documents",
        loading: false,
      })
    }
  },

  // Fetch single document
  fetchDocument: async (documentId) => {
    set({ loading: true, error: null })
    try {
      const document = await getDocument(documentId)
      set({ selectedDocument: document, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch document",
        loading: false,
      })
    }
  },

  // Upload multiple documents
  uploadDocuments: async (requests) => {
    set({ uploading: true, error: null })

    const uploads = new Map(get().uploads)

    try {
      // Initialize upload progress for each file
      requests.forEach((req) => {
        const fileId = `${req.file.name}-${req.file.lastModified}`
        uploads.set(fileId, {
          file: req.file,
          progress: 0,
          status: "pending",
        })
      })
      set({ uploads })

      // Upload files sequentially
      for (const req of requests) {
        const fileId = `${req.file.name}-${req.file.lastModified}`

        try {
          // Update status to uploading
          uploads.set(fileId, {
            ...uploads.get(fileId)!,
            status: "uploading",
            progress: 50,
          })
          set({ uploads: new Map(uploads) })

          // Perform upload
          const document = await uploadDocument(req)

          // Update status to completed
          uploads.set(fileId, {
            ...uploads.get(fileId)!,
            status: "completed",
            progress: 100,
            documentId: document.id,
          })
          set({ uploads: new Map(uploads) })
        } catch (error) {
          // Update status to error
          uploads.set(fileId, {
            ...uploads.get(fileId)!,
            status: "error",
            error: error instanceof Error ? error.message : "Upload failed",
          })
          set({ uploads: new Map(uploads) })
        }
      }

      // Refresh document list after all uploads
      await get().fetchDocuments()

      set({ uploading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Upload failed",
        uploading: false,
      })
    }
  },

  // Update document metadata
  updateDocument: async (documentId, updates) => {
    set({ loading: true, error: null })
    try {
      const updated = await updateDocument(documentId, updates)

      // Update in list
      set((state) => ({
        documents: state.documents.map((doc) => (doc.id === documentId ? updated : doc)),
        selectedDocument:
          state.selectedDocument?.id === documentId ? updated : state.selectedDocument,
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to update document",
        loading: false,
      })
    }
  },

  // Delete document
  deleteDocument: async (documentId) => {
    set({ loading: true, error: null })
    try {
      await deleteDocument(documentId)

      // Remove from list
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== documentId),
        selectedDocument: state.selectedDocument?.id === documentId ? null : state.selectedDocument,
        total: state.total - 1,
        loading: false,
      }))
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete document",
        loading: false,
      })
    }
  },

  // Update search parameters
  setSearchParams: (params) => {
    set({ searchParams: { ...get().searchParams, ...params } })
    get().fetchDocuments({ ...get().searchParams, ...params })
  },

  // Set current page
  setPage: (page) => {
    set({ page })
    get().fetchDocuments({ ...get().searchParams, page })
  },

  // Clear error
  clearError: () => {
    set({ error: null })
  },

  // Clear selection
  clearSelection: () => {
    set({ selectedDocument: null })
  },

  // Upload progress tracking
  updateUploadProgress: (fileId, progress) => {
    const uploads = new Map(get().uploads)
    const existing = uploads.get(fileId)
    if (existing) {
      uploads.set(fileId, { ...existing, ...progress })
      set({ uploads })
    }
  },

  clearUploadProgress: (fileId) => {
    const uploads = new Map(get().uploads)
    uploads.delete(fileId)
    set({ uploads })
  },

  clearAllUploads: () => {
    set({ uploads: new Map() })
  },
}))
