export interface GovernanceSettings {
  defaultInspectionFrequency: number // days
  complianceGracePeriod: number // days
  autoApprovalThreshold: number // percentage
  requireDualApproval: boolean
  enableAutoReminders: boolean
}

export interface ThresholdSettings {
  criticalFindingThreshold: number // count
  overdueDaysWarning: number // days
  overdueDaysCritical: number // days
  minStaffRequirement: number // count
  facilityCapacityThreshold: number // percentage
}

export interface SystemSettings {
  enableNotifications: boolean
  notificationFrequency: "realtime" | "daily" | "weekly"
  defaultLanguage: string
  timezone: string
  dateFormat: string
  enableDarkMode: boolean
}

export interface RegulatorSettings {
  governance: GovernanceSettings
  thresholds: ThresholdSettings
  system: SystemSettings
}
