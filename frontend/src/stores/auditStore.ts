import { create } from "zustand"
import type {
  AuditLog,
  AuditLogSearchParams,
  AuditLogStats,
  EntityHistory,
  AuditAction,
  AuditEntity,
  AuditSeverity,
  AuditExportFormat,
} from "@/types/audit"
import {
  listAuditLogs,
  getAuditLog,
  getAuditStats,
  getEntityHistory,
  exportAuditLogs,
  logAuditEvent,
} from "@/api/auditApi"

interface AuditState {
  // Data
  logs: AuditLog[]
  selectedLog: AuditLog | null
  stats: AuditLogStats | null
  entityHistory: EntityHistory | null

  // Pagination
  page: number
  pageSize: number
  total: number
  totalPages: number

  // Filters
  filters: AuditLogSearchParams

  // Loading states
  isLoading: boolean
  isLoadingStats: boolean
  isLoadingHistory: boolean
  isExporting: boolean

  // Actions - Fetch
  fetchLogs: (params?: AuditLogSearchParams) => Promise<void>
  fetchLog: (logId: string) => Promise<void>
  fetchStats: (dateRange?: { startDate: string; endDate: string }) => Promise<void>
  fetchEntityHistory: (entityType: AuditEntity, entityId: string) => Promise<void>

  // Actions - Filters & Pagination
  setFilters: (filters: Partial<AuditLogSearchParams>) => void
  clearFilters: () => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void

  // Actions - Export
  exportLogs: (format: AuditExportFormat) => Promise<void>

  // Actions - Logging
  logEvent: (log: Omit<AuditLog, "id" | "timestamp">) => Promise<void>

  // Actions - UI
  selectLog: (log: AuditLog | null) => void
  clearSelected: () => void
  reset: () => void
}

const initialFilters: AuditLogSearchParams = {
  page: 1,
  pageSize: 20,
  sortBy: "timestamp",
  sortOrder: "desc",
}

export const useAuditStore = create<AuditState>((set, get) => ({
  // Initial state
  logs: [],
  selectedLog: null,
  stats: null,
  entityHistory: null,
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
  filters: { ...initialFilters },
  isLoading: false,
  isLoadingStats: false,
  isLoadingHistory: false,
  isExporting: false,

  // Fetch logs with filters and pagination
  fetchLogs: async (params?: AuditLogSearchParams) => {
    set({ isLoading: true })
    try {
      const currentFilters = get().filters
      const searchParams = { ...currentFilters, ...params }

      const response = await listAuditLogs(searchParams)

      set({
        logs: response.logs,
        page: response.page,
        pageSize: response.pageSize,
        total: response.total,
        totalPages: response.totalPages,
        filters: searchParams,
      })
    } catch (error) {
      console.error("Failed to fetch audit logs:", error)
      // Keep existing data on error
    } finally {
      set({ isLoading: false })
    }
  },

  // Fetch single log
  fetchLog: async (logId: string) => {
    set({ isLoading: true })
    try {
      const log = await getAuditLog(logId)
      set({ selectedLog: log })
    } catch (error) {
      console.error("Failed to fetch audit log:", error)
      set({ selectedLog: null })
    } finally {
      set({ isLoading: false })
    }
  },

  // Fetch statistics
  fetchStats: async (dateRange?: { startDate: string; endDate: string }) => {
    set({ isLoadingStats: true })
    try {
      const stats = await getAuditStats(dateRange)
      set({ stats })
    } catch (error) {
      console.error("Failed to fetch audit stats:", error)
      set({ stats: null })
    } finally {
      set({ isLoadingStats: false })
    }
  },

  // Fetch entity history
  fetchEntityHistory: async (entityType: AuditEntity, entityId: string) => {
    set({ isLoadingHistory: true })
    try {
      const history = await getEntityHistory(entityType, entityId)
      set({ entityHistory: history })
    } catch (error) {
      console.error("Failed to fetch entity history:", error)
      set({ entityHistory: null })
    } finally {
      set({ isLoadingHistory: false })
    }
  },

  // Set filters and refetch
  setFilters: (newFilters: Partial<AuditLogSearchParams>) => {
    const currentFilters = get().filters
    const updatedFilters = { ...currentFilters, ...newFilters, page: 1 } // Reset to page 1 on filter change
    set({ filters: updatedFilters })
    get().fetchLogs(updatedFilters)
  },

  // Clear all filters
  clearFilters: () => {
    set({ filters: { ...initialFilters } })
    get().fetchLogs(initialFilters)
  },

  // Change page
  setPage: (page: number) => {
    const filters = { ...get().filters, page }
    set({ filters })
    get().fetchLogs(filters)
  },

  // Change page size
  setPageSize: (pageSize: number) => {
    const filters = { ...get().filters, pageSize, page: 1 }
    set({ filters })
    get().fetchLogs(filters)
  },

  // Export logs
  exportLogs: async (format: AuditExportFormat) => {
    set({ isExporting: true })
    try {
      const { filters } = get()
      const blob = await exportAuditLogs({
        format,
        filters,
        includeDetails: true,
        includeChanges: true,
      })

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `audit-logs-${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Failed to export audit logs:", error)
      throw error
    } finally {
      set({ isExporting: false })
    }
  },

  // Log new audit event
  logEvent: async (log: Omit<AuditLog, "id" | "timestamp">) => {
    try {
      const newLog = await logAuditEvent(log)

      // Prepend to current logs if we're on page 1
      const state = get()
      if (state.page === 1) {
        const updatedLogs = [newLog, ...state.logs].slice(0, state.pageSize)
        set({
          logs: updatedLogs,
          total: state.total + 1,
        })
      }

      return newLog
    } catch (error) {
      console.error("Failed to log audit event:", error)
      throw error
    }
  },

  // Select log for detail view
  selectLog: (log: AuditLog | null) => {
    set({ selectedLog: log })
  },

  // Clear selected log
  clearSelected: () => {
    set({ selectedLog: null, entityHistory: null })
  },

  // Reset entire state
  reset: () => {
    set({
      logs: [],
      selectedLog: null,
      stats: null,
      entityHistory: null,
      page: 1,
      pageSize: 20,
      total: 0,
      totalPages: 0,
      filters: { ...initialFilters },
      isLoading: false,
      isLoadingStats: false,
      isLoadingHistory: false,
      isExporting: false,
    })
  },
}))
