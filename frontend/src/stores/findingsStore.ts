import { create } from 'zustand'

export interface Finding {
  id: string
  findingId: string
  facilityName: string
  inspectionDate: string
  inspector: string
  category: string
  severity: 'Critical' | 'Major' | 'Minor'
  description: string
  status: 'Open' | 'Resolved' | 'In Progress'
  dueDate: string
  evidence?: string[]
  correctiveAction?: string
  resolvedDate?: string
}

export interface FindingsState {
  findings: Finding[]
  applyMockForCompany: (company?: string | null) => void
}

function buildMockFindings(company?: string | null): Finding[] {
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
  ]

  const categories = [
    'Safety Compliance',
    'Equipment Maintenance',
    'Staff Credentials',
    'Infection Control',
    'Pharmaceutical Storage',
    'Record Management',
    'Waste Disposal',
    'Emergency Preparedness',
  ]

  const inspectors = [
    'John Doe',
    'Jane Smith',
    'Dr. James Mwangi',
    'Dr. Sarah Kimani',
  ]

  const descriptions = [
    'Fire extinguishers not inspected within required timeframe',
    'Emergency exit signs not illuminated',
    'Expired medications found in storage',
    'Incomplete patient consent forms',
    'Medical waste containers not properly labeled',
    'Staff without updated certifications',
    'Temperature monitoring records incomplete',
    'Hand hygiene stations inadequately stocked',
  ]

  const severities: Finding['severity'][] = ['Critical', 'Major', 'Minor']
  const statuses: Finding['status'][] = ['Open', 'Resolved', 'In Progress']

  return facilities.slice(0, 12).map((facility, index) => {
    const inspectionDate = new Date(2024, 1, 10 + index)
    const dueDate = new Date(2024, 2, 10 + index * 2)

    return {
      id: String(index + 1),
      findingId: `F${1001 + index}`,
      facilityName: facility,
      inspectionDate: inspectionDate.toLocaleDateString('en-GB'),
      inspector: inspectors[index % inspectors.length],
      category: categories[index % categories.length],
      severity: severities[index % severities.length],
      description: descriptions[index % descriptions.length],
      status: statuses[index % statuses.length],
      dueDate: dueDate.toLocaleDateString('en-GB'),
      evidence: [`photo_${index + 1}.jpg`, `report_${index + 1}.pdf`],
      correctiveAction: index % 3 === 0 ? 'Install new fire extinguishers and schedule regular inspections' : undefined,
      resolvedDate: statuses[index % statuses.length] === 'Resolved' ? new Date(2024, 2, 5 + index).toLocaleDateString('en-GB') : undefined,
    }
  })
}

export const useFindingsStore = create<FindingsState>((set) => ({
  findings: buildMockFindings(),
  applyMockForCompany: (company?: string | null) =>
    set({
      findings: buildMockFindings(company),
    }),
}))
