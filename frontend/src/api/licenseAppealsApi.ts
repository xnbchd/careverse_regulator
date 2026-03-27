import { apiRequest } from "@/utils/api"

export interface LicenseAppeal {
  id: string
  license_number: string
  appeal_type: "facility" | "professional"
  // Facility appeal fields
  facility_name?: string
  facility_code?: string
  registration_number?: string
  appeal_reason?: string
  status?: string
  review_decision?: string
  reviewed_by?: string
  review_date?: string
  // Professional appeal fields
  professional_name?: string
  email?: string
  phone_number?: string
  category_of_practice?: string
  comments?: string
  // Common fields
  created_at: string
  modified_at: string
  license_type?: string
  date_of_issuance?: string
  expiry_date?: string
}

export interface LicenseAppealsPagination {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface LicenseAppealsResponse {
  data: LicenseAppeal[]
  pagination: LicenseAppealsPagination
}

export interface LicenseAppealsFilters {
  status?: string
  search?: string
  appeal_type?: "facility" | "professional" | null
}

export async function fetchLicenseAppeals(
  page: number = 1,
  pageSize: number = 20,
  filters?: LicenseAppealsFilters
): Promise<LicenseAppealsResponse> {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    })

    if (filters?.status) {
      params.append("status", filters.status)
    }
    if (filters?.search) {
      params.append("search", filters.search)
    }
    if (filters?.appeal_type) {
      params.append("appeal_type", filters.appeal_type)
    }

    const response = await apiRequest<any>(
      `/api/method/compliance_360.api.license_management.appeals.get_all_license_appeals?${params}`
    )

    return response.message || response
  } catch (error) {
    console.error("Failed to fetch license appeals:", error)
    throw error
  }
}
