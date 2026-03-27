import dayjs from "dayjs"
import { apiRequest } from "@/utils/api"
import { batchPromises } from "@/utils/promise"
import type {
  Inspection,
  BackendInspection,
  Finding,
  BackendFinding,
  FrappeListResponse,
  FrappeDocResponse,
  CreateInspectionPayload,
  UpdateInspectionPayload,
  Facility,
  Professional,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/inspection"

const INSPECTION_DOCTYPE = "Inspection Record"

export function transformFinding(
  backendFinding: BackendFinding,
  parentInspection?: Inspection
): Finding {
  return {
    id: backendFinding.name,
    findingId: backendFinding.name,
    idx: backendFinding.idx,
    category: backendFinding.category,
    severity: backendFinding.severity,
    description: backendFinding.description,
    status: backendFinding.status,
    correctiveAction: backendFinding.corrective_action || undefined,
    dueDate: backendFinding.due_date ? formatDateForFrontend(backendFinding.due_date) : undefined,
    resolvedDate: backendFinding.resolved_date
      ? formatDateForFrontend(backendFinding.resolved_date)
      : undefined,
    attachments: backendFinding.attachments || [],
    // Add context from parent inspection if provided
    facilityId: parentInspection?.facilityId,
    facilityName: parentInspection?.facilityName,
    professionalId: parentInspection?.professionalId,
    inspectorName: parentInspection?.inspector,
    inspectionId: parentInspection?.inspectionId,
    inspectionDate: parentInspection?.date,
  }
}

export function transformInspection(backendInspection: BackendInspection): Inspection {
  const inspection: Inspection = {
    id: backendInspection.name,
    inspectionId: backendInspection.name,
    facilityId: backendInspection.facility,
    facilityName: backendInspection.facility_name || backendInspection.facility,
    date: formatDateForFrontend(backendInspection.scheduled_date),
    professionalId: backendInspection.professional,
    inspector: backendInspection.professional_name || backendInspection.professional,
    noteToInspector: backendInspection.note_to_inspector,
    status: backendInspection.status,
    company: backendInspection.company,
    inspectedDate: backendInspection.inspected_date
      ? formatDateForFrontend(backendInspection.inspected_date)
      : undefined,
    findingCount: backendInspection.finding_count,
  }

  // Transform findings with parent context
  if (backendInspection.findings) {
    inspection.findings = backendInspection.findings.map((f) => transformFinding(f, inspection))
  }

  return inspection
}

export function formatDateForBackend(frontendDate: string): string {
  return dayjs(frontendDate, "DD/MM/YYYY").format("YYYY-MM-DD")
}

export function formatDateForFrontend(backendDate: string): string {
  return dayjs(backendDate, "YYYY-MM-DD").format("DD/MM/YYYY")
}

export interface InspectionFilters {
  search?: string
  startDate?: string // YYYY-MM-DD
  endDate?: string // YYYY-MM-DD
  sortBy?: string
  sortOrder?: "asc" | "desc"
  severity?: string // For findings: comma-separated list
  status?: string // For inspections/findings: comma-separated list
  page_size?: number // Number of items per page
}

export async function listInspections(
  page: number = 1,
  pageSize: number = 20,
  filters?: InspectionFilters
): Promise<PaginatedResponse<Inspection>> {
  // Build query params
  const params = new URLSearchParams({
    page: page.toString(),
    page_size: pageSize.toString(),
  })

  if (filters?.search) params.append("search", filters.search)
  if (filters?.startDate) params.append("start_date", filters.startDate)
  if (filters?.endDate) params.append("end_date", filters.endDate)
  if (filters?.sortBy) params.append("sort_by", filters.sortBy)
  if (filters?.sortOrder) params.append("sort_order", filters.sortOrder)
  if (filters?.status) params.append("status", filters.status)

  // Fetch scheduled inspections (defaults to Pending if no status specified)
  const response = await apiRequest<{ message: PaginatedResponse<BackendInspection> }>(
    `/api/method/compliance_360.api.inspection.get_scheduled_inspections?${params.toString()}`
  )
  return {
    data: response.message.data.map(transformInspection),
    pagination: response.message.pagination,
  }
}

export async function getInspection(name: string): Promise<Inspection> {
  const response = await apiRequest<{ message: BackendInspection }>(
    `/api/method/compliance_360.api.inspection.get_inspection_with_names?name=${encodeURIComponent(
      name
    )}`
  )
  return transformInspection(response.message)
}

export async function createInspection(payload: CreateInspectionPayload): Promise<Inspection> {
  const response = await apiRequest<FrappeDocResponse>(`/api/resource/${INSPECTION_DOCTYPE}`, {
    method: "POST",
    body: JSON.stringify(payload),
  })
  // Fetch the created inspection with display names
  return getInspection(response.data.name)
}

export async function updateInspection(
  name: string,
  payload: UpdateInspectionPayload
): Promise<Inspection> {
  await apiRequest<FrappeDocResponse>(
    `/api/resource/${INSPECTION_DOCTYPE}/${encodeURIComponent(name)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  )
  // Fetch the updated inspection with display names
  return getInspection(name)
}

export async function deleteInspection(name: string): Promise<void> {
  await apiRequest<void>(`/api/resource/${INSPECTION_DOCTYPE}/${encodeURIComponent(name)}`, {
    method: "DELETE",
  })
}

export function createInspectionFromForm(formData: {
  facility: string
  inspector: string
  date: string
  note: string
}): CreateInspectionPayload {
  return {
    facility: formData.facility,
    professional: formData.inspector,
    scheduled_date: formatDateForBackend(formData.date),
    note_to_inspector: formData.note,
    status: "Pending",
  }
}

export async function listFacilities(): Promise<Facility[]> {
  const response = await apiRequest<FrappeListResponse<Facility>>(
    `/api/resource/Facility Record?fields=["name","facility_name"]`
  )
  return response.data
}

export async function listProfessionals(): Promise<Professional[]> {
  const response = await apiRequest<FrappeListResponse<Professional>>(
    `/api/resource/Professional Record?fields=["name","full_name"]`
  )
  return response.data
}

export async function listFindings(filters?: InspectionFilters): Promise<Finding[]> {
  // Build query params
  const params = new URLSearchParams({
    page: "1",
    page_size: "1000",
  })

  if (filters?.search) params.append("search", filters.search)
  if (filters?.startDate) params.append("start_date", filters.startDate)
  if (filters?.endDate) params.append("end_date", filters.endDate)
  if (filters?.sortBy) params.append("sort_by", filters.sortBy)
  if (filters?.sortOrder) params.append("sort_order", filters.sortOrder)
  if (filters?.severity) params.append("severity", filters.severity)
  if (filters?.status) params.append("status", filters.status)

  // Fetch ONLY Completed or Non Compliant inspections
  const response = await apiRequest<{ message: PaginatedResponse<BackendInspection> }>(
    `/api/method/compliance_360.api.inspection.get_inspection_findings?${params.toString()}`
  )

  const inspectionsWithFindings = response.message.data
    .map(transformInspection)
    .filter((i) => (i.findingCount || 0) > 0)

  // Fetch full details in batches of 10 to avoid overwhelming browser
  const fullInspections = await batchPromises(
    inspectionsWithFindings,
    (inspection) => getInspection(inspection.id),
    10
  )

  // Flatten all findings from all inspections
  return fullInspections
    .filter((i) => i.findings && i.findings.length > 0)
    .flatMap((i) => i.findings!)
}

export interface DashboardStats {
  metrics: {
    due_soon: number
    completed: number
    non_compliant: number
    overdue: number
    total: number
  }
  upcoming_inspections: Array<{
    name: string
    facility_name: string
    scheduled_date: string
    status: string
  }>
  compliance_rate: {
    compliant: number
    total: number
  }
  trend_data: Array<{
    label: string
    value: number
    color: string
  }>
  recent_activity: Array<{
    name: string
    facility_name: string
    inspected_date: string | null
    scheduled_date: string
    status: string
    finding_count: number
  }>
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await apiRequest<{ message: DashboardStats }>(
    `/api/method/compliance_360.api.inspection.get_dashboard_stats`
  )
  return response.message
}
