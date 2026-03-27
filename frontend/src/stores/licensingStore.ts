import { create } from "zustand"
import type {
  License,
  LicensePaginationMeta,
  LicenseAction,
  LicenseApplication,
  ProfessionalLicenseRecord,
  ProfessionalLicenseApplication,
  FacilityOption,
  CreateLicenseAppealPayload,
} from "@/types/license"
import * as licensingApi from "@/api/licensingApi"
import type { LicenseFilters } from "@/api/licensingApi"

export interface LicensingState {
  // Licenses
  licenses: License[]
  licensesLoading: boolean
  licensesError: string | null
  licensesPagination: LicensePaginationMeta | null
  licensesCurrentPage: number
  licensesPageSize: number
  licensesFilters: LicenseFilters

  // License Applications
  applications: LicenseApplication[]
  applicationsLoading: boolean
  applicationsError: string | null
  applicationsPagination: LicensePaginationMeta | null
  applicationsCurrentPage: number
  applicationsPageSize: number
  applicationsFilters: any

  // Professional Licenses
  professionalLicenses: ProfessionalLicenseRecord[]
  professionalLicensesLoading: boolean
  professionalLicensesError: string | null
  professionalLicensesPagination: LicensePaginationMeta | null
  professionalLicensesCurrentPage: number
  professionalLicensesPageSize: number
  professionalLicensesFilters: any

  // Professional License Applications
  professionalApplications: ProfessionalLicenseApplication[]
  professionalApplicationsLoading: boolean
  professionalApplicationsError: string | null
  professionalApplicationsPagination: LicensePaginationMeta | null
  professionalApplicationsCurrentPage: number
  professionalApplicationsPageSize: number
  professionalApplicationsFilters: any

  // Facilities (for dropdowns)
  facilities: FacilityOption[]
  facilitiesLoading: boolean

  // Bulk selection
  selectedLicenseIds: Set<string>
  bulkLicenseActionLoading: boolean

  // Actions for Licenses
  setLicensesFilters: (filters: LicenseFilters) => void
  fetchLicenses: (page?: number, filters?: LicenseFilters) => Promise<void>
  getLicense: (licenseNumber: string) => Promise<License>
  setLicensesPage: (page: number) => void
  setLicensesPageSize: (pageSize: number) => void
  updateLicense: (licenseNumber: string, action: LicenseAction) => Promise<void>
  refreshLicenses: () => Promise<void>

  // Actions for Professional Licenses
  setProfessionalLicensesFilters: (filters: any) => void
  fetchProfessionalLicenses: (page?: number, filters?: any) => Promise<void>
  setProfessionalLicensesPage: (page: number) => void
  refreshProfessionalLicenses: () => Promise<void>

  // Actions for Facility License Applications
  setApplicationsFilters: (filters: any) => void
  fetchApplications: (page?: number, filters?: any) => Promise<void>
  setApplicationsPage: (page: number) => void
  setApplicationsPageSize: (pageSize: number) => void
  refreshApplications: () => Promise<void>

  // Actions for Professional License Applications
  setProfessionalApplicationsFilters: (filters: any) => void
  fetchProfessionalApplications: (page?: number, filters?: any) => Promise<void>
  setProfessionalApplicationsPage: (page: number) => void
  refreshProfessionalApplications: () => Promise<void>

  // Actions for Facilities
  fetchFacilities: () => Promise<void>

  // Appeal
  createAppeal: (payload: CreateLicenseAppealPayload) => Promise<void>

  // Bulk license actions
  toggleLicenseSelection: (licenseNumber: string) => void
  selectAllLicenses: () => void
  deselectAllLicenses: () => void
  bulkUpdateLicenseStatus: (
    licenseNumbers: string[],
    action: LicenseAction
  ) => Promise<{ succeeded: string[]; failed: string[] }>
}

