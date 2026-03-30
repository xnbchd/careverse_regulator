import { create } from "zustand"
import type {
  FrappeUser,
  UserFilters,
  PaginationInfo,
  RoleDefinition,
  UserActivityReport,
} from "@/types/user"
import type { Inspector } from "@/types/inspection"
import * as inspectionApi from "@/api/inspectionApi"

// ---------------------------------------------------------------------------
// Static role definitions — the 3 portal roles
// ---------------------------------------------------------------------------

const PORTAL_ROLES: RoleDefinition[] = [
  {
    name: "Regulator Admin",
    description: "Full administrative access to all portal modules.",
    capabilities: [
      "User & Role Management",
      "System Settings",
      "Audit Logs",
      "License Management",
      "Inspection Management",
      "Affiliations",
      "Analytics & Reports",
    ],
  },
  {
    name: "Inspection Manager",
    description: "Manages inspections and has access to license records.",
    capabilities: ["Inspection Management", "License Management", "Audit Logs"],
  },
  {
    name: "Regulator User",
    description: "General access to operational modules. No admin capabilities.",
    capabilities: [
      "License Management",
      "Inspection Management",
      "Affiliations",
      "Analytics & Reports",
    ],
  },
]

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export type UserTab = "users" | "roles" | "activity"

interface UserManagementState {
  // User list
  users: FrappeUser[]
  totalUsers: number
  pagination: PaginationInfo | null
  filters: UserFilters
  isLoading: boolean

  // Selected user for edit / view
  selectedUser: FrappeUser | null

  // Roles (static)
  roles: RoleDefinition[]

  // Activity reports
  activityReports: UserActivityReport[]
  activityReportsPagination: PaginationInfo | null
  isLoadingReports: boolean

  // Inspectors (users with Field Inspector role)
  inspectors: Inspector[]
  inspectorsLoading: boolean

  // UI state
  activeTab: UserTab

  // Actions
  setUsers: (users: FrappeUser[], pagination: PaginationInfo | null) => void
  setFilters: (filters: Partial<UserFilters>) => void
  clearFilters: () => void
  setActiveTab: (tab: UserTab) => void
  setSelectedUser: (user: FrappeUser | null) => void
  setLoading: (loading: boolean) => void
  setActivityReports: (reports: UserActivityReport[], pagination: PaginationInfo | null) => void
  setLoadingReports: (loading: boolean) => void
  fetchInspectors: (search?: string) => Promise<void>
  searchInspectors: (searchTerm: string) => Promise<Inspector[]>
}

export const useUserStore = create<UserManagementState>((set) => ({
  users: [],
  totalUsers: 0,
  pagination: null,
  filters: {
    role: "all",
    status: "all",
    page: 1,
    page_size: 20,
  },
  isLoading: false,

  selectedUser: null,

  roles: PORTAL_ROLES,

  activityReports: [],
  activityReportsPagination: null,
  isLoadingReports: false,

  inspectors: [],
  inspectorsLoading: false,

  activeTab: "users",

  setUsers: (users, pagination) =>
    set({
      users,
      totalUsers: pagination?.count ?? users.length,
      pagination,
      isLoading: false,
    }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),

  clearFilters: () =>
    set({
      filters: { role: "all", status: "all", page: 1, page_size: 20 },
    }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  setSelectedUser: (user) => set({ selectedUser: user }),

  setLoading: (loading) => set({ isLoading: loading }),

  setActivityReports: (reports, pagination) =>
    set({
      activityReports: reports,
      activityReportsPagination: pagination,
      isLoadingReports: false,
    }),

  setLoadingReports: (loading) => set({ isLoadingReports: loading }),

  fetchInspectors: async (search?: string) => {
    set({ inspectorsLoading: true })
    try {
      const inspectors = await inspectionApi.listInspectors(search)
      set({ inspectors, inspectorsLoading: false })
    } catch (error) {
      console.error("Failed to fetch inspectors:", error)
      set({ inspectors: [], inspectorsLoading: false })
    }
  },

  searchInspectors: async (searchTerm: string) => {
    try {
      return await inspectionApi.searchInspectors(searchTerm)
    } catch (error) {
      console.error("Failed to search inspectors:", error)
      return []
    }
  },
}))
