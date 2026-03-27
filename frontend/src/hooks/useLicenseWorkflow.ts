import { useState, useCallback } from "react"
import { updateLicense } from "@/api/licensingApi"
import type { LicenseAction, LicenseStatus } from "@/types/license"

interface WorkflowState {
  processing: boolean
  error: string | null
  success: boolean
}

interface UseLicenseWorkflowReturn {
  state: WorkflowState
  canPerformAction: (currentStatus: LicenseStatus, action: LicenseAction) => boolean
  performAction: (licenseNumber: string, action: LicenseAction) => Promise<void>
  resetState: () => void
}

// Define valid status transitions
const statusTransitions: Record<LicenseStatus, LicenseAction[]> = {
  Pending: ["APPROVE", "DENY", "REVIEW", "REQUEST_INFO"],
  Active: ["SUSPEND", "SET_EXPIRED", "RENEWAL_REVIEW"],
  Expired: ["RENEWAL_REVIEW"],
  Suspended: ["APPROVE", "DENY"],
  Denied: [], // Appeals are handled separately
  "In Review": ["APPROVE", "DENY", "REQUEST_INFO"],
  "Renewal Reviewed": ["APPROVE", "DENY"],
  Approved: [],
  "Info Requested": ["REVIEW", "DENY"],
}

export function useLicenseWorkflow(): UseLicenseWorkflowReturn {
  const [state, setState] = useState<WorkflowState>({
    processing: false,
    error: null,
    success: false,
  })

  const canPerformAction = useCallback(
    (currentStatus: LicenseStatus, action: LicenseAction): boolean => {
      const allowedActions = statusTransitions[currentStatus] || []
      return allowedActions.includes(action)
    },
    []
  )

  const performAction = useCallback(async (licenseNumber: string, action: LicenseAction) => {
    setState({ processing: true, error: null, success: false })

    try {
      await updateLicense(licenseNumber, action)
      setState({ processing: false, error: null, success: true })
    } catch (err: any) {
      setState({
        processing: false,
        error: err.message || "Failed to perform action",
        success: false,
      })
      throw err
    }
  }, [])

  const resetState = useCallback(() => {
    setState({ processing: false, error: null, success: false })
  }, [])

  return {
    state,
    canPerformAction,
    performAction,
    resetState,
  }
}

// Helper function to get human-readable action labels
export function getActionLabel(action: LicenseAction): string {
  const labels: Record<LicenseAction, string> = {
    APPROVE: "Approve License",
    DENY: "Deny License",
    SUSPEND: "Suspend License",
    SET_EXPIRED: "Mark as Expired",
    REVIEW: "Under Review",
    RENEWAL_REVIEW: "Review Renewal",
    REQUEST_INFO: "Request Information",
  }
  return labels[action]
}

// Helper function to get action descriptions
export function getActionDescription(action: LicenseAction): string {
  const descriptions: Record<LicenseAction, string> = {
    APPROVE: "Approve this license and activate it",
    DENY: "Deny this license application",
    SUSPEND: "Temporarily suspend this license",
    SET_EXPIRED: "Mark this license as expired",
    REVIEW: "Move this license to review status",
    RENEWAL_REVIEW: "Review the renewal application for this license",
    REQUEST_INFO: "Request additional information from the applicant",
  }
  return descriptions[action]
}

// Helper function to get suggested actions based on status
export function getSuggestedActions(currentStatus: LicenseStatus): LicenseAction[] {
  return statusTransitions[currentStatus] || []
}

// Helper function to get next status after an action
export function getNextStatus(action: LicenseAction): LicenseStatus | null {
  const nextStatus: Partial<Record<LicenseAction, LicenseStatus>> = {
    APPROVE: "Active",
    DENY: "Denied",
    SUSPEND: "Suspended",
    SET_EXPIRED: "Expired",
    REVIEW: "In Review",
    RENEWAL_REVIEW: "Renewal Reviewed",
    REQUEST_INFO: "Info Requested",
  }
  return nextStatus[action] || null
}
