import { apiRequest } from "@/utils/api"

export interface LicenseComment {
  id: string
  comment: string
  created_at: string
  created_by: string
}

export interface LicenseCommentsPagination {
  page: number
  page_size: number
  total_count: number
  total_pages: number
  has_next: boolean
  has_prev: boolean
}

export interface LicenseCommentsResponse {
  comments: LicenseComment[]
  pagination: LicenseCommentsPagination
}

export async function fetchLicenseComments(
  licenseNumber: string,
  page: number = 1,
  pageSize: number = 20
): Promise<LicenseCommentsResponse> {
  try {
    const params = new URLSearchParams({
      license_number: licenseNumber,
      page: page.toString(),
      page_size: pageSize.toString(),
    })

    const response = await apiRequest<any>(
      `/api/method/compliance_360.api.license_management.comments.fetch_comments?${params}`
    )

    return response.message || response
  } catch (error) {
    console.error("Failed to fetch license comments:", error)
    throw error
  }
}

export async function addLicenseComment(
  licenseNumber: string,
  comment: string
): Promise<LicenseComment> {
  try {
    const params = new URLSearchParams({
      license_number: licenseNumber,
      comment: comment,
    })

    const response = await apiRequest<any>(
      `/api/method/compliance_360.api.license_management.comments.save_comment?${params}`,
      {
        method: "POST",
      }
    )

    return response.message || response
  } catch (error) {
    console.error("Failed to add license comment:", error)
    throw error
  }
}
