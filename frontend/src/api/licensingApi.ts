import dayjs from 'dayjs'
import { apiRequest } from '@/utils/api'
import type {
  License,
  BackendLicense,
  PaginatedLicensesResponse,
  LicensePaginationMeta,
  UpdateLicensePayload,
  LicenseAction,
  LicenseApplication,
  BackendLicenseApplication,
  CreateLicenseAppealPayload,
  FacilityOption,
} from '@/types/license'

export function transformLicense(backendLicense: BackendLicense): License {
  return {
    id: backendLicense.license_number,
    licenseNumber: backendLicense.license_number,
    registrationNumber: backendLicense.registration_number,
    category: backendLicense.category,
    owner: backendLicense.owner,
    facilityName: backendLicense.facility_name,
    facilityCode: backendLicense.facility_code,
    facilityType: backendLicense.facility_type,
    licenseType: backendLicense.license_type,
    dateOfIssuance: formatDateForFrontend(backendLicense.date_of_issuance),
    dateOfExpiry: formatDateForFrontend(backendLicense.date_of_expiry),
    paymentStatus: backendLicense.payment_status,
    status: backendLicense.status,
    isArchived: backendLicense.is_archived,
  }
}

export function transformLicenseApplication(backendApp: any): LicenseApplication {
  return {
    id: backendApp.license_application_id,
    licenseApplicationId: backendApp.license_application_id,
    facilityName: backendApp.facility_name,
    facilityCode: backendApp.facility_code,
    registrationNumber: backendApp.registration_number,
    facilityCategory: backendApp.facility_category,
    owner: backendApp.owner,
    facilityType: backendApp.facility_type,
    licenseTypeName: backendApp.license_type_name,
    applicationStatus: backendApp.status || backendApp.application_status,
    applicationType: backendApp.application_type,
    applicationDate: formatDateForFrontend(backendApp.application_date),
    regulatoryBody: backendApp.regulatory_body,
    licenseFee: backendApp.license_fee || 0,
    remarks: backendApp.remarks,
    complianceDocuments: backendApp.compliance_documents,
  }
}

export function formatDateForBackend(frontendDate: string): string {
  return dayjs(frontendDate, 'DD/MM/YYYY').format('YYYY-MM-DD')
}

export function formatDateForFrontend(backendDate: string): string {
  if (!backendDate) return ''
  return dayjs(backendDate, 'YYYY-MM-DD').format('DD/MM/YYYY')
}

export interface LicenseFilters {
  search?: string
  facilityCode?: string
  facilityName?: string
  registrationNumber?: string
  status?: string // comma-separated list
  isArchived?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page_size?: number // Number of items per page
}

export async function listLicenses(
  page: number = 1,
  pageSize: number = 20,
  filters?: LicenseFilters
): Promise<PaginatedLicensesResponse> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    debug_mode: '1',
  })

  if (filters?.facilityCode) params.append('facility_code', filters.facilityCode)
  if (filters?.facilityName) params.append('facility_name', filters.facilityName)
  if (filters?.registrationNumber) params.append('registration_number', filters.registrationNumber)
  if (filters?.status) params.append('status', filters.status)
  if (filters?.isArchived !== undefined) params.append('is_archived', filters.isArchived ? '1' : '0')

  // Send search to backend (searches across license_number, registration_number, owner, facility_name in backend)
  if (filters?.search) {
    params.append('search', filters.search)
  }

  const response = await apiRequest<any>(
    `/api/method/compliance_360.api.license_management.facility_license.get_health_facility_licenses?${params.toString()}`
  )

  const licenses = response.data || response.message || []
  const pagination = response.pagination || {}

  const transformedData = licenses.map(transformLicense)

  // Client-side sorting
  if (filters?.sortBy && filters?.sortOrder) {
    transformedData.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (filters.sortBy) {
        case 'license_number':
          aVal = a.licenseNumber
          bVal = b.licenseNumber
          break
        case 'expiry_date':
          aVal = dayjs(a.dateOfExpiry, 'DD/MM/YYYY').valueOf()
          bVal = dayjs(b.dateOfExpiry, 'DD/MM/YYYY').valueOf()
          break
        case 'status':
          aVal = a.status
          bVal = b.status
          break
        default:
          return 0
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return filters.sortOrder === 'asc' ? comparison : -comparison
    })
  }

  const totalCount = pagination.count || transformedData.length
  const totalPages = Math.ceil(totalCount / pageSize)

  const paginationMeta: LicensePaginationMeta = {
    page: pagination.current_page || page,
    page_size: pagination.page_size || pageSize,
    total_count: totalCount,
    total_pages: totalPages,
    has_next: (pagination.current_page || page) < totalPages,
    has_prev: (pagination.current_page || page) > 1,
  }

  return {
    data: transformedData,
    pagination: paginationMeta,
  }
}

