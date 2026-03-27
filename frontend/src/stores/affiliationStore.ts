import { create } from "zustand"
import type {
  Affiliation,
  AffiliationPaginationMeta,
  CreateAffiliationPayload,
  AffiliationAction,
} from "@/types/affiliation"
import * as affiliationApi from "@/api/affiliationApi"
import type { AffiliationFilters } from "@/api/affiliationApi"

export interface AffiliationState {
  affiliations: Affiliation[]
  loading: boolean
  error: string | null
  pagination: AffiliationPaginationMeta | null
  currentPage: number
  pageSize: number
  filters: AffiliationFilters

  // Bulk selection
  selectedIds: Set<string>
  bulkActionLoading: boolean

  // Actions
  setFilters: (filters: AffiliationFilters) => void
  fetchAffiliations: (page?: number, filters?: AffiliationFilters) => Promise<void>
  getAffiliation: (id: string) => Promise<Affiliation>
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  approveAffiliation: (id: string, reason?: string) => Promise<void>
  rejectAffiliation: (id: string, reason?: string) => Promise<void>
  createAffiliation: (payload: CreateAffiliationPayload) => Promise<void>
  refreshAffiliations: () => Promise<void>

  // Bulk actions
  toggleSelection: (id: string) => void
  selectAll: () => void
  deselectAll: () => void
  bulkApprove: (
    ids: string[],
    reason?: string
  ) => Promise<{ succeeded: string[]; failed: string[] }>
  bulkReject: (ids: string[], reason?: string) => Promise<{ succeeded: string[]; failed: string[] }>
}

export const useAffiliationStore = create<AffiliationState>((set, get) => ({
  affiliations: [],
  loading: false,
  error: null,
  pagination: null,
  currentPage: 1,
  pageSize: 20,
  filters: {},
  selectedIds: new Set<string>(),
  bulkActionLoading: false,

  setFilters: (filters) => {
    set({ filters, currentPage: 1 })
    get().fetchAffiliations(1, filters)
  },

  setPage: (page) => {
    set({ currentPage: page })
    get().fetchAffiliations(page)
  },

  setPageSize: (pageSize) => {
    set({ pageSize, currentPage: 1 })
    get().fetchAffiliations(1)
  },

  fetchAffiliations: async (page, filters) => {
    const currentPage = page || get().currentPage
    const currentFilters = filters || get().filters
    const pageSize = currentFilters.page_size || get().pageSize

    set({ loading: true, error: null })
    try {
      const response = await affiliationApi.listAffiliations(currentPage, pageSize, currentFilters)
      set({
        affiliations: response.data,
        pagination: response.pagination,
        currentPage,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch affiliations",
        loading: false,
      })
    }
  },

  getAffiliation: async (id) => {
    set({ loading: true, error: null })
    try {
      const affiliation = await affiliationApi.getAffiliation(id)
      set({ loading: false })
      return affiliation
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch affiliation",
        loading: false,
      })
      throw error
    }
  },

  approveAffiliation: async (id, reason) => {
    set({ loading: true, error: null })
    try {
      await affiliationApi.approveAffiliation(id, reason)
      set({ loading: false })
      // Refresh the list
      await get().refreshAffiliations()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to approve affiliation",
        loading: false,
      })
      throw error
    }
  },

  rejectAffiliation: async (id, reason) => {
    set({ loading: true, error: null })
    try {
      await affiliationApi.rejectAffiliation(id, reason)
      set({ loading: false })
      // Refresh the list
      await get().refreshAffiliations()
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to reject affiliation",
        loading: false,
      })
      throw error
    }
  },

  createAffiliation: async (payload) => {
    set({ loading: true, error: null })
    try {
      const newAffiliation = await affiliationApi.createAffiliation(payload)
      set({
        affiliations: [newAffiliation, ...get().affiliations],
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create affiliation",
        loading: false,
      })
      throw error
    }
  },

  refreshAffiliations: async () => {
    const { currentPage, filters } = get()
    await get().fetchAffiliations(currentPage, filters)
  },

  // Bulk selection actions
  toggleSelection: (id) => {
    const selectedIds = new Set(get().selectedIds)
    if (selectedIds.has(id)) {
      selectedIds.delete(id)
    } else {
      selectedIds.add(id)
    }
    set({ selectedIds })
  },

  selectAll: () => {
    const selectedIds = new Set(get().affiliations.map((a) => a.affiliationId))
    set({ selectedIds })
  },

  deselectAll: () => {
    set({ selectedIds: new Set<string>() })
  },

  bulkApprove: async (ids, reason) => {
    set({ bulkActionLoading: true, error: null })
    const succeeded: string[] = []
    const failed: string[] = []

    try {
      // Process each ID sequentially to avoid overwhelming the API
      for (const id of ids) {
        try {
          await affiliationApi.approveAffiliation(id, reason)
          succeeded.push(id)
        } catch (error) {
          console.error(`Failed to approve affiliation ${id}:`, error)
          failed.push(id)
        }
      }

      // Remove succeeded IDs from selection
      const selectedIds = new Set(get().selectedIds)
      succeeded.forEach((id) => selectedIds.delete(id))

      set({ bulkActionLoading: false, selectedIds })

      // Refresh the list
      await get().refreshAffiliations()

      return { succeeded, failed }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Bulk approve operation failed",
        bulkActionLoading: false,
      })
      throw error
    }
  },

  bulkReject: async (ids, reason) => {
    set({ bulkActionLoading: true, error: null })
    const succeeded: string[] = []
    const failed: string[] = []

    try {
      // Process each ID sequentially to avoid overwhelming the API
      for (const id of ids) {
        try {
          await affiliationApi.rejectAffiliation(id, reason)
          succeeded.push(id)
        } catch (error) {
          console.error(`Failed to reject affiliation ${id}:`, error)
          failed.push(id)
        }
      }

      // Remove succeeded IDs from selection
      const selectedIds = new Set(get().selectedIds)
      succeeded.forEach((id) => selectedIds.delete(id))

      set({ bulkActionLoading: false, selectedIds })

      // Refresh the list
      await get().refreshAffiliations()

      return { succeeded, failed }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Bulk reject operation failed",
        bulkActionLoading: false,
      })
      throw error
    }
  },
}))

// Initialize affiliations on store creation
useAffiliationStore.getState().fetchAffiliations()
