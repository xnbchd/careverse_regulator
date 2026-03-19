import { create } from 'zustand'
import type { Inspection, Facility, Professional } from '@/types/inspection'
import * as inspectionApi from '@/api/inspectionApi'

export interface InspectionState {
  inspections: Inspection[]
  facilities: Facility[]
  professionals: Professional[]
  loading: boolean
  facilitiesLoading: boolean
  professionalsLoading: boolean
  error: string | null
  activeTab: 'scheduled' | 'findings'
  setActiveTab: (tab: 'scheduled' | 'findings') => void
  fetchInspections: () => Promise<void>
  fetchFacilities: () => Promise<void>
  fetchProfessionals: () => Promise<void>
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
  professionals: [],
  loading: false,
  facilitiesLoading: false,
  professionalsLoading: false,
  error: null,
  activeTab: 'scheduled',

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchInspections: async () => {
    set({ loading: true, error: null })
    try {
      const inspections = await inspectionApi.listInspections()
      set({ inspections, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch inspections',
        loading: false
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
        error: error instanceof Error ? error.message : 'Failed to fetch facilities',
        facilitiesLoading: false
      })
    }
  },

  fetchProfessionals: async () => {
    set({ professionalsLoading: true })
    try {
      const professionals = await inspectionApi.listProfessionals()
      set({ professionals, professionalsLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch professionals',
        professionalsLoading: false
      })
    }
  },

  createInspection: async (formData) => {
    set({ loading: true, error: null })
    try {
      const payload = inspectionApi.createInspectionFromForm(formData)
      const newInspection = await inspectionApi.createInspection(payload)
      set({
        inspections: [...get().inspections, newInspection],
        loading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create inspection',
        loading: false
      })
      throw error
    }
  },

  deleteInspection: async (id) => {
    set({ loading: true, error: null })
    try {
      await inspectionApi.deleteInspection(id)
      set({
        inspections: get().inspections.filter(inspection => inspection.id !== id),
        loading: false
      })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete inspection',
        loading: false
      })
      throw error
    }
  },
}))

// Initialize inspections on store creation
useInspectionStore.getState().fetchInspections()
