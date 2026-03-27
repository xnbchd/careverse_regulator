import apiClient from "./client"
import type {
  LicenseApplicationData,
  LicenseRenewalData,
  LicenseAppealData,
  FormSubmission,
  FormType,
} from "@/types/forms"

const API_BASE = "/api/method/compliance_360.api.forms"

/**
 * Submit new license application
 */
export async function submitLicenseApplication(
  data: LicenseApplicationData
): Promise<FormSubmission> {
  const formData = new FormData()

  // Add form fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "documents" && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  })

  // Add documents
  if (data.documents) {
    Object.entries(data.documents).forEach(([key, files]) => {
      if (files) {
        if (Array.isArray(files)) {
          files.forEach((file) => formData.append(`documents_${key}`, file))
        } else {
          formData.append(`documents_${key}`, files)
        }
      }
    })
  }

  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.submit_license_application`,
    formData
  )

  return transformFormSubmission(response.message)
}

/**
 * Submit license renewal
 */
export async function submitLicenseRenewal(data: LicenseRenewalData): Promise<FormSubmission> {
  const formData = new FormData()

  // Add form fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "documents" && value !== undefined && value !== null) {
      if (typeof value === "object") {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  })

  // Add documents
  if (data.documents) {
    Object.entries(data.documents).forEach(([key, files]) => {
      if (files) {
        if (Array.isArray(files)) {
          files.forEach((file) => formData.append(`documents_${key}`, file))
        } else {
          formData.append(`documents_${key}`, files)
        }
      }
    })
  }

  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.submit_license_renewal`,
    formData
  )

  return transformFormSubmission(response.message)
}

/**
 * Submit license appeal
 */
export async function submitLicenseAppeal(data: LicenseAppealData): Promise<FormSubmission> {
  const formData = new FormData()

  // Add form fields
  Object.entries(data).forEach(([key, value]) => {
    if (key !== "documents" && value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, String(value))
      }
    }
  })

  // Add documents
  if (data.documents) {
    Object.entries(data.documents).forEach(([key, files]) => {
      if (files) {
        if (Array.isArray(files)) {
          files.forEach((file) => formData.append(`documents_${key}`, file))
        } else {
          formData.append(`documents_${key}`, files)
        }
      }
    })
  }

  const response = await apiClient.post<{ message: any }>(
    `${API_BASE}.submit_license_appeal`,
    formData
  )

  return transformFormSubmission(response.message)
}

/**
 * Get form submission by ID
 */
export async function getFormSubmission(submissionId: string): Promise<FormSubmission> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.get_form_submission`, {
    params: { submission_id: submissionId },
  })

  return transformFormSubmission(response.message)
}

/**
 * List form submissions
 */
export async function listFormSubmissions(filters?: {
  formType?: FormType
  status?: string
  page?: number
  pageSize?: number
}): Promise<{ submissions: FormSubmission[]; total: number }> {
  const response = await apiClient.get<{ message: any }>(`${API_BASE}.list_form_submissions`, {
    params: {
      form_type: filters?.formType,
      status: filters?.status,
      page: filters?.page,
      page_size: filters?.pageSize,
    },
  })

  const data = response.message
  return {
    submissions: data.submissions.map(transformFormSubmission),
    total: data.total,
  }
}

/**
 * Transform backend form submission to frontend format
 */
function transformFormSubmission(data: any): FormSubmission {
  return {
    id: data.name || data.id,
    formType: data.form_type,
    submittedAt: data.submitted_at || data.creation,
    submittedBy: data.submitted_by,
    status: data.status,
    data: data.form_data,
    documents: data.documents || [],
    reviewNotes: data.review_notes,
    reviewedBy: data.reviewed_by,
    reviewedAt: data.reviewed_at,
  }
}
