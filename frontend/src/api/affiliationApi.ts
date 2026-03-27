import dayjs from "dayjs"
import { apiRequest } from "@/utils/api"
import type {
  Affiliation,
  BackendAffiliation,
  BackendAffiliationsResponse,
  PaginatedAffiliationsResponse,
  AffiliationPaginationMeta,
  CreateAffiliationPayload,
  UpdateAffiliationPayload,
  AffiliationAction,
} from "@/types/affiliation"

export function transformAffiliation(backendAffiliation: BackendAffiliation): Affiliation {
  return {
    id: backendAffiliation.id,
    affiliationId: backendAffiliation.id,
    role: backendAffiliation.role,
    startDate: formatDateForFrontend(backendAffiliation.start_date),
    endDate: backendAffiliation.end_date
      ? formatDateForFrontend(backendAffiliation.end_date)
      : undefined,
    affiliationStatus: backendAffiliation.affiliation_status,
    employmentType: backendAffiliation.employment_type,
    healthProfessional: {
      id: backendAffiliation.health_professional.id,
      registrationNumber: backendAffiliation.health_professional.registration_number,
      firstName: backendAffiliation.health_professional.first_name,
      lastName: backendAffiliation.health_professional.last_name,
      fullName: `${backendAffiliation.health_professional.first_name} ${backendAffiliation.health_professional.last_name}`,
      typeOfPractice: backendAffiliation.health_professional.type_of_practice,
      specialty: backendAffiliation.health_professional.specialty,
      professionalCadre: backendAffiliation.health_professional.professional_cadre,
    },
    healthFacility: {
      id: backendAffiliation.health_facility.id,
      registrationNumber: backendAffiliation.health_facility.registration_number,
      facilityName: backendAffiliation.health_facility.facility_name,
      facilityCode: backendAffiliation.health_facility.facility_code,
      kephLevel: backendAffiliation.health_facility.keph_level,
      facilityType: backendAffiliation.health_facility.facility_type,
    },
  }
}

export function formatDateForBackend(frontendDate: string): string {
  return dayjs(frontendDate, "DD/MM/YYYY").format("YYYY-MM-DD")
}

export function formatDateForFrontend(backendDate: string): string {
  return dayjs(backendDate, "YYYY-MM-DD").format("DD/MM/YYYY")
}

export interface AffiliationFilters {
  search?: string
  registrationNumber?: string
  licenseNumber?: string
  identificationNumber?: string
  typeOfPractice?: string
  speciality?: string
  healthFacility?: string
  status?: string // comma-separated list
  sortBy?: string
  sortOrder?: "asc" | "desc"
  page_size?: number // Number of items per page
}

export async function listAffiliations(
  page: number = 1,
  pageSize: number = 20,
  filters?: AffiliationFilters
): Promise<PaginatedAffiliationsResponse> {
  // Build query params
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
    debug_mode: "1", // Use debug mode for now to avoid encryption complexity
  })

  if (filters?.registrationNumber) params.append("registration_number", filters.registrationNumber)
  if (filters?.licenseNumber) params.append("license_number", filters.licenseNumber)
  if (filters?.identificationNumber)
    params.append("identification_number", filters.identificationNumber)
  if (filters?.typeOfPractice) params.append("type_of_practice", filters.typeOfPractice)
  if (filters?.speciality) params.append("speciality", filters.speciality)
  if (filters?.healthFacility) params.append("health_facility", filters.healthFacility)

  // Fetch affiliations
  // The API sets frappe.local.response directly (no `message` wrapper),
  // so the HTTP response is { status, data: { affiliations, pagination } }
  const response = await apiRequest<{ status: string; data?: BackendAffiliationsResponse | any[] }>(
    `/api/method/compliance_360.api.license_management.fetch_hw_affiliations.fetch_professional_affiliations?${params.toString()}`
  )

  const rawData = response.data
  const backendData: BackendAffiliationsResponse =
    Array.isArray(rawData) || !rawData
      ? {
          affiliations: [],
          pagination: { current_page: 1, page_size: pageSize, start: 0, end: 0, count: 0 },
        }
      : (rawData as BackendAffiliationsResponse)
  const transformedData = (backendData.affiliations || []).map(transformAffiliation)

  // Apply client-side filtering for status and search
  let filteredData = transformedData
  if (filters?.status) {
    const statusList = filters.status.split(",").map((s) => s.trim())
    filteredData = filteredData.filter((a) => statusList.includes(a.affiliationStatus))
  }
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredData = filteredData.filter(
      (a) =>
        a.healthProfessional.fullName.toLowerCase().includes(searchLower) ||
        a.healthFacility.facilityName.toLowerCase().includes(searchLower) ||
        a.healthProfessional.registrationNumber.toLowerCase().includes(searchLower) ||
        a.role.toLowerCase().includes(searchLower)
    )
  }

  // Apply client-side sorting
  if (filters?.sortBy && filters?.sortOrder) {
    filteredData.sort((a, b) => {
      let aVal: any
      let bVal: any

      switch (filters.sortBy) {
        case "professional_name":
          aVal = a.healthProfessional.fullName
          bVal = b.healthProfessional.fullName
          break
        case "facility_name":
          aVal = a.healthFacility.facilityName
          bVal = b.healthFacility.facilityName
          break
        case "start_date":
          aVal = dayjs(a.startDate, "DD/MM/YYYY").valueOf()
          bVal = dayjs(b.startDate, "DD/MM/YYYY").valueOf()
          break
        case "status":
          aVal = a.affiliationStatus
          bVal = b.affiliationStatus
          break
        default:
          return 0
      }

      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      return filters.sortOrder === "asc" ? comparison : -comparison
    })
  }

  // Transform pagination
  const totalCount = backendData.pagination.count
  const totalPages = Math.ceil(totalCount / pageSize)

  const paginationMeta: AffiliationPaginationMeta = {
    page: backendData.pagination.current_page,
    page_size: backendData.pagination.page_size,
    total_count: totalCount,
    total_pages: totalPages,
    has_next: backendData.pagination.current_page < totalPages,
    has_prev: backendData.pagination.current_page > 1,
  }

  return {
    data: filteredData,
    pagination: paginationMeta,
  }
}

