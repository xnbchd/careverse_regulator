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
  Inspector,
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
    professionalId: parentInspection?.assignedTo,
    inspectorName: parentInspection?.inspectorName,
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
    assignedTo: backendInspection.assigned_to,
    inspectorName: backendInspection.inspector_name || backendInspection.assigned_to,
    noteToInspector: backendInspection.note_to_inspector,
    status: backendInspection.status,
    inspectionType: backendInspection.inspection_type,
    priority: backendInspection.priority,
    company: backendInspection.company,
    inspectedDate: backendInspection.inspected_date
      ? formatDateForFrontend(backendInspection.inspected_date)
      : undefined,
    submittedDate: backendInspection.submitted_date
      ? formatDateForFrontend(backendInspection.submitted_date)
      : undefined,
    reviewedDate: backendInspection.reviewed_date
      ? formatDateForFrontend(backendInspection.reviewed_date)
      : undefined,
    reviewedBy: backendInspection.reviewed_by,
    reviewComments: backendInspection.review_comments,
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

  // Fetch scheduled inspections (defaults to Assigned if no status specified)
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

export async function transitionInspectionStatus(
  name: string,
  newStatus: "Assigned" | "In Progress" | "Submitted" | "Reviewed" | "Cancelled",
  reviewComments?: string
): Promise<Inspection> {
  // Validate required parameters
  if (!name || !newStatus) {
    throw new Error("Inspection name and new status are required")
  }

  // Validate review comments are provided when transitioning to Reviewed
  if (newStatus === "Reviewed" && !reviewComments?.trim()) {
    throw new Error("Review comments are required when marking as Reviewed")
  }

  try {
    const response = await apiRequest<{ message: BackendInspection }>(
      `/api/method/compliance_360.api.inspection.transition_inspection_status`,
      {
        method: "POST",
        body: JSON.stringify({
          inspection_name: name,
          new_status: newStatus,
          review_comments: reviewComments,
        }),
      }
    )
    return transformInspection(response.message)
  } catch (error) {
    // Re-throw with more context
    throw new Error(
      `Failed to transition inspection ${name} to ${newStatus}: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    )
  }
}

export function createInspectionFromForm(formData: {
  facility: string
  inspector: string
  date: string
  inspectionType: "Routine" | "Follow-up" | "Complaint-driven" | "License Renewal"
  priority?: "Routine" | "Urgent" | "High Priority"
  note: string
}): CreateInspectionPayload {
  return {
    facility: formData.facility,
    assigned_to: formData.inspector,
    scheduled_date: formatDateForBackend(formData.date),
    inspection_type: formData.inspectionType,
    priority: formData.priority,
    note_to_inspector: formData.note,
    status: "Assigned",
  }
}

export async function listFacilities(): Promise<Facility[]> {
  const response = await apiRequest<FrappeListResponse<Facility>>(
    `/api/resource/Facility Record?fields=["name","facility_name"]`
  )
  return response.data
}

export async function listInspectors(search?: string): Promise<Inspector[]> {
  // Fetch users who have Field Inspector role only
  const filters = [["Has Role", "role", "=", "Field Inspector"]]

  // Add search filter if provided
  if (search) {
    filters.push(["full_name", "like", `%${search}%`])
  }

  const response = await apiRequest<FrappeListResponse<Inspector>>(
    `/api/resource/User?fields=["name","full_name","email"]&filters=${JSON.stringify(filters)}&limit_page_length=50`
  )
  return response.data
}

export async function searchInspectors(searchTerm: string): Promise<Inspector[]> {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return listInspectors()
  }
  return listInspectors(searchTerm)
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

  // Fetch ONLY Submitted or Reviewed inspections
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
    assigned: number
    submitted: number
    reviewed: number
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