export const useLicensingStore = create<LicensingState>((set, get) => ({
  // Licenses state
  licenses: [],
  licensesLoading: false,
  licensesError: null,
  licensesPagination: null,
  licensesCurrentPage: 1,
  licensesPageSize: 20,
  licensesFilters: {},

  // Applications state
  applications: [],
  applicationsLoading: false,
  applicationsError: null,
  applicationsPagination: null,
  applicationsCurrentPage: 1,
  applicationsPageSize: 20,
  applicationsFilters: {},

  // Professional Licenses state
  professionalLicenses: [],
  professionalLicensesLoading: false,
  professionalLicensesError: null,
  professionalLicensesPagination: null,
  professionalLicensesCurrentPage: 1,
  professionalLicensesPageSize: 20,
  professionalLicensesFilters: {},

  // Professional Applications state
  professionalApplications: [],
  professionalApplicationsLoading: false,
  professionalApplicationsError: null,
  professionalApplicationsPagination: null,
  professionalApplicationsCurrentPage: 1,
  professionalApplicationsPageSize: 20,
  professionalApplicationsFilters: {},

  // Facilities state
  facilities: [],
  facilitiesLoading: false,

  // Bulk selection state
  selectedLicenseIds: new Set<string>(),
  bulkLicenseActionLoading: false,

  // Licenses actions
  setLicensesFilters: (filters) => {
    set({ licensesFilters: filters, licensesCurrentPage: 1 })
    get().fetchLicenses(1, filters)
  },

  setLicensesPage: (page) => {
    set({ licensesCurrentPage: page })
    get().fetchLicenses(page)
  },

  setLicensesPageSize: (pageSize) => {
    set({ licensesPageSize: pageSize, licensesCurrentPage: 1 })
    get().fetchLicenses(1)
  },

  fetchLicenses: async (page, filters) => {
    const currentPage = page || get().licensesCurrentPage
    const currentFilters = filters || get().licensesFilters
    const pageSize = currentFilters.page_size || get().licensesPageSize

    set({ licensesLoading: true, licensesError: null })
    try {
      const response = await licensingApi.listLicenses(currentPage, pageSize, currentFilters)
      set({
        licenses: response.data,
        licensesPagination: response.pagination,
        licensesCurrentPage: currentPage,
        licensesLoading: false,
      })
    } catch (error) {
      set({
        licensesError: error instanceof Error ? error.message : "Failed to fetch licenses",
        licensesLoading: false,
      })
    }
  },

  getLicense: async (licenseNumber) => {
    set({ licensesLoading: true, licensesError: null })
    try {
      const license = await licensingApi.getLicense(licenseNumber)
      set({ licensesLoading: false })
      return license
    } catch (error) {
      set({
        licensesError: error instanceof Error ? error.message : "Failed to fetch license",
        licensesLoading: false,
      })
      throw error
    }
  },

  updateLicense: async (licenseNumber, action) => {
    set({ licensesLoading: true, licensesError: null })
    try {
      await licensingApi.updateLicense(licenseNumber, action)
      set({ licensesLoading: false })
      // Refresh the list
      await get().refreshLicenses()
    } catch (error) {
      set({
        licensesError: error instanceof Error ? error.message : "Failed to update license",
        licensesLoading: false,
      })
      throw error
    }
  },

  refreshLicenses: async () => {
    const { licensesCurrentPage, licensesFilters } = get()
    await get().fetchLicenses(licensesCurrentPage, licensesFilters)
  },

  // Professional Licenses actions
  setProfessionalLicensesFilters: (filters) => {
    set({ professionalLicensesFilters: filters, professionalLicensesCurrentPage: 1 })
    get().fetchProfessionalLicenses(1, filters)
  },

  setProfessionalLicensesPage: (page) => {
    set({ professionalLicensesCurrentPage: page })
    get().fetchProfessionalLicenses(page)
  },

  fetchProfessionalLicenses: async (page, filters) => {
    const currentPage = page || get().professionalLicensesCurrentPage
    const currentFilters = filters || get().professionalLicensesFilters
    const pageSize = get().professionalLicensesPageSize

    set({ professionalLicensesLoading: true, professionalLicensesError: null })
    try {
      const response = await licensingApi.listProfessionalLicenses(
        currentPage,
        pageSize,
        currentFilters
      )
      set({
        professionalLicenses: response.data,
        professionalLicensesPagination: response.pagination,
        professionalLicensesCurrentPage: currentPage,
        professionalLicensesLoading: false,
      })
    } catch (error) {
      set({
        professionalLicensesError:
          error instanceof Error ? error.message : "Failed to fetch professional licenses",
        professionalLicensesLoading: false,
      })
    }
  },

  refreshProfessionalLicenses: async () => {
    const { professionalLicensesCurrentPage, professionalLicensesFilters } = get()
    await get().fetchProfessionalLicenses(
      professionalLicensesCurrentPage,
      professionalLicensesFilters
    )
  },

  // Applications actions
  setApplicationsFilters: (filters) => {
    set({ applicationsFilters: filters, applicationsCurrentPage: 1 })
    get().fetchApplications(1, filters)
  },

  setApplicationsPage: (page) => {
    set({ applicationsCurrentPage: page })
    get().fetchApplications(page)
  },

  setApplicationsPageSize: (pageSize) => {
    set({ applicationsPageSize: pageSize, applicationsCurrentPage: 1 })
    get().fetchApplications(1)
  },

  fetchApplications: async (page, filters) => {
    const currentPage = page || get().applicationsCurrentPage
    const currentFilters = filters || get().applicationsFilters
    const pageSize = currentFilters.page_size || get().applicationsPageSize

    set({ applicationsLoading: true, applicationsError: null })
    try {
      const response = await licensingApi.listLicenseApplications(
        currentPage,
        pageSize,
        currentFilters
      )
      set({
        applications: response.data,
        applicationsPagination: response.pagination,
        applicationsCurrentPage: currentPage,
        applicationsLoading: false,
      })
    } catch (error) {
      set({
        applicationsError: error instanceof Error ? error.message : "Failed to fetch applications",
        applicationsLoading: false,
      })
    }
  },

  refreshApplications: async () => {
    const { applicationsCurrentPage, applicationsFilters } = get()
    await get().fetchApplications(applicationsCurrentPage, applicationsFilters)
  },

  // Professional Applications actions
  setProfessionalApplicationsFilters: (filters) => {
    set({ professionalApplicationsFilters: filters, professionalApplicationsCurrentPage: 1 })
    get().fetchProfessionalApplications(1, filters)
  },

  setProfessionalApplicationsPage: (page) => {
    set({ professionalApplicationsCurrentPage: page })
    get().fetchProfessionalApplications(page)
  },

  fetchProfessionalApplications: async (page, filters) => {
    const currentPage = page || get().professionalApplicationsCurrentPage
    const currentFilters = filters || get().professionalApplicationsFilters
    const pageSize = get().professionalApplicationsPageSize

    set({ professionalApplicationsLoading: true, professionalApplicationsError: null })
    try {
      const response = await licensingApi.listProfessionalLicenseApplications(
        currentPage,
        pageSize,
        currentFilters
      )
      set({
        professionalApplications: response.data,
        professionalApplicationsPagination: response.pagination,
        professionalApplicationsCurrentPage: currentPage,
        professionalApplicationsLoading: false,
      })
    } catch (error) {
      set({
        professionalApplicationsError:
          error instanceof Error
            ? error.message
            : "Failed to fetch professional license applications",
        professionalApplicationsLoading: false,
      })
    }
  },

  refreshProfessionalApplications: async () => {
    const { professionalApplicationsCurrentPage, professionalApplicationsFilters } = get()
    await get().fetchProfessionalApplications(
      professionalApplicationsCurrentPage,
      professionalApplicationsFilters
    )
  },

  // Facilities actions
  fetchFacilities: async () => {
    set({ facilitiesLoading: true })
    try {
      const facilities = await licensingApi.listFacilities()
      set({ facilities, facilitiesLoading: false })
    } catch (error) {
      set({ facilitiesLoading: false })
    }
  },

  // Appeal
  createAppeal: async (payload) => {
    set({ licensesLoading: true, licensesError: null })
    try {
      await licensingApi.createLicenseAppeal(payload)
      set({ licensesLoading: false })
    } catch (error) {
      set({
        licensesError: error instanceof Error ? error.message : "Failed to create appeal",
        licensesLoading: false,
      })
      throw error
    }
  },

  // Bulk license selection actions
  toggleLicenseSelection: (licenseNumber) => {
    const selectedLicenseIds = new Set(get().selectedLicenseIds)
    if (selectedLicenseIds.has(licenseNumber)) {
      selectedLicenseIds.delete(licenseNumber)
    } else {
      selectedLicenseIds.add(licenseNumber)
    }
    set({ selectedLicenseIds })
  },

  selectAllLicenses: () => {
    const selectedLicenseIds = new Set(get().licenses.map((l) => l.licenseNumber))
    set({ selectedLicenseIds })
  },

  deselectAllLicenses: () => {
    set({ selectedLicenseIds: new Set<string>() })
  },

  bulkUpdateLicenseStatus: async (licenseNumbers, action) => {
    set({ bulkLicenseActionLoading: true, licensesError: null })
    const succeeded: string[] = []
    const failed: string[] = []

    try {
      // Process each license sequentially to avoid overwhelming the API
      for (const licenseNumber of licenseNumbers) {
        try {
          await licensingApi.updateLicense(licenseNumber, action)
          succeeded.push(licenseNumber)
        } catch (error) {
          console.error(`Failed to update license ${licenseNumber}:`, error)
          failed.push(licenseNumber)
        }
      }

      // Remove succeeded IDs from selection
      const selectedLicenseIds = new Set(get().selectedLicenseIds)
      succeeded.forEach((id) => selectedLicenseIds.delete(id))

      set({ bulkLicenseActionLoading: false, selectedLicenseIds })

      // Refresh the list
      await get().refreshLicenses()

      return { succeeded, failed }
    } catch (error) {
      set({
        licensesError: error instanceof Error ? error.message : "Bulk update operation failed",
        bulkLicenseActionLoading: false,
      })
      throw error
    }
  },
}))

// Initialize on store creation
useLicensingStore.getState().fetchLicenses()
useLicensingStore.getState().fetchProfessionalLicenses()
useLicensingStore.getState().fetchApplications()
useLicensingStore.getState().fetchProfessionalApplications()
useLicensingStore.getState().fetchFacilities()
