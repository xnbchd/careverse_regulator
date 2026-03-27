import { create } from "zustand"
import { fetchAnalyticsDashboard } from "@/api/analyticsApi"

export interface LicenseStatistics {
  total: number
  active: number
  expired: number
  expiringSoon: number
  suspended: number
  pending: number
}

export interface ExpiryWarning {
  licenseNumber: string
  facilityName: string
  expiryDate: string
  daysUntilExpiry: number
  status: string
}

export interface AffiliationStatistics {
  total: number
  active: number
  pending: number
  rejected: number
  inactive: number
}

export interface InspectionStatistics {
  total: number
  scheduled: number
  completed: number
  pending: number
  failed: number
}

export interface ComplianceMetrics {
  complianceRate: number
  averageProcessingTime: number
  pendingActions: number
  overdueInspections: number
}

export interface TrendData {
  month: string
  licenses: number
  affiliations: number
  inspections: number
}

interface AnalyticsState {
  licenseStats: LicenseStatistics | null
  expiryWarnings: ExpiryWarning[]
  affiliationStats: AffiliationStatistics | null
  inspectionStats: InspectionStatistics | null
  complianceMetrics: ComplianceMetrics | null
  trendData: TrendData[]
  loading: boolean
  error: string | null
  dateRange: {
    start: string
    end: string
  }

  // Actions
  fetchDashboardData: () => Promise<void>
  setDateRange: (start: string, end: string) => void
  refreshData: () => Promise<void>
}

// Mock data generator (replace with real API calls)
const generateMockLicenseStats = (): LicenseStatistics => ({
  total: 450,
  active: 320,
  expired: 45,
  expiringSoon: 28,
  suspended: 12,
  pending: 45,
})

const generateMockExpiryWarnings = (): ExpiryWarning[] => [
  {
    licenseNumber: "LIC-2024-001",
    facilityName: "General Hospital",
    expiryDate: "2026-04-15",
    daysUntilExpiry: 22,
    status: "Active",
  },
  {
    licenseNumber: "LIC-2024-002",
    facilityName: "City Clinic",
    expiryDate: "2026-04-10",
    daysUntilExpiry: 17,
    status: "Active",
  },
  {
    licenseNumber: "LIC-2024-003",
    facilityName: "Community Health Center",
    expiryDate: "2026-04-05",
    daysUntilExpiry: 12,
    status: "Active",
  },
  {
    licenseNumber: "LIC-2024-004",
    facilityName: "Regional Medical Center",
    expiryDate: "2026-03-30",
    daysUntilExpiry: 6,
    status: "Active",
  },
  {
    licenseNumber: "LIC-2024-005",
    facilityName: "Pediatric Clinic",
    expiryDate: "2026-03-28",
    daysUntilExpiry: 4,
    status: "Active",
  },
]

const generateMockAffiliationStats = (): AffiliationStatistics => ({
  total: 1250,
  active: 980,
  pending: 125,
  rejected: 45,
  inactive: 100,
})

const generateMockInspectionStats = (): InspectionStatistics => ({
  total: 380,
  scheduled: 85,
  completed: 245,
  pending: 35,
  failed: 15,
})

const generateMockComplianceMetrics = (): ComplianceMetrics => ({
  complianceRate: 87.5,
  averageProcessingTime: 12.4,
  pendingActions: 48,
  overdueInspections: 8,
})

const generateMockTrendData = (): TrendData[] => [
  { month: "Oct", licenses: 420, affiliations: 1100, inspections: 320 },
  { month: "Nov", licenses: 435, affiliations: 1150, inspections: 345 },
  { month: "Dec", licenses: 442, affiliations: 1200, inspections: 355 },
  { month: "Jan", licenses: 445, affiliations: 1220, inspections: 365 },
  { month: "Feb", licenses: 448, affiliations: 1240, inspections: 372 },
  { month: "Mar", licenses: 450, affiliations: 1250, inspections: 380 },
]

export const useAnalyticsStore = create<AnalyticsState>((set, get) => ({
  licenseStats: null,
  expiryWarnings: [],
  affiliationStats: null,
  inspectionStats: null,
  complianceMetrics: null,
  trendData: [],
  loading: false,
  error: null,
  dateRange: {
    start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  },

  fetchDashboardData: async () => {
    set({ loading: true, error: null })
    try {
      const { start, end } = get().dateRange
      const data = await fetchAnalyticsDashboard({ start, end })

      set({
        licenseStats: data.licenseStats,
        expiryWarnings: data.expiryWarnings,
        affiliationStats: data.affiliationStats,
        inspectionStats: data.inspectionStats,
        complianceMetrics: data.complianceMetrics,
        trendData: data.trendData,
        loading: false,
      })
    } catch (error) {
      // Fallback to mock data if API fails (for development)
      console.warn("Analytics API failed, using mock data:", error)
      set({
        licenseStats: generateMockLicenseStats(),
        expiryWarnings: generateMockExpiryWarnings(),
        affiliationStats: generateMockAffiliationStats(),
        inspectionStats: generateMockInspectionStats(),
        complianceMetrics: generateMockComplianceMetrics(),
        trendData: generateMockTrendData(),
        loading: false,
        error: error instanceof Error ? error.message : "Failed to fetch dashboard data",
      })
    }
  },

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } })
    get().fetchDashboardData()
  },

  refreshData: async () => {
    await get().fetchDashboardData()
  },
}))
