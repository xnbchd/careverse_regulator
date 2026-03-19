import { create } from 'zustand'
import type { Finding } from '@/types/inspection'
import * as inspectionApi from '@/api/inspectionApi'
import type { InspectionFilters } from '@/api/inspectionApi'

export interface FindingsState {
  findings: Finding[]
  loading: boolean
  error: string | null
  fetchFindings: (filters?: InspectionFilters) => Promise<void>
}

export const useFindingsStore = create<FindingsState>((set) => ({
  findings: [],
  loading: false,
  error: null,
  fetchFindings: async (filters) => {
    set({ loading: true, error: null })
    try {
      const findings = await inspectionApi.listFindings(filters)
      set({ findings, loading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch findings',
        loading: false
      })
    }
  }
}))
