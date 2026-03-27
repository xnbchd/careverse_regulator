import { create } from "zustand"
import { listFacilityRecords, listProfessionalRecords } from "@/api/registryApi"
import type {
  FacilityRecord,
  ProfessionalRecord,
  FacilityFilters,
  ProfessionalFilters,
} from "@/api/registryApi"

interface PaginationMeta {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

interface RegistryStore {
  // Facilities state
  facilities: FacilityRecord[]
  facilitiesLoading: boolean
  facilitiesError: string | null
  facilitiesPagination: PaginationMeta | null
  facilitiesFilters: FacilityFilters
  facilitiesCurrentPage: number
  facilitiesPageSize: number
  facilitiesAbortController: AbortController | null

  // Professionals state
  professionals: ProfessionalRecord[]
  professionalsLoading: boolean
  professionalsError: string | null
  professionalsPagination: PaginationMeta | null
  professionalsFilters: ProfessionalFilters
  professionalsCurrentPage: number
  professionalsPageSize: number
  professionalsAbortController: AbortController | null

  // Facilities actions
  setFacilitiesFilters: (filters: FacilityFilters) => void
  fetchFacilities: (page?: number, filters?: FacilityFilters) => Promise<void>
  setFacilitiesPage: (page: number) => void
  setFacilitiesPageSize: (pageSize: number) => void
  refreshFacilities: () => Promise<void>

  // Professionals actions
  setProfessionalsFilters: (filters: ProfessionalFilters) => void
  fetchProfessionals: (page?: number, filters?: ProfessionalFilters) => Promise<void>
  setProfessionalsPage: (page: number) => void
  setProfessionalsPageSize: (pageSize: number) => void
  refreshProfessionals: () => Promise<void>
}

export const useRegistryStore = create<RegistryStore>((set, get) => ({
  // Initial state
  facilities: [],
  facilitiesLoading: false,
  facilitiesError: null,
  facilitiesPagination: null,
  facilitiesFilters: {},
  facilitiesCurrentPage: 1,
  facilitiesPageSize: 20,
  facilitiesAbortController: null,

  professionals: [],
  professionalsLoading: false,
  professionalsError: null,
  professionalsPagination: null,
  professionalsFilters: {},
  professionalsCurrentPage: 1,
  professionalsPageSize: 20,
  professionalsAbortController: null,

  // Facilities actions
  setFacilitiesFilters: (filters) => {
    set({ facilitiesFilters: filters, facilitiesCurrentPage: 1 })
    get().fetchFacilities(1, filters)
  },

  setFacilitiesPage: (page) => {
    set({ facilitiesCurrentPage: page })
    get().fetchFacilities(page)
  },

  setFacilitiesPageSize: (pageSize) => {
    set({ facilitiesPageSize: pageSize, facilitiesCurrentPage: 1 })
    get().fetchFacilities(1)
  },

  fetchFacilities: async (page, filters) => {
    // Cancel previous request if exists
    if (get().facilitiesAbortController) {
      get().facilitiesAbortController?.abort()
    }

    const abortController = new AbortController()
    set({ facilitiesAbortController: abortController })

    const currentPage = page || get().facilitiesCurrentPage
    const currentFilters = filters || get().facilitiesFilters
    const pageSize = currentFilters.page_size || get().facilitiesPageSize

    set({ facilitiesLoading: true, facilitiesError: null })

    try {
      const response = await listFacilityRecords(
        currentPage,
        pageSize,
        currentFilters,
        abortController.signal
      )

      // Only update if this request wasn't aborted
      if (!abortController.signal.aborted) {
        set({
          facilities: response.data,
          facilitiesPagination: response.pagination,
          facilitiesLoading: false,
          facilitiesAbortController: null,
        })
      }
    } catch (error: unknown) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      set({
        facilitiesError: error instanceof Error ? error.message : "Failed to fetch facilities",
        facilitiesLoading: false,
        facilitiesAbortController: null,
      })
    }
  },

  refreshFacilities: async () => {
    const { facilitiesCurrentPage, facilitiesFilters } = get()
    await get().fetchFacilities(facilitiesCurrentPage, facilitiesFilters)
  },

  // Professionals actions
  setProfessionalsFilters: (filters) => {
    set({ professionalsFilters: filters, professionalsCurrentPage: 1 })
    get().fetchProfessionals(1, filters)
  },

  setProfessionalPage: (page) => {
    set({ professionalsCurrentPage: page })
    get().fetchProfessionals(page)
  },

  setProfessionalsPageSize: (pageSize) => {
    set({ professionalsPageSize: pageSize, professionalsCurrentPage: 1 })
    get().fetchProfessionals(1)
  },

  fetchProfessionals: async (page, filters) => {
    // Cancel previous request if exists
    if (get().professionalsAbortController) {
      get().professionalsAbortController?.abort()
    }

    const abortController = new AbortController()
    set({ professionalsAbortController: abortController })

    const currentPage = page || get().professionalsCurrentPage
    const currentFilters = filters || get().professionalsFilters
    const pageSize = currentFilters.page_size || get().professionalsPageSize

    set({ professionalsLoading: true, professionalsError: null })

    try {
      const response = await listProfessionalRecords(
        currentPage,
        pageSize,
        currentFilters,
        abortController.signal
      )

      // Only update if this request wasn't aborted
      if (!abortController.signal.aborted) {
        set({
          professionals: response.data,
          professionalsPagination: response.pagination,
          professionalsLoading: false,
          professionalsAbortController: null,
        })
      }
    } catch (error: unknown) {
      // Don't show error if request was aborted
      if (error instanceof Error && error.name === "AbortError") {
        return
      }

      set({
        professionalsError:
          error instanceof Error ? error.message : "Failed to fetch professionals",
        professionalsLoading: false,
        professionalsAbortController: null,
      })
    }
  },

  refreshProfessionals: async () => {
    const { professionalsCurrentPage, professionalsFilters } = get()
    await get().fetchProfessionals(professionalsCurrentPage, professionalsFilters)
  },
}))
