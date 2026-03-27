import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { EntityType, EntityDrawerState, Professional, Facility } from '@/types/entity'
import type { Inspection } from '@/types/inspection'
import type { License } from '@/types/license'
import { apiRequest } from '@/utils/api'
import { getLicense } from '@/api/licensingApi'

interface HistoryEntry {
  type: EntityType
  id: string
  data: any
}

interface EntityDrawerContextValue {
  state: EntityDrawerState
  openDrawer: (type: EntityType, id: string | any) => void
  closeDrawer: () => void
  goBack: () => void
  canGoBack: () => boolean
}

const EntityDrawerContext = createContext<EntityDrawerContextValue | undefined>(undefined)

export function useEntityDrawer() {
  const context = useContext(EntityDrawerContext)
  if (!context) {
    throw new Error('useEntityDrawer must be used within EntityDrawerProvider')
  }
  return context
}

interface EntityDrawerProviderProps {
  children: ReactNode
}

export function EntityDrawerProvider({ children }: EntityDrawerProviderProps) {
  const [state, setState] = useState<EntityDrawerState>({
    open: false,
    type: null,
    id: null,
    data: null,
    loading: false,
  })
  const [history, setHistory] = useState<HistoryEntry[]>([])

  const openDrawer = useCallback(async (type: EntityType, id: string | any) => {
    // Save current state to history before opening new drawer
    if (state.open && state.type && state.id && state.data) {
      setHistory((prev) => [
        ...prev,
        {
          type: state.type!,
          id: state.id!,
          data: state.data,
        },
      ])
    }

    setState({
      open: true,
      type,
      id: typeof id === 'string' ? id : id.id || id.inspectionId,
      data: null,
      loading: true,
    })

    try {
      let data = null

      switch (type) {
        case 'professional':
          data = await fetchProfessional(id)
          break
        case 'facility':
          data = await fetchFacility(id)
          break
        case 'inspection':
          // Inspection data is passed directly as the whole object
          data = typeof id === 'string' ? JSON.parse(id) : id
          setState((prev) => ({
            ...prev,
            data,
            loading: false,
          }))
          return
        case 'license':
          data = await fetchLicense(id)
          break
      }

      setState((prev) => ({
        ...prev,
        data,
        loading: false,
      }))
    } catch (error) {
      console.error('Failed to fetch entity:', error)
      setState((prev) => ({
        ...prev,
        loading: false,
      }))
    }
  }, [state])

  const closeDrawer = useCallback(() => {
    setState({
      open: false,
      type: null,
      id: null,
      data: null,
      loading: false,
    })
    setHistory([])
  }, [])

  const goBack = useCallback(() => {
    if (history.length === 0) return

    const previousEntry = history[history.length - 1]
    const newHistory = history.slice(0, -1)

    setState({
      open: true,
      type: previousEntry.type,
      id: previousEntry.id,
      data: previousEntry.data,
      loading: false,
    })
    setHistory(newHistory)
  }, [history])

  const canGoBack = useCallback(() => {
    return history.length > 0
  }, [history])

  return (
    <EntityDrawerContext.Provider value={{ state, openDrawer, closeDrawer, goBack, canGoBack }}>
      {children}
    </EntityDrawerContext.Provider>
  )
}

// Fetch functions
async function fetchProfessional(id: string): Promise<Professional> {
  const response = await apiRequest<{ message: any }>(
    `/api/method/compliance_360.api.entities.get_professional_details?registration_number=${encodeURIComponent(id)}`
  )

  const data = response.message

  if (data.error) {
    throw new Error(data.error)
  }

  return {
    id: data.id,
    registrationNumber: data.registration_number,
    licenseNumber: data.license_number,
    firstName: data.first_name,
    middleName: data.middle_name,
    lastName: data.last_name,
    fullName: data.full_name,
    dateOfBirth: data.date_of_birth,
    gender: data.gender,
    typeOfPractice: data.type_of_practice,
    specialty: data.specialty,
    subSpecialty: data.sub_specialty,
    professionalCadre: data.professional_cadre,
    emailAddress: data.email_address,
    phoneNumber: data.phone_number,
    nationality: data.nationality,
    county: data.county,
    postalAddress: data.postal_address,
    affiliations: (data.affiliations || []).map((aff: any) => ({
      facilityName: aff.facility_name,
      facilityRegistrationNumber: aff.facility_registration_number,
      role: aff.role,
      status: aff.status,
    })),
    licenses: (data.licenses || []).map((lic: any) => ({
      licenseNumber: lic.license_number,
      status: lic.status,
      expiryDate: lic.expiry_date,
    })),
  }
}

async function fetchFacility(id: string): Promise<Facility> {
  const response = await apiRequest<{ message: any }>(
    `/api/method/compliance_360.api.entities.get_facility_details?registration_number=${encodeURIComponent(id)}`
  )

  const data = response.message

  if (data.error) {
    throw new Error(data.error)
  }

  return {
    id: data.id,
    registrationNumber: data.registration_number,
    facilityName: data.facility_name,
    facilityCode: data.facility_code,
    kephLevel: data.keph_level,
    facilityType: data.facility_type,
    category: data.category,
    owner: data.owner,
    telephoneNumber: data.telephone_number,
    officialEmail: data.official_email,
    physicalAddress: data.physical_address,
    county: data.county,
    subCounty: data.sub_county,
    ward: data.ward,
    openWholeDay: data.open_whole_day,
    openWeekends: data.open_weekends,
    openPublicHoliday: data.open_public_holiday,
    numberOfBeds: data.number_of_beds,
    affiliations: (data.affiliations || []).map((aff: any) => ({
      professionalName: aff.professional_name,
      professionalRegistrationNumber: aff.professional_registration_number,
      role: aff.role,
      status: aff.status,
    })),
    licenses: (data.licenses || []).map((lic: any) => ({
      licenseNumber: lic.license_number,
      status: lic.status,
      expiryDate: lic.expiry_date,
    })),
  }
}

async function fetchLicense(id: string): Promise<License> {
  const license = await getLicense(id)
  return license
}
