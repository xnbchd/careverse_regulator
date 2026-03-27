export interface License {
  id: string
  licenseNumber: string
  registrationNumber: string
  category: string
  owner: string
  facilityType: string
  licenseType: string
  dateOfIssuance: string
  dateOfExpiry: string
  paymentStatus: string
  status: LicenseStatus
  isArchived: boolean
  facilityName?: string
  facilityCode?: string
}

export type LicenseStatus =
  | "Active"
  | "Expired"
  | "Suspended"
  | "Denied"
  | "Pending"
  | "In Review"
  | "Renewal Reviewed"
  | "Approved"
  | "Info Requested"

export type LicenseAction =
  | "APPROVE"
  | "DENY"
  | "SUSPEND"
  | "SET_EXPIRED"
  | "REVIEW"
  | "RENEWAL_REVIEW"
  | "REQUEST_INFO"

export interface BackendLicense {
  license_number: string
  registration_number: string
  category: string
  owner: string
  facility_name?: string
  facility_code?: string
  facility_type: string
  license_type: string
  date_of_issuance: string
  date_of_expiry: string
  payment_status: string
  status: LicenseStatus
  is_archived: boolean
}

export interface LicensePaginationMeta {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedLicensesResponse {
  data: License[]
  pagination: LicensePaginationMeta
}

export interface UpdateLicensePayload {
  license_number: string
  action: LicenseAction
  debug_mode?: number
}

// License Applications
export interface LicenseApplication {
  id: string
  licenseApplicationId: string
  facilityName: string
  facilityCode?: string
  hieFacilityId?: string
  registrationNumber: string
  facilityCategory?: string
  owner?: string
  facilityType?: string
  kephLevel?: string
  licenseStatus?: string
  county?: string
  subCounty?: string
  ward?: string
  constituency?: string
  telephoneNumber?: string
  officialEmail?: string
  physicalAddress?: string
  numberOfBeds?: number
  industry?: string
  openLateNight?: boolean
  openWholeDay?: boolean
  openWeekends?: boolean
  openPublicHoliday?: boolean
  licenseTypeName: string
  applicationStatus: "Pending" | "Issued" | "Info Requested" | "Denied"
  applicationType: "New" | "Renewal"
  applicationDate: string
  regulatoryBody: string
  licenseFee: number
  remarks?: string
  complianceDocuments?: any[]
}

export interface BackendLicenseApplication {
  license_application_id: string
  health_facility: string
  license_type_name: string
  application_status: "Pending" | "Issued" | "Info Requested" | "Denied"
  application_date: string
  application_type: "New" | "Renewal"
  regulatory_body: string
  license_fee: number
  remarks?: string
  compliance_documents?: any[]
}

// Professional License
export interface ProfessionalLicenseRecord {
  id: string
  licenseNumber: string
  name: string
  registrationNumber: string
  identificationType: string
  identificationNumber: string
  category: string
  licenseType: string
  degree: string
  placeOfPractice: string
  county: string
  dateOfIssuance: string
  dateOfExpiry: string
  paymentStatus: string
  licenseStatus: LicenseStatus
  isArchived: boolean
}

export interface BackendProfessionalLicense {
  license_number: string
  name: string
  registration_number: string
  identification_type: string
  identification_number: string
  category: string
  license_type: string
  degree: string
  place_of_practice: string
  county: string
  date_of_issuance: string
  date_of_expiry: string
  payment_status: string
  license_status: LicenseStatus
  is_archived: boolean
}

// Professional License Application
export interface ProfessionalLicenseApplication {
  id: string
  licenseApplicationId: string
  fullName: string
  registrationNumber: string
  identificationType?: string
  identificationNumber?: string
  country?: string
  nationality?: string
  categoryOfPractice: string
  placeOfPractice: string
  county: string
  instituteOfGraduation?: string
  degree?: string
  address?: string
  email?: string
  phone?: string
  licenseTypeName: string
  applicationStatus: "Pending" | "Issued" | "Info Requested" | "Denied"
  applicationType: "New" | "Renewal"
  applicationDate: string
  regulatoryBody?: string
  licenseFee: number
  remarks?: string
  complianceDocuments?: any[]
}

// License Appeal
export interface LicenseAppeal {
  id: string
  licenseNumber: string
  facilityName: string
  registrationNumber: string
  appealReason: string
  appealDescription?: string
  supportingDocuments?: any[]
  appealStatus: string
  createdDate: string
}

export interface CreateLicenseAppealPayload {
  appeal_info: {
    reason_for_appeal: string
    appeal_description?: string
    supporting_documents?: any[]
  }
  facility_code?: string
  registration_number?: string
  license_number: string
}

// Facility for dropdown
export interface FacilityOption {
  name: string
  facility_name: string
  registration_number: string
  facility_code?: string
}
