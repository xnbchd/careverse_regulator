import { create } from "zustand"
import type { RegulatorSettings } from "@/types/settings"

// Mock default settings
const defaultSettings: RegulatorSettings = {
  governance: {
    defaultInspectionFrequency: 90,
    complianceGracePeriod: 30,
    autoApprovalThreshold: 95,
    requireDualApproval: true,
    enableAutoReminders: true,
  },
  thresholds: {
    criticalFindingThreshold: 3,
    overdueDaysWarning: 7,
    overdueDaysCritical: 14,
    minStaffRequirement: 5,
    facilityCapacityThreshold: 80,
  },
  system: {
    enableNotifications: true,
    notificationFrequency: "realtime",
    defaultLanguage: "en",
    timezone: "Africa/Nairobi",
    dateFormat: "DD/MM/YYYY",
    enableDarkMode: false,
  },
}

interface SettingsState {
  settings: RegulatorSettings
  originalSettings: RegulatorSettings
  hasChanges: boolean
  isLoading: boolean
  isSaving: boolean

  // Actions
  initialize: () => void
  updateGovernance: (updates: Partial<RegulatorSettings["governance"]>) => void
  updateThresholds: (updates: Partial<RegulatorSettings["thresholds"]>) => void
  updateSystem: (updates: Partial<RegulatorSettings["system"]>) => void
  saveSettings: () => Promise<void>
  resetSettings: () => void
  resetToDefaults: () => void
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: defaultSettings,
  originalSettings: defaultSettings,
  hasChanges: false,
  isLoading: false,
  isSaving: false,

  initialize: () => {
    // In a real app, this would fetch from API
    const settings = { ...defaultSettings }
    set({
      settings,
      originalSettings: settings,
      hasChanges: false,
      isLoading: false,
    })
  },

  updateGovernance: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        governance: { ...state.settings.governance, ...updates },
      },
      hasChanges: true,
    }))
  },

  updateThresholds: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        thresholds: { ...state.settings.thresholds, ...updates },
      },
      hasChanges: true,
    }))
  },

  updateSystem: (updates) => {
    set((state) => ({
      settings: {
        ...state.settings,
        system: { ...state.settings.system, ...updates },
      },
      hasChanges: true,
    }))
  },

  saveSettings: async () => {
    set({ isSaving: true })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    set((state) => ({
      originalSettings: state.settings,
      hasChanges: false,
      isSaving: false,
    }))
  },

  resetSettings: () => {
    set((state) => ({
      settings: state.originalSettings,
      hasChanges: false,
    }))
  },

  resetToDefaults: () => {
    set({
      settings: defaultSettings,
      hasChanges: true,
    })
  },
}))
