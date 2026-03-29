/**
 * Navigation Utilities
 *
 * Centralized navigation helpers to ensure consistent patterns across the app.
 * See NAVIGATION_PATTERNS.md for full documentation.
 */

import type { NavigateOptions } from "@tanstack/react-router"

/**
 * Valid status values for each entity type
 */
export const VALID_STATUSES = {
  affiliation: ["Pending", "Active", "Rejected", "Inactive"] as const,
  license: ["Active", "Expired", "Suspended", "Denied", "In Review", "Renewal Reviewed"] as const,
  application: ["Pending", "Approved", "Denied", "Info Requested"] as const,
  inspection: ["Pending", "Completed", "Non Compliant"] as const,
} as const

export type AffiliationStatus = (typeof VALID_STATUSES.affiliation)[number]
export type LicenseStatus = (typeof VALID_STATUSES.license)[number]
export type ApplicationStatus = (typeof VALID_STATUSES.application)[number]
export type InspectionStatus = (typeof VALID_STATUSES.inspection)[number]

/**
 * Navigation paths
 */
export const ROUTES = {
  // Dashboards
  main: "/",
  affiliationsDashboard: "/affiliations",
  licensesDashboard: "/license-management",
  inspectionsDashboard: "/inspections",

  // List Views
  affiliationsList: "/affiliations/list",
  licensesList: "/license-management/licenses",
  applicationsList: "/license-management/applications",
  inspectionsList: "/inspections/list",

  // Detail Views
  affiliationDetail: (id: string) => `/affiliations/${id}`,
  licenseDetail: (licenseNumber: string) => `/license-management/${licenseNumber}`,
  applicationDetail: (id: string) => `/license-management/applications/${id}`,
  inspectionDetail: (id: string) => `/inspections/${id}`,
} as const

/**
 * Validation helpers
 */
export function isValidStatus(entity: keyof typeof VALID_STATUSES, status: string): boolean {
  return (VALID_STATUSES[entity] as readonly string[]).includes(status)
}

/**
 * Navigation builders - use these to ensure consistency
 */

export interface AffiliationsListParams {
  status?: AffiliationStatus
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface LicensesListParams {
  status?: LicenseStatus
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface ApplicationsListParams {
  applicationStatus?: ApplicationStatus
  applicationType?: string
  search?: string
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

export interface InspectionsListParams {
  status?: InspectionStatus
  search?: string
  startDate?: string
  endDate?: string
  sortBy?: "facility_name" | "modified"
  sortOrder?: "asc" | "desc"
  activeTab?: "scheduled" | "findings"
  modal?: "schedule"
}

/**
 * Build navigation options for common scenarios
 */

export function navigateToAffiliationsList(params?: AffiliationsListParams): NavigateOptions {
  // Validate status if provided
  if (params?.status && !isValidStatus("affiliation", params.status)) {
    console.warn(`Invalid affiliation status: ${params.status}`)
  }

  return {
    to: ROUTES.affiliationsList,
    search: params,
  }
}

export function navigateToLicensesList(params?: LicensesListParams): NavigateOptions {
  // Validate status if provided
  if (params?.status && !isValidStatus("license", params.status)) {
    console.warn(`Invalid license status: ${params.status}`)
  }

  return {
    to: ROUTES.licensesList,
    search: params,
  }
}

export function navigateToApplicationsList(params?: ApplicationsListParams): NavigateOptions {
  // Validate status if provided
  if (params?.applicationStatus && !isValidStatus("application", params.applicationStatus)) {
    console.warn(`Invalid application status: ${params.applicationStatus}`)
  }

  return {
    to: ROUTES.applicationsList,
    search: params,
  }
}

export function navigateToInspectionsList(params?: InspectionsListParams): NavigateOptions {
  // Validate status if provided
  if (params?.status && !isValidStatus("inspection", params.status)) {
    console.warn(
      `Invalid inspection status: ${params.status}. Use 'Pending' for computed states like 'Overdue'.`
    )
  }

  return {
    to: ROUTES.inspectionsList,
    search: params,
  }
}

/**
 * Helper to navigate back to dashboard from list view
 */
export function getBackToDashboardRoute(currentPath: string): string {
  if (currentPath.startsWith("/affiliations/")) {
    return ROUTES.affiliationsDashboard
  }
  if (currentPath.startsWith("/license-management/")) {
    return ROUTES.licensesDashboard
  }
  if (currentPath.startsWith("/inspections/")) {
    return ROUTES.inspectionsDashboard
  }
  return ROUTES.main
}

/**
 * Common navigation scenarios
 */

/**
 * Navigate to list view with pending items filter
 */
export function navigateToPendingItems(
  entity: "affiliations" | "applications" | "inspections"
): NavigateOptions {
  switch (entity) {
    case "affiliations":
      return navigateToAffiliationsList({ status: "Pending" })
    case "applications":
      return navigateToApplicationsList({ applicationStatus: "Pending" })
    case "inspections":
      return navigateToInspectionsList({ status: "Pending" })
  }
}

/**
 * Navigate to list view with active items filter
 */
export function navigateToActiveItems(entity: "affiliations" | "licenses"): NavigateOptions {
  switch (entity) {
    case "affiliations":
      return navigateToAffiliationsList({ status: "Active" })
    case "licenses":
      return navigateToLicensesList({ status: "Active" })
  }
}

/**
 * Navigate to inspection list for "overdue" inspections
 * (Uses Pending status since Overdue is a computed state)
 */
export function navigateToOverdueInspections(): NavigateOptions {
  return navigateToInspectionsList({ status: "Pending" })
}

/**
 * Navigate to licenses list for "expiring soon" licenses
 * (Doesn't use status filter since "Expiring Soon" is computed)
 */
export function navigateToExpiringSoonLicenses(): NavigateOptions {
  return navigateToLicensesList() // No status filter, user can see all active
}

/**
 * Open schedule inspection modal
 */
export function openScheduleInspectionModal(): NavigateOptions {
  return navigateToInspectionsList({ modal: "schedule" })
}

/**
 * Type guards for development
 */
export function assertValidAffiliationStatus(status: string): asserts status is AffiliationStatus {
  if (!isValidStatus("affiliation", status)) {
    throw new Error(
      `Invalid affiliation status: ${status}. Valid values: ${VALID_STATUSES.affiliation.join(
        ", "
      )}`
    )
  }
}

export function assertValidLicenseStatus(status: string): asserts status is LicenseStatus {
  if (!isValidStatus("license", status)) {
    throw new Error(
      `Invalid license status: ${status}. Valid values: ${VALID_STATUSES.license.join(", ")}`
    )
  }
}

export function assertValidApplicationStatus(status: string): asserts status is ApplicationStatus {
  if (!isValidStatus("application", status)) {
    throw new Error(
      `Invalid application status: ${status}. Valid values: ${VALID_STATUSES.application.join(
        ", "
      )}`
    )
  }
}

export function assertValidInspectionStatus(status: string): asserts status is InspectionStatus {
  if (!isValidStatus("inspection", status)) {
    throw new Error(
      `Invalid inspection status: ${status}. Valid values: ${VALID_STATUSES.inspection.join(", ")}`
    )
  }
}
