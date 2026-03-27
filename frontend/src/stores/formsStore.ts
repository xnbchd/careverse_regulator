import { create } from "zustand"
import { persist } from "zustand/middleware"
import type {
  FormDraft,
  FormType,
  LicenseApplicationData,
  LicenseRenewalData,
  LicenseAppealData,
  FormSubmission,
} from "@/types/forms"
import {
  submitLicenseApplication,
  submitLicenseRenewal,
  submitLicenseAppeal,
  getFormSubmission,
  listFormSubmissions,
} from "@/api/formsApi"

interface FormsState {
  // Drafts
  drafts: FormDraft[]
  activeDraft: FormDraft | null

  // Submissions
  submissions: FormSubmission[]
  currentSubmission: FormSubmission | null
  submissionsLoading: boolean
  submissionsError: string | null

  // Form state
  isSubmitting: boolean
  submitError: string | null

  // Draft actions
  saveDraft: (formType: FormType, data: any, currentStep: number) => void
  loadDraft: (draftId: string) => FormDraft | null
  deleteDraft: (draftId: string) => void
  clearActiveDraft: () => void
  cleanupExpiredDrafts: () => void

  // Submission actions
  submitApplication: (data: LicenseApplicationData) => Promise<FormSubmission>
  submitRenewal: (data: LicenseRenewalData) => Promise<FormSubmission>
  submitAppeal: (data: LicenseAppealData) => Promise<FormSubmission>
  fetchSubmission: (submissionId: string) => Promise<void>
  fetchSubmissions: (filters?: any) => Promise<void>
  clearSubmitError: () => void
}

const DRAFT_EXPIRY_DAYS = 30

export const useFormsStore = create<FormsState>()(
  persist(
    (set, get) => ({
      // Initial state
      drafts: [],
      activeDraft: null,
      submissions: [],
      currentSubmission: null,
      submissionsLoading: false,
      submissionsError: null,
      isSubmitting: false,
      submitError: null,

      // Save draft to localStorage
      saveDraft: (formType, data, currentStep) => {
        const existingDraftIndex = get().drafts.findIndex(
          (d) => d.formType === formType && d.data.licenseNumber === data.licenseNumber
        )

        const draft: FormDraft = {
          id:
            existingDraftIndex >= 0
              ? get().drafts[existingDraftIndex].id
              : `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          formType,
          data,
          currentStep,
          lastSaved: new Date().toISOString(),
          expiresAt: new Date(Date.now() + DRAFT_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
        }

        if (existingDraftIndex >= 0) {
          // Update existing draft
          const newDrafts = [...get().drafts]
          newDrafts[existingDraftIndex] = draft
          set({ drafts: newDrafts, activeDraft: draft })
        } else {
          // Add new draft
          set({
            drafts: [...get().drafts, draft],
            activeDraft: draft,
          })
        }
      },

      // Load draft by ID
      loadDraft: (draftId) => {
        const draft = get().drafts.find((d) => d.id === draftId)
        if (draft) {
          // Check if expired
          if (new Date(draft.expiresAt) < new Date()) {
            get().deleteDraft(draftId)
            return null
          }
          set({ activeDraft: draft })
          return draft
        }
        return null
      },

      // Delete draft
      deleteDraft: (draftId) => {
        set({
          drafts: get().drafts.filter((d) => d.id !== draftId),
          activeDraft: get().activeDraft?.id === draftId ? null : get().activeDraft,
        })
      },

      // Clear active draft
      clearActiveDraft: () => {
        set({ activeDraft: null })
      },

      // Cleanup expired drafts
      cleanupExpiredDrafts: () => {
        const now = new Date()
        set({
          drafts: get().drafts.filter((d) => new Date(d.expiresAt) >= now),
        })
      },

      // Submit license application
      submitApplication: async (data) => {
        set({ isSubmitting: true, submitError: null })
        try {
          const submission = await submitLicenseApplication(data)

          // Remove draft if exists
          const draftToRemove = get().drafts.find(
            (d) => d.formType === "license_application" && d.data.facilityName === data.facilityName
          )
          if (draftToRemove) {
            get().deleteDraft(draftToRemove.id)
          }

          set({
            isSubmitting: false,
            currentSubmission: submission,
            submissions: [submission, ...get().submissions],
          })

          return submission
        } catch (error) {
          set({
            isSubmitting: false,
            submitError: error instanceof Error ? error.message : "Failed to submit application",
          })
          throw error
        }
      },

      // Submit license renewal
      submitRenewal: async (data) => {
        set({ isSubmitting: true, submitError: null })
        try {
          const submission = await submitLicenseRenewal(data)

          // Remove draft if exists
          const draftToRemove = get().drafts.find(
            (d) => d.formType === "license_renewal" && d.data.licenseNumber === data.licenseNumber
          )
          if (draftToRemove) {
            get().deleteDraft(draftToRemove.id)
          }

          set({
            isSubmitting: false,
            currentSubmission: submission,
            submissions: [submission, ...get().submissions],
          })

          return submission
        } catch (error) {
          set({
            isSubmitting: false,
            submitError: error instanceof Error ? error.message : "Failed to submit renewal",
          })
          throw error
        }
      },

      // Submit license appeal
      submitAppeal: async (data) => {
        set({ isSubmitting: true, submitError: null })
        try {
          const submission = await submitLicenseAppeal(data)

          // Remove draft if exists
          const draftToRemove = get().drafts.find(
            (d) => d.formType === "license_appeal" && d.data.licenseNumber === data.licenseNumber
          )
          if (draftToRemove) {
            get().deleteDraft(draftToRemove.id)
          }

          set({
            isSubmitting: false,
            currentSubmission: submission,
            submissions: [submission, ...get().submissions],
          })

          return submission
        } catch (error) {
          set({
            isSubmitting: false,
            submitError: error instanceof Error ? error.message : "Failed to submit appeal",
          })
          throw error
        }
      },

      // Fetch single submission
      fetchSubmission: async (submissionId) => {
        set({ submissionsLoading: true, submissionsError: null })
        try {
          const submission = await getFormSubmission(submissionId)
          set({
            currentSubmission: submission,
            submissionsLoading: false,
          })
        } catch (error) {
          set({
            submissionsError: error instanceof Error ? error.message : "Failed to fetch submission",
            submissionsLoading: false,
          })
        }
      },

      // Fetch list of submissions
      fetchSubmissions: async (filters) => {
        set({ submissionsLoading: true, submissionsError: null })
        try {
          const { submissions } = await listFormSubmissions(filters)
          set({
            submissions,
            submissionsLoading: false,
          })
        } catch (error) {
          set({
            submissionsError:
              error instanceof Error ? error.message : "Failed to fetch submissions",
            submissionsLoading: false,
          })
        }
      },

      // Clear submit error
      clearSubmitError: () => {
        set({ submitError: null })
      },
    }),
    {
      name: "forms-storage",
      partialize: (state) => ({
        drafts: state.drafts,
        // Don't persist submissions or loading states
      }),
    }
  )
)
