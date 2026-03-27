export interface Inspection {
  id: string
  inspectionId: string
  facilityId: string
  facilityName: string
  date: string
  professionalId: string
  inspector: string
  noteToInspector: string
  status: "Non Compliant" | "Completed" | "Pending"
  company?: string
  findings?: Finding[]
  inspectedDate?: string
  findingCount?: number
}

export interface BackendInspection {
  name: string
  facility: string
  facility_name?: string
  scheduled_date: string
  professional: string
  professional_name?: string
  note_to_inspector: string
  status: "Non Compliant" | "Completed" | "Pending"
  company?: string
  findings?: BackendFinding[]
  inspected_date?: string
  finding_count?: number
}

export interface FrappeListResponse<T> {
  data: T[]
}

export interface PaginationMeta {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
}

export interface FrappeDocResponse {
  data: BackendInspection
}

export interface CreateInspectionPayload {
  facility: string
  scheduled_date: string
  professional: string
  note_to_inspector: string
  status?: "Non Compliant" | "Completed" | "Pending"
  company?: string
}

export interface UpdateInspectionPayload {
  facility?: string
  scheduled_date?: string
  professional?: string
  note_to_inspector?: string
  status?: "Non Compliant" | "Completed" | "Pending"
}

export interface Facility {
  name: string
  facility_name: string
}

export interface Professional {
  name: string
  full_name: string
}

export interface Attachment {
  name: string
  file_name: string
  file_url: string
  file_size: number
  is_private: number
}

export interface Finding {
  id: string
  findingId: string
  idx: number // Child table row index
  category: string
  severity: "Critical" | "Major" | "Minor"
  description: string
  status: "Open" | "In Progress" | "Resolved"
  correctiveAction?: string
  dueDate?: string
  resolvedDate?: string
  attachments?: Attachment[]
  // Context fields (populated from parent inspection)
  facilityId?: string
  facilityName?: string
  professionalId?: string
  inspectorName?: string
  inspectionId?: string
  inspectionDate?: string
}

export interface BackendFinding {
  name: string
  idx: number
  category: string
  severity: "Critical" | "Major" | "Minor"
  description: string
  status: "Open" | "In Progress" | "Resolved"
  corrective_action?: string | null
  due_date?: string | null
  resolved_date?: string | null
  attachments?: Attachment[]
}
