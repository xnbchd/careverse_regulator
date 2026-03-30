import { create } from "zustand"
import type { Inspection, Facility, PaginationMeta } from "@/types/inspection"
import * as inspectionApi from "@/api/inspectionApi"
import type { InspectionFilters } from "@/api/inspectionApi"

export interface InspectionState {
  inspections: Inspection[]
  facilities: Facility[]
  loading: boolean
  facilitiesLoading: boolean
  error: string | null
  activeTab: "scheduled" | "findings"
  pagination: PaginationMeta | null
  currentPage: number
  pageSize: number
  setActiveTab: (tab: "scheduled" | "findings") => void
  fetchInspections: (page?: number, filters?: InspectionFilters) => Promise<void>
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
  fetchFacilities: () => Promise<void>
  createInspection: (formData: {
    facility: string
    inspector: string
    date: string
    note: string
  }) => Promise<void>
  deleteInspection: (id: string) => Promise<void>
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
  inspections: [],
  facilities: [],
  loading: false,
  facilitiesLoading: false,
  error: null,
  activeTab: "scheduled",
  pagination: null,
  currentPage: 1,
  pageSize: 20,

  setActiveTab: (tab) => set({ activeTab: tab }),

  setPage: (page) => {
    set({ currentPage: page })
    get().fetchInspections(page)
  },

  setPageSize: (pageSize) => {
    set({ pageSize, currentPage: 1 })
    get().fetchInspections(1)
  },

  fetchInspections: async (page, filters) => {
    const currentPage = page || get().currentPage
    const pageSize = filters?.page_size || get().pageSize
    set({ loading: true, error: null })
    try {
      const response = await inspectionApi.listInspections(currentPage, pageSize, filters)
      set({
        inspections: response.data,
        pagination: response.pagination,
        currentPage,
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch inspections",
        loading: false,
      })
    }
  },

  fetchFacilities: async () => {
    set({ facilitiesLoading: true })
    try {
      const facilities = await inspectionApi.listFacilities()
      set({ facilities, facilitiesLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to fetch facilities",
        facilitiesLoading: false,
      })
    }
  },

  createInspection: async (formData) => {
    set({ loading: true, error: null })
    try {
      // Add default values for inspectionType and priority
      const formDataWithDefaults = {
        ...formData,
        inspectionType: "Routine" as const,
        priority: "Routine" as const,
      }
      const payload = inspectionApi.createInspectionFromForm(formDataWithDefaults)
      const newInspection = await inspectionApi.createInspection(payload)
      set({
        inspections: [...get().inspections, newInspection],
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to create inspection",
        loading: false,
      })
      throw error
    }
  },

  deleteInspection: async (id) => {
    set({ loading: true, error: null })
    try {
      await inspectionApi.deleteInspection(id)
      set({
        inspections: get().inspections.filter((inspection) => inspection.id !== id),
        loading: false,
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "Failed to delete inspection",
        loading: false,
      })
      throw error
    }
  },
}))

// Initialize inspections on store creation
useInspectionStore.getState().fetchInspections()
