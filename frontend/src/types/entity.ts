export type EntityType = "professional" | "facility" | "license" | "inspection"

export interface Professional {
  id: string
  registrationNumber: string
  licenseNumber?: string
  firstName: string
  middleName?: string
  lastName: string
  fullName: string
  dateOfBirth?: string
  gender?: string
  typeOfPractice?: string
  specialty?: string
  subSpecialty?: string
  professionalCadre?: string
  emailAddress?: string
  phoneNumber?: string
  nationality?: string
  county?: string
  postalAddress?: string
  affiliations?: Array<{
    facilityName: string
    facilityRegistrationNumber: string
    role: string
    status: string
  }>
  licenses?: Array<{
    licenseNumber: string
    status: string
    expiryDate: string
  }>
}

export interface Facility {
  id: string
  registrationNumber: string
  facilityName: string
  facilityCode?: string
  kephLevel?: string
  facilityType?: string
  category?: string
  owner?: string
  telephoneNumber?: string
  officialEmail?: string
  physicalAddress?: string
  county?: string
  subCounty?: string
  ward?: string
  openWholeDay?: boolean
  openWeekends?: boolean
  openPublicHoliday?: boolean
  numberOfBeds?: string
  affiliations?: Array<{
    professionalName: string
    professionalRegistrationNumber: string
    role: string
    status: string
  }>
  licenses?: Array<{
    licenseNumber: string
    status: string
    expiryDate: string
  }>
}

export interface EntityDrawerState {
  open: boolean
  type: EntityType | null
  id: string | null
  data: Professional | Facility | any | null
  loading: boolean
}
