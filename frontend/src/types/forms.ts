import { z } from "zod"

// ============================================================================
// Common Types
// ============================================================================

export enum FormType {
  LICENSE_APPLICATION = "license_application",
  LICENSE_RENEWAL = "license_renewal",
  LICENSE_APPEAL = "license_appeal",
}

export enum FormStatus {
  DRAFT = "draft",
  SUBMITTED = "submitted",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export interface FormDraft {
  id: string
  formType: FormType
  data: any
  currentStep: number
  lastSaved: string
  expiresAt: string
}

// ============================================================================
// License Application Types
// ============================================================================

export interface LicenseApplicationData {
  // Step 1: Facility Information
  facilityName: string
  facilityType: string
  facilityAddress: string
  facilityCity: string
  facilityRegion: string
  facilityPostalCode: string
  facilityPhone: string
  facilityEmail: string
  facilityWebsite?: string

  // Step 2: License Details
  licenseType: string
  licenseCategory: string
  requestedStartDate: string
  numberOfBeds?: number
  servicesOffered: string[]
  operatingHours: string
  emergencyServices: boolean

  // Step 3: Owner/Operator Information
  ownerName: string
  ownerIdNumber: string
  ownerPhone: string
  ownerEmail: string
  ownerAddress: string
  managingDirector?: string
  managingDirectorQualifications?: string

  // Step 4: Staff Information
  totalStaff: number
  medicalStaff: number
  nursingStaff: number
  supportStaff: number
  hasQualifiedPersonnel: boolean

  // Step 5: Documents
  documents: {
    facilityPlan?: File
    ownershipProof?: File
    staffCertificates?: File[]
    complianceDocuments?: File[]
    additionalDocuments?: File[]
  }

  // Additional Information
  additionalNotes?: string
}

// Zod validation schema for license application
export const licenseApplicationSchema = z.object({
  // Step 1: Facility Information
  facilityName: z.string().min(3, "Facility name must be at least 3 characters"),
  facilityType: z.string().min(1, "Please select a facility type"),
  facilityAddress: z.string().min(5, "Please enter a valid address"),
  facilityCity: z.string().min(2, "Please enter a city"),
  facilityRegion: z.string().min(1, "Please select a region"),
  facilityPostalCode: z.string().optional(),
  facilityPhone: z.string().min(10, "Please enter a valid phone number"),
  facilityEmail: z.string().email("Please enter a valid email address"),
  facilityWebsite: z.string().url("Please enter a valid URL").optional().or(z.literal("")),

  // Step 2: License Details
  licenseType: z.string().min(1, "Please select a license type"),
  licenseCategory: z.string().min(1, "Please select a license category"),
  requestedStartDate: z.string().min(1, "Please select a start date"),
  numberOfBeds: z.number().min(0).optional(),
  servicesOffered: z.array(z.string()).min(1, "Please select at least one service"),
  operatingHours: z.string().min(1, "Please specify operating hours"),
  emergencyServices: z.boolean(),

  // Step 3: Owner/Operator Information
  ownerName: z.string().min(3, "Owner name must be at least 3 characters"),
  ownerIdNumber: z.string().min(5, "Please enter a valid ID number"),
  ownerPhone: z.string().min(10, "Please enter a valid phone number"),
  ownerEmail: z.string().email("Please enter a valid email address"),
  ownerAddress: z.string().min(5, "Please enter a valid address"),
  managingDirector: z.string().optional(),
  managingDirectorQualifications: z.string().optional(),

  // Step 4: Staff Information
  totalStaff: z.number().min(1, "Total staff must be at least 1"),
  medicalStaff: z.number().min(0),
  nursingStaff: z.number().min(0),
  supportStaff: z.number().min(0),
  hasQualifiedPersonnel: z.boolean(),

  // Additional
  additionalNotes: z.string().optional(),
})

// ============================================================================
// License Renewal Types
// ============================================================================

export interface LicenseRenewalData {
  licenseNumber: string
  currentExpiryDate: string
  requestedRenewalDate: string

  // Verification of existing data
  facilityNameVerified: boolean
  facilityAddressVerified: boolean
  contactInfoVerified: boolean

  // Changes/Updates
  hasChanges: boolean
  facilityChanges?: {
    name?: string
    address?: string
    phone?: string
    email?: string
  }
  staffChanges?: {
    totalStaff: number
    medicalStaff: number
    nursingStaff: number
  }
  servicesChanges?: {
    added: string[]
    removed: string[]
  }