export async function getAffiliation(id: string): Promise<Affiliation> {
  // Since there's no dedicated get single affiliation endpoint,
  // we'll fetch the list and filter by ID
  const response = await listAffiliations(1, 1000, {})
  const affiliation = response.data.find((a) => a.id === id)

  if (!affiliation) {
    throw new Error(`Affiliation with ID ${id} not found`)
  }

  return affiliation
}

export async function approveAffiliation(id: string, reason?: string): Promise<void> {
  // The API doesn't have a dedicated approve endpoint yet
  // This would need to be implemented on the backend
  // For now, we'll throw an error indicating it's not yet implemented
  throw new Error("Approve affiliation endpoint not yet implemented in backend API")
}

export async function rejectAffiliation(id: string, reason?: string): Promise<void> {
  // The API doesn't have a dedicated reject endpoint yet
  // This would need to be implemented on the backend
  // For now, we'll throw an error indicating it's not yet implemented
  throw new Error("Reject affiliation endpoint not yet implemented in backend API")
}

export async function createAffiliation(payload: CreateAffiliationPayload): Promise<Affiliation> {
  const response = await apiRequest<{ status: string; results: any }>(
    `/api/method/compliance_360.api.license_management.create_affiliations.save_affiliations`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  )

  if (response.status !== "ok") {
    throw new Error("Failed to create affiliation")
  }

  // Get the created affiliation ID from the response
  const affiliationAction = response.results.actions.find(
    (action: any) => action.doctype === "Professional Affiliation"
  )

  if (!affiliationAction) {
    throw new Error("Affiliation was not created")
  }

  // Fetch the created affiliation
  return getAffiliation(affiliationAction.name)
}

export async function updateAffiliation(
  id: string,
  payload: UpdateAffiliationPayload
): Promise<Affiliation> {
  // The API uses the same save_affiliations endpoint for updates
  // We need to fetch the existing affiliation first, then update it
  throw new Error("Update affiliation endpoint not yet fully implemented")
}

export interface AffiliationDashboardStats {
  metrics: {
    pending: number
    active: number
    rejected: number
    confirmed: number
    inactive: number
    total: number
    unique_professionals: number
    unique_facilities: number
  }
  pending_affiliations: Array<{
    id: string
    start_date: string
    affiliation_status: string
    professional_registration_number: string
    professional_full_name: string
    facility_name: string
    facility_registration_number: string
  }>
  status_distribution: Array<{
    status: string
    count: number
    color: string
  }>
  trend_data: Array<{
    label: string
    full_label: string
    new: number
    active: number
    value: number
  }>
  employment_type_distribution: Array<{
    type: string
    count: number
    color: string
  }>
  role_distribution: Array<{
    role: string
    count: number
  }>
  facility_staffing: Array<{
    facility_id: string
    facility_name: string
    total: number
    active: number
  }>
  multi_affiliated_professionals: Array<{
    registration_number: string
    full_name: string
    professional_cadre: string | null
    affiliation_count: number
  }>
}

export async function getAffiliationDashboardStats(): Promise<AffiliationDashboardStats> {
  const response = await apiRequest<{ message: AffiliationDashboardStats }>(
    `/api/method/compliance_360.api.license_management.fetch_hw_affiliations.get_affiliation_dashboard_stats`
  )
  return response.message
}