export async function getLicense(licenseNumber: string): Promise<License> {
  const response = await listLicenses(1, 1000, { search: licenseNumber })
  const license = response.data.find((l) => l.licenseNumber === licenseNumber)

  if (!license) {
    throw new Error(`License ${licenseNumber} not found`)
  }

  return license
}

export async function updateLicense(
  licenseNumber: string,
  action: LicenseAction
): Promise<License> {
  const payload: UpdateLicensePayload = {
    license_number: licenseNumber,
    action,
    debug_mode: 1,
  }

  const response = await apiRequest<any>(
    `/api/method/compliance_360.api.license_management.facility_license.update_facility_license`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    }
  )

  if (!response.data && !response.message) {
    throw new Error('Failed to update license')
  }

  // Fetch updated license
  return getLicense(licenseNumber)
}

export async function listLicenseApplications(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    search?: string
    applicationType?: 'New' | 'Renewal'
    applicationStatus?: string
    regulatoryBody?: string
  }
): Promise<{ data: LicenseApplication[]; pagination: LicensePaginationMeta }> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    minimize: '0',
    debug_mode: '1',
  })

  if (filters?.applicationType) params.append('application_type', filters.applicationType)
  if (filters?.applicationStatus) params.append('application_status', filters.applicationStatus)
  if (filters?.regulatoryBody) params.append('regulatory_body', filters.regulatoryBody)

  const response = await apiRequest<any>(
    `/api/method/compliance_360.api.license_management.applications.fetch_facility_license_applications?${params.toString()}`
  )

  const applications = response.data || response.message || []
  const pagination = response.pagination || {}

  let transformedData = applications.map(transformLicenseApplication)

  // Client-side search
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    transformedData = transformedData.filter(
      (app) =>
        app.facilityName.toLowerCase().includes(searchLower) ||
        app.licenseApplicationId.toLowerCase().includes(searchLower) ||
        app.registrationNumber.toLowerCase().includes(searchLower)
    )
  }

  const totalCount = pagination.count || transformedData.length
  const totalPages = Math.ceil(totalCount / pageSize)

  const paginationMeta: LicensePaginationMeta = {
    page: pagination.current_page || page,
    page_size: pagination.page_size || pageSize,
    total_count: totalCount,
    total_pages: totalPages,
    has_next: (pagination.current_page || page) < totalPages,
    has_prev: (pagination.current_page || page) > 1,
  }

  return {
    data: transformedData,
    pagination: paginationMeta,
  }
}

export async function createLicenseAppeal(
  payload: CreateLicenseAppealPayload
): Promise<any> {
  const response = await apiRequest<any>(
    `/api/method/compliance_360.api.license_management.facility_license_appeal_request.create_license_appeal_request`,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    }
  )

  return response
}

export async function listFacilities(): Promise<FacilityOption[]> {
  const response = await apiRequest<{ data: FacilityOption[] }>(
    `/api/resource/Facility Record?fields=["name","facility_name","registration_number","facility_code"]&limit_page_length=1000`
  )
  return response.data || []
}

export interface LicenseDashboardStats {
  metrics: {
    expiring_soon: number
    active: number
    suspended_denied: number
    pending_renewals: number
    total: number
  }
  expiring_licenses: Array<{
    license_number: string
    date_of_expiry: string
    facility_type: string
    owner: string
    status: string
  }>
  status_distribution: Array<{
    status: string
    count: number
    color: string
  }>
}

export async function getLicenseDashboardStats(): Promise<LicenseDashboardStats> {
  const response = await apiRequest<{ message: LicenseDashboardStats }>(
    `/api/method/compliance_360.api.license_management.facility_license.get_license_dashboard_stats`
  )
  return response.message
}