  // Documents
  documents: {
    renewalApplication?: File
    currentLicenseCopy?: File
    staffUpdates?: File[]
    complianceReports?: File[]
    additionalDocuments?: File[]
  }

  // Declarations
  noOutstandingViolations: boolean
  complianceWithRegulations: boolean
  additionalNotes?: string
}

// Zod validation schema for license renewal
export const licenseRenewalSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  currentExpiryDate: z.string().min(1, "Current expiry date is required"),
  requestedRenewalDate: z.string().min(1, "Please select a renewal date"),

  facilityNameVerified: z.boolean(),
  facilityAddressVerified: z.boolean(),
  contactInfoVerified: z.boolean(),

  hasChanges: z.boolean(),

  noOutstandingViolations: z.boolean().refine((val) => val === true, {
    message: "You must confirm there are no outstanding violations",
  }),
  complianceWithRegulations: z.boolean().refine((val) => val === true, {
    message: "You must confirm compliance with regulations",
  }),

  additionalNotes: z.string().optional(),
})

// ============================================================================
// License Appeal Types
// ============================================================================

export enum AppealGrounds {
  PROCEDURAL_ERROR = "procedural_error",
  NEW_EVIDENCE = "new_evidence",
  INCORRECT_FACTS = "incorrect_facts",
  DISPROPORTIONATE_PENALTY = "disproportionate_penalty",
  OTHER = "other",
}

export interface LicenseAppealData {
  // Appeal Information
  licenseNumber: string
  decisionDate: string
  decisionType: "denial" | "suspension" | "revocation" | "other"
  decisionReference?: string

  // Grounds for Appeal
  primaryGrounds: AppealGrounds
  secondaryGrounds?: AppealGrounds[]
  detailedExplanation: string

  // Supporting Information
  factualErrors?: string
  newEvidence?: string
  proceduralIssues?: string
  requestedRelief: string

  // Documents
  documents: {
    originalDecision?: File
    supportingEvidence?: File[]
    witnessStatements?: File[]
    expertReports?: File[]
    additionalDocuments?: File[]
  }

  // Contact Information
  appellantName: string
  appellantEmail: string
  appellantPhone: string
  legalRepresentative?: string
  legalRepEmail?: string
  legalRepPhone?: string

  // Declarations
  statementTruthfulness: boolean
  understandConsequences: boolean
  additionalNotes?: string
}

// Zod validation schema for license appeal
export const licenseAppealSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  decisionDate: z.string().min(1, "Decision date is required"),
  decisionType: z.enum(["denial", "suspension", "revocation", "other"]),
  decisionReference: z.string().optional(),

  primaryGrounds: z.nativeEnum(AppealGrounds),
  secondaryGrounds: z.array(z.nativeEnum(AppealGrounds)).optional(),
  detailedExplanation: z
    .string()
    .min(50, "Please provide a detailed explanation (at least 50 characters)"),

  factualErrors: z.string().optional(),
  newEvidence: z.string().optional(),
  proceduralIssues: z.string().optional(),
  requestedRelief: z
    .string()
    .min(20, "Please specify the relief you are requesting (at least 20 characters)"),

  appellantName: z.string().min(3, "Appellant name is required"),
  appellantEmail: z.string().email("Please enter a valid email address"),
  appellantPhone: z.string().min(10, "Please enter a valid phone number"),
  legalRepresentative: z.string().optional(),
  legalRepEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  legalRepPhone: z.string().optional(),

  statementTruthfulness: z.boolean().refine((val) => val === true, {
    message: "You must affirm that the statements are truthful",
  }),
  understandConsequences: z.boolean().refine((val) => val === true, {
    message: "You must acknowledge that you understand the consequences",
  }),

  additionalNotes: z.string().optional(),
})

// ============================================================================
// Form Submission Types
// ============================================================================

export interface FormSubmission {
  id: string
  formType: FormType
  submittedAt: string
  submittedBy: string
  status: FormStatus
  data: LicenseApplicationData | LicenseRenewalData | LicenseAppealData
  documents: {
    id: string
    name: string
    url: string
  }[]
  reviewNotes?: string
  reviewedBy?: string
  reviewedAt?: string
}

// ============================================================================
// Utility Types
// ============================================================================

export interface FormStep {
  id: string
  title: string
  description?: string
  optional?: boolean
}

export interface FormWizardProps {
  steps: FormStep[]
  currentStep: number
  data: any
  onStepChange: (step: number) => void
  onDataChange: (data: any) => void
  onSubmit: () => void
  onSaveDraft?: () => void
  isSubmitting?: boolean
  canGoNext: boolean
  canGoPrevious: boolean
}
