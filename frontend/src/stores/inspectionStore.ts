import { create } from 'zustand'

export interface Inspection {
  id: string
  inspectionId: string
  facilityName: string
  date: string
  inspector: string
  noteToInspector: string
  status: 'Non Compliant' | 'Completed' | 'Pending'
  company?: string
}

export interface InspectionState {
  inspections: Inspection[]
  activeTab: 'scheduled' | 'findings'
  setActiveTab: (tab: 'scheduled' | 'findings') => void
  applyMockForCompany: (company?: string | null) => void
}

function buildMockInspections(company?: string | null): Inspection[] {
  const companyLabel = company || 'Default Company'

  const facilities = [
    'Makueni Health Centre',
    'Shalom Health Centre',
    'Nairobi West Hospital',
    'Kisumu Medical Center',
    'Mombasa General Hospital',
    'Nakuru County Referral Hospital',
    'Eldoret Medical Center',
    'Thika Level 5 Hospital',
    'Garissa Provincial Hospital',
    'Machakos Level 5 Hospital',
    'Nyeri Teaching Hospital',
    'Kakamega County Hospital',
    'Kisii Teaching Hospital',
    'Kitale District Hospital',
    'Embu Level 5 Hospital',
    'Malindi Sub-County Hospital',
    'Naivasha District Hospital',
    'Kericho County Referral Hospital',
    'Bungoma County Hospital',
    'Bomet Health Centre',
  ]

  const inspectors = [
    'John Doe',
    'Jane Smith',
    'Dr. James Mwangi',
    'Dr. Sarah Kimani',
    'Inspector David Omondi',
    'Inspector Mary Wanjiru',
  ]

  const notes = [
    'Check safety compliance',
    'Verify equipment maintenance records',
    'Review staff credentials',
    'Inspect emergency response protocols',
    'Evaluate infection control measures',
    'Check pharmaceutical storage compliance',
    'Verify patient records management',
    'Assess waste disposal procedures',
    'Review fire safety measures',
    'Inspect medical gas systems',
  ]

  const statuses: Inspection['status'][] = ['Non Compliant', 'Completed', 'Pending']

  return facilities.map((facility, index) => {
    const dayOffset = Math.floor(index / 3)
    const date = new Date(2024, 1, 21 + dayOffset) // Feb 21, 2024 onwards
    const formattedDate = date.toLocaleDateString('en-GB').replace(/\//g, '/')

    return {
      id: String(index + 1),
      inspectionId: `I${102 + index}`,
      facilityName: facility,
      date: formattedDate,
      inspector: inspectors[index % inspectors.length],
      noteToInspector: notes[index % notes.length],
      status: statuses[index % statuses.length],
      company: companyLabel,
    }
  })
}

export const useInspectionStore = create<InspectionState>((set) => ({
  inspections: buildMockInspections(),
  activeTab: 'scheduled',
  setActiveTab: (tab) => set({ activeTab: tab }),
  applyMockForCompany: (company?: string | null) =>
    set({
      inspections: buildMockInspections(company),
    }),
}))
