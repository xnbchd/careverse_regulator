export interface Affiliation {
  id: string
  affiliationId: string
  role: string
  startDate: string
  endDate?: string
  affiliationStatus: "Active" | "Inactive" | "Pending" | "Rejected"
  employmentType: string
  healthProfessional: {
    id: string
    registrationNumber: string
    firstName: string
    lastName: string
    fullName: string
    typeOfPractice?: string
    specialty?: string
    professionalCadre?: string
  }
  healthFacility: {
    id: string
    registrationNumber: string
    facilityName: string
    facilityCode?: string
    kephLevel?: string
    facilityType?: string
  }
}

export interface BackendAffiliation {
  id: string
  role: string
  start_date: string
  end_date?: string
  affiliation_status: "Active" | "Inactive" | "Pending" | "Rejected"
  employment_type: string
  health_professional: {
    id: string
    registration_number: string
    first_name: string
    last_name: string
    type_of_practice?: string
    specialty?: string
    professional_cadre?: string
  }
  health_facility: {
    id: string
    registration_number: string
    facility_name: string
    facility_code?: string
    keph_level?: string
    facility_type?: string
  }
}

export interface BackendAffiliationsResponse {
  affiliations: BackendAffiliation[]
  pagination: {
    current_page: number
    page_size: number
    start: number
    end: number
    count: number
  }
}

export interface AffiliationPaginationMeta {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedAffiliationsResponse {
  data: Affiliation[]
  pagination: AffiliationPaginationMeta
}

export interface CreateAffiliationPayload {
  affiliation: {
    role: string
    start_date: string
    end_date?: string
    affiliation_status?: "Active" | "Inactive" | "Pending"
    employment_type: string
    professional: {
      registration_number: string
      first_name: string
      last_name: string
    }
    facility: {
      registration_number: string
      facility_name: string
    }
  }
}

export interface UpdateAffiliationPayload {
  role?: string
  start_date?: string
  end_date?: string
  affiliation_status?: "Active" | "Inactive" | "Pending" | "Rejected"
  employment_type?: string
}

export interface AffiliationAction {
  action: "approve" | "reject"
  reason?: string
}
