import apiClient from "./client"
import type {
  LicenseStatistics,
  ExpiryWarning,
  AffiliationStatistics,
  InspectionStatistics,
  ComplianceMetrics,
  TrendData,
} from "@/stores/analyticsStore"

const API_BASE = "/api/method/compliance_360.api.analytics"

export interface AnalyticsDashboardResponse {
  license_stats: {
    total: number
    active: number
    expired: number
    expiring_soon: number
    suspended: number
    pending: number
  }
  expiry_warnings: Array<{
    license_number: string
    facility_name: string
    expiry_date: string
    days_until_expiry: number
    status: string
  }>
  affiliation_stats: {
    total: number
    active: number
    pending: number
    rejected: number
    inactive: number
  }
  inspection_stats: {
    total: number
    scheduled: number
    completed: number
    pending: number
    failed: number
  }
  compliance_metrics: {
    compliance_rate: number
    average_processing_time: number
    pending_actions: number
    overdue_inspections: number
  }
  trend_data: Array<{
    month: string
    licenses: number
    affiliations: number
    inspections: number
  }>
}

/**
 * Transform backend response to frontend format
 */
function transformAnalyticsResponse(data: AnalyticsDashboardResponse) {
  return {
    licenseStats: {
      total: data.license_stats.total,
      active: data.license_stats.active,
      expired: data.license_stats.expired,
      expiringSoon: data.license_stats.expiring_soon,
      suspended: data.license_stats.suspended,
      pending: data.license_stats.pending,
    } as LicenseStatistics,
    expiryWarnings: data.expiry_warnings.map((w) => ({
      licenseNumber: w.license_number,
      facilityName: w.facility_name,
      expiryDate: w.expiry_date,
      daysUntilExpiry: w.days_until_expiry,
      status: w.status,
    })) as ExpiryWarning[],
    affiliationStats: {
      total: data.affiliation_stats.total,
      active: data.affiliation_stats.active,
      pending: data.affiliation_stats.pending,
      rejected: data.affiliation_stats.rejected,
      inactive: data.affiliation_stats.inactive,
    } as AffiliationStatistics,
    inspectionStats: {
      total: data.inspection_stats.total,
      scheduled: data.inspection_stats.scheduled,
      completed: data.inspection_stats.completed,
      pending: data.inspection_stats.pending,
      failed: data.inspection_stats.failed,
    } as InspectionStatistics,
    complianceMetrics: {
      complianceRate: data.compliance_metrics.compliance_rate,
      averageProcessingTime: data.compliance_metrics.average_processing_time,
      pendingActions: data.compliance_metrics.pending_actions,
      overdueInspections: data.compliance_metrics.overdue_inspections,
    } as ComplianceMetrics,
    trendData: data.trend_data as TrendData[],
  }
}

/**
 * Fetch analytics dashboard data
 */
export async function fetchAnalyticsDashboard(dateRange?: { start: string; end: string }) {
  const response = await apiClient.get<{ message: AnalyticsDashboardResponse }>(
    `${API_BASE}.get_dashboard_data`,
    {
      params: {
        start_date: dateRange?.start,
        end_date: dateRange?.end,
      },
      cache: true,
      cacheTime: 2 * 60 * 1000, // Cache for 2 minutes
    }
  )

  return transformAnalyticsResponse(response.message)
}

/**
 * Fetch license statistics only
 */
export async function fetchLicenseStatistics(): Promise<LicenseStatistics> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_license_stats`, {
    cache: true,
    cacheTime: 5 * 60 * 1000,
  })

  const data = response.message
  return {
    total: data.total,
    active: data.active,
    expired: data.expired,
    expiringSoon: data.expiring_soon,
    suspended: data.suspended,
    pending: data.pending,
  }
}

/**
 * Fetch expiry warnings
 */
export async function fetchExpiryWarnings(daysThreshold: number = 30): Promise<ExpiryWarning[]> {
  const response = await apiClient.get<{ message: any[] }>(`${API_BASE}.get_expiry_warnings`, {
    params: { days_threshold: daysThreshold },
    cache: true,
    cacheTime: 5 * 60 * 1000,
  })

  return response.message.map((w: any) => ({
    licenseNumber: w.license_number,
    facilityName: w.facility_name,
    expiryDate: w.expiry_date,
    daysUntilExpiry: w.days_until_expiry,
    status: w.status,
  }))
}

/**
 * Fetch compliance metrics
 */
export async function fetchComplianceMetrics(): Promise<ComplianceMetrics> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_compliance_metrics`, {
    cache: true,
    cacheTime: 5 * 60 * 1000,
  })

  const data = response.message
  return {
    complianceRate: data.compliance_rate,
    averageProcessingTime: data.average_processing_time,
    pendingActions: data.pending_actions,
    overdueInspections: data.overdue_inspections,
  }
}

/**
 * Fetch trend data for charts
 */
export async function fetchTrendData(months: number = 6): Promise<TrendData[]> {
  const response = await apiClient.get<{ message: any[] }>(`${API_BASE}.get_trend_data`, {
    params: { months },
    cache: true,
    cacheTime: 10 * 60 * 1000, // Cache for 10 minutes
  })

  return response.message as TrendData[]
}
