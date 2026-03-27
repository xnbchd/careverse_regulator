import { apiRequest } from "@/utils/api"

// --- Facility Types (from compliance API) ---

export interface FacilityLicense {
  license_number: string
  category: string | null
  license_type: string | null
  date_of_issuance: string | null
  date_of_expiry: string | null
  payment_status: string | null
  status: string | null
  is_archived: boolean
}

export interface FacilityRecord {
  registration_number: string
  facility_name: string
  facility_category: string | null
  owner: string | null
  facility_type: string | null
  license_status: string | null
  is_archived: boolean
  hie_facility_id: string | null
  facility_code: string | null
  department: string | null
  keph_level: string | null
  registration_fee: string | null
  expiration_date: string | null
  regulatory_body: string | null
  facility_licenses: FacilityLicense[]
  county: string | null
  sub_county: string | null
  ward: string | null
  constituency: string | null
  telephone_number: string | null
  official_email: string | null
  physical_address: string | null
  open_late_night: boolean
  open_whole_day: boolean
  open_weekends: boolean
  open_public_holiday: boolean
  number_of_beds: number | null
  industry: string | null
}

// --- Professional Types (from compliance API) ---

export interface ProfessionalAffiliation {
  facility_name: string
  facility_type: string
  keph_level: string
  start_date: string | null
  is_full_time: boolean
}

export interface ProfessionalLicense {
  license_number: string
  license_status: string
  date_of_issuance: string | null
  expiry_date: string | null
  payment_status: string | null
  category_of_practice: string | null
  is_active: boolean
  is_archived: boolean
}

export interface ProfessionalRecord {
  full_name: string | null
  registration_number: string | null
  category_of_practice: string | null
  affiliations: ProfessionalAffiliation[]
  status: string | null
  identification_type: string | null
  identification_number: string | null
  license_number: string | null
  license_type: string | null
  email: string | null
  phone: string | null
  address: string | null
  country: string | null
  nationality: string | null
  county: string | null
  institute_of_graduation: string | null
  degree: string | null
  place_of_practice: string | null
  licenses: ProfessionalLicense[]
  active: boolean
}

// --- API Response Types ---

interface ComplianceApiResponse<T> {
  status: string
  data: T[]
  pagination: {
    current_page: number
    page_size: number
    start: number
    end: number
    count: number
  }
}

// --- Filter Interfaces ---

export interface FacilityFilters {
  search?: string
  category?: string // comma-separated
  type?: string // comma-separated
  county?: string // comma-separated
  keph_level?: string // comma-separated
  sortBy?: "facility_name" | "facility_code" | "county"
  sortOrder?: "asc" | "desc"
  page_size?: number
}

export interface ProfessionalFilters {
  search?: string
  category?: string // comma-separated for category_of_practice
  county?: string // comma-separated
  active?: "true" | "false"
  sortBy?: "full_name" | "registration_number"
  sortOrder?: "asc" | "desc"
  page_size?: number
}

// --- API Functions ---

export async function listFacilityRecords(
  page: number = 1,
  pageSize: number = 1000,
  filters?: FacilityFilters,
  signal?: AbortSignal
): Promise<{
  data: FacilityRecord[]
  pagination: ComplianceApiResponse<FacilityRecord>["pagination"]
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  // Add filter params
  if (filters?.search) params.append("search", filters.search)
  if (filters?.category) params.append("category", filters.category)
  if (filters?.type) params.append("type", filters.type)
  if (filters?.county) params.append("county", filters.county)
  if (filters?.keph_level) params.append("keph_level", filters.keph_level)
  if (filters?.sortBy) params.append("sort_by", filters.sortBy)
  if (filters?.sortOrder) params.append("sort_order", filters.sortOrder)

  const response = await apiRequest<ComplianceApiResponse<FacilityRecord>>(
    `/api/method/compliance_360.api.license_management.health_facility.get_health_facilities?${params.toString()}`,
    { signal }
  )

  return {
    data: response.data || [],
    pagination: response.pagination || {
      current_page: 1,
      page_size: pageSize,
      start: 0,
      end: 0,
      count: 0,
    },
  }
}

export async function listProfessionalRecords(
  page: number = 1,
  pageSize: number = 1000,
  filters?: ProfessionalFilters,
  signal?: AbortSignal
): Promise<{
  data: ProfessionalRecord[]
  pagination: ComplianceApiResponse<ProfessionalRecord>["pagination"]
}> {
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  // Add filter params
  if (filters?.search) params.append("search", filters.search)
  if (filters?.category) params.append("category", filters.category)
  if (filters?.county) params.append("county", filters.county)
  if (filters?.active) params.append("active", filters.active)
  if (filters?.sortBy) params.append("sort_by", filters.sortBy)
  if (filters?.sortOrder) params.append("sort_order", filters.sortOrder)

  const response = await apiRequest<ComplianceApiResponse<ProfessionalRecord>>(
    `/api/method/compliance_360.api.license_management.health_professional.get_health_professionals?${params.toString()}`,
    { signal }
  )

  return {
    data: response.data || [],
    pagination: response.pagination || {
      current_page: 1,
      page_size: pageSize,
      start: 0,
      end: 0,
      count: 0,
    },
  }
}
