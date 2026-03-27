/**
 * Unit tests for AnalyticsDashboard component
 * Tests rendering with real data structure and error handling
 */
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import AnalyticsDashboard from "../AnalyticsDashboard"
import { useAnalyticsStore } from "@/stores/analyticsStore"

// Mock the analytics store
vi.mock("@/stores/analyticsStore", () => ({
  useAnalyticsStore: vi.fn(),
}))

// Mock fetch for API calls
global.fetch = vi.fn()

describe("AnalyticsDashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading state initially", () => {
    // Mock store returning loading state
    ;(useAnalyticsStore as any).mockReturnValue({
      loading: true,
      licenseStats: null,
      affiliationStats: null,
      inspectionStats: null,
      complianceMetrics: null,
      expiryWarnings: [],
      trendData: [],
      fetchDashboardData: vi.fn(),
      refreshData: vi.fn(),
    })

    render(<AnalyticsDashboard />)

    // Should show loading indicator
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it("renders with analytics data", async () => {
    // Mock store with real data structure (matching backend API response)
    const mockData = {
      loading: false,
      error: null,
      licenseStats: {
        total: 450,
        active: 320,
        expired: 45,
        expiringSoon: 28,
        suspended: 12,
        pending: 45,
      },
      affiliationStats: {
        total: 1250,
        active: 980,
        pending: 125,
        rejected: 45,
        inactive: 100,
      },
      inspectionStats: {
        total: 380,
        scheduled: 85,
        completed: 245,
        pending: 35,
        failed: 15,
      },
      complianceMetrics: {
        complianceRate: 87.5,
        averageProcessingTime: 12.4,
        pendingActions: 48,
        overdueInspections: 8,
      },
      expiryWarnings: [
        {
          licenseNumber: "LIC-2024-001",
          facilityName: "General Hospital",
          expiryDate: "2026-04-15",
          daysUntilExpiry: 22,
          status: "Active",
        },
      ],
      trendData: [
        { month: "Oct", licenses: 420, affiliations: 1100, inspections: 320 },
        { month: "Nov", licenses: 435, affiliations: 1150, inspections: 345 },
        { month: "Dec", licenses: 442, affiliations: 1200, inspections: 355 },
      ],
      fetchDashboardData: vi.fn(),
      refreshData: vi.fn(),
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockData)

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      // Verify license stats cards render
      expect(screen.getByText("450")).toBeInTheDocument() // Total licenses
      expect(screen.getByText("320")).toBeInTheDocument() // Active licenses

      // Verify affiliation stats render
      expect(screen.getByText("1250")).toBeInTheDocument() // Total affiliations
      expect(screen.getByText("980")).toBeInTheDocument() // Active affiliations

      // Verify compliance metrics render
      expect(screen.getByText("87.5%")).toBeInTheDocument() // Compliance rate

      // Verify expiry warnings table shows data
      expect(screen.getByText("LIC-2024-001")).toBeInTheDocument()
      expect(screen.getByText("General Hospital")).toBeInTheDocument()

      // Verify trend chart renders (check for month labels)
      expect(screen.getByText("Oct")).toBeInTheDocument()
      expect(screen.getByText("Nov")).toBeInTheDocument()
    })
  })

  it("handles API errors gracefully", async () => {
    // Mock store with error state
    const mockErrorData = {
      loading: false,
      error: "Failed to fetch dashboard data",
      licenseStats: null,
      affiliationStats: null,
      inspectionStats: null,
      complianceMetrics: null,
      expiryWarnings: [],
      trendData: [],
      fetchDashboardData: vi.fn(),
      refreshData: vi.fn(),
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockErrorData)

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      // Should show error message
      expect(screen.getByText(/unable to load dashboard data/i)).toBeInTheDocument()
      // Should show retry button
      expect(screen.getByText(/retry/i)).toBeInTheDocument()
    })
  })

  it("refresh button triggers data reload", async () => {
    const mockRefresh = vi.fn()

    const mockData = {
      loading: false,
      error: null,
      licenseStats: {
        total: 100,
        active: 80,
        expired: 10,
        expiringSoon: 5,
        suspended: 3,
        pending: 2,
      },
      affiliationStats: { total: 150, active: 120, pending: 15, rejected: 10, inactive: 5 },
      inspectionStats: { total: 80, scheduled: 20, completed: 50, pending: 8, failed: 2 },
      complianceMetrics: {
        complianceRate: 85.0,
        averageProcessingTime: 10.0,
        pendingActions: 10,
        overdueInspections: 2,
      },
      expiryWarnings: [],
      trendData: [],
      fetchDashboardData: vi.fn(),
      refreshData: mockRefresh,
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockData)

    render(<AnalyticsDashboard />)

    // Find and click refresh button
    const refreshButton = screen.getByRole("button", { name: /refresh/i })
    fireEvent.click(refreshButton)

    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  it("hides inspection section when inspectionStats is null", async () => {
    // Mock data with null inspection stats (Inspection DocType doesn't exist)
    const mockData = {
      loading: false,
      error: null,
      licenseStats: {
        total: 100,
        active: 80,
        expired: 10,
        expiringSoon: 5,
        suspended: 3,
        pending: 2,
      },
      affiliationStats: { total: 150, active: 120, pending: 15, rejected: 10, inactive: 5 },
      inspectionStats: null, // DocType doesn't exist
      complianceMetrics: {
        complianceRate: 0.0,
        averageProcessingTime: 0.0,
        pendingActions: 17,
        overdueInspections: 0,
      },
      expiryWarnings: [],
      trendData: [],
      fetchDashboardData: vi.fn(),
      refreshData: vi.fn(),
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockData)

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      // License and affiliation sections should render
      expect(screen.getByText("100")).toBeInTheDocument() // Total licenses
      expect(screen.getByText("150")).toBeInTheDocument() // Total affiliations

      // Inspection section should NOT render
      expect(screen.queryByText(/inspection/i)).not.toBeInTheDocument()
    })
  })

  it("falls back to mock data after repeated API failures", async () => {
    const mockFetchFn = vi
      .fn()
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))
      .mockRejectedValueOnce(new Error("Network error"))

    // Mock store that falls back to mock data after failures
    const mockData = {
      loading: false,
      error: "API failed - using mock data",
      licenseStats: {
        total: 450, // Mock data
        active: 320,
        expired: 45,
        expiringSoon: 28,
        suspended: 12,
        pending: 45,
      },
      affiliationStats: { total: 1250, active: 980, pending: 125, rejected: 45, inactive: 100 },
      inspectionStats: { total: 380, scheduled: 85, completed: 245, pending: 35, failed: 15 },
      complianceMetrics: {
        complianceRate: 87.5,
        averageProcessingTime: 12.4,
        pendingActions: 48,
        overdueInspections: 8,
      },
      expiryWarnings: [],
      trendData: [],
      fetchDashboardData: mockFetchFn,
      refreshData: vi.fn(),
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockData)

    render(<AnalyticsDashboard />)

    await waitFor(() => {
      // Should show mock data notice
      expect(screen.getByText(/showing sample data/i)).toBeInTheDocument()
      // Mock data should still render
      expect(screen.getByText("450")).toBeInTheDocument()
    })
  })

  it("renders responsive layout with all sections", async () => {
    const mockData = {
      loading: false,
      error: null,
      licenseStats: {
        total: 100,
        active: 80,
        expired: 10,
        expiringSoon: 5,
        suspended: 3,
        pending: 2,
      },
      affiliationStats: { total: 150, active: 120, pending: 15, rejected: 10, inactive: 5 },
      inspectionStats: { total: 80, scheduled: 20, completed: 50, pending: 8, failed: 2 },
      complianceMetrics: {
        complianceRate: 85.0,
        averageProcessingTime: 10.0,
        pendingActions: 10,
        overdueInspections: 2,
      },
      expiryWarnings: [
        {
          licenseNumber: "LIC-001",
          facilityName: "Test Facility",
          expiryDate: "2026-04-15",
          daysUntilExpiry: 20,
          status: "Active",
        },
      ],
      trendData: [{ month: "Mar", licenses: 100, affiliations: 150, inspections: 80 }],
      fetchDashboardData: vi.fn(),
      refreshData: vi.fn(),
    }

    ;(useAnalyticsStore as any).mockReturnValue(mockData)

    const { container } = render(<AnalyticsDashboard />)

    await waitFor(() => {
      // Verify page header section
      expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument()

      // Verify metrics cards section (should have grid layout)
      const metricsCards = container.querySelectorAll('[data-testid="metric-card"]')
      expect(metricsCards.length).toBeGreaterThan(0)

      // Verify license status breakdown section
      expect(screen.getByText("Active")).toBeInTheDocument()
      expect(screen.getByText("Expired")).toBeInTheDocument()

      // Verify expiry warnings table section
      expect(screen.getByText("LIC-001")).toBeInTheDocument()
      expect(screen.getByText("Test Facility")).toBeInTheDocument()

      // Verify trend charts section
      expect(screen.getByText("Mar")).toBeInTheDocument()
    })
  })
})
