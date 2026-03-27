import { create } from "zustand"
import type { DashboardState, DashboardStateSnapshot } from "@/types/dashboard"

const DEFAULT_COMPANY_LABEL = "Active company"

function normalizeCompanyLabel(company?: string | null): string {
  const normalized = (company || "").trim()
  return normalized || DEFAULT_COMPANY_LABEL
}

function hashSeed(input: string): number {
  let hash = 0
  for (let i = 0; i < input.length; i += 1) {
    hash = ((hash << 5) - hash + input.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

function seededValue(seed: number, min: number, max: number): number {
  if (max <= min) return min
  return min + (seed % (max - min + 1))
}

function formatCount(value: number): string {
  return value.toLocaleString("en-US")
}

function buildMockSnapshot(company?: string | null): DashboardStateSnapshot {
  const companyLabel = normalizeCompanyLabel(company)
  const seed = hashSeed(companyLabel)

  const renewals = seededValue(seed + 11, 72, 198)
  const inspectionsOverdue = seededValue(seed + 17, 12, 48)
  const escalations = seededValue(seed + 23, 8, 36)
  const disciplineCases = seededValue(seed + 29, 10, 42)
  const affiliationConflicts = seededValue(seed + 31, 6, 28)
  const facilitiesUnderWatch = seededValue(seed + 37, 240, 560)
  const practitionersMonitored = seededValue(seed + 41, 6200, 16800)
  const inspectionsThisMonth = seededValue(seed + 43, 64, 210)
  const countiesFlagged = seededValue(seed + 47, 3, 14)

  const licensingPending = seededValue(seed + 53, 24, 120)
  const licensingCases = seededValue(seed + 59, 6, 24)
  const licensingBacklog = seededValue(seed + 61, 8, 32)
  const licensingSla = seededValue(seed + 67, 70, 92)

  const inspectionPending = seededValue(seed + 71, 18, 92)
  const inspectionCases = seededValue(seed + 73, 4, 20)
  const inspectionBacklog = seededValue(seed + 79, 6, 28)
  const inspectionSla = seededValue(seed + 83, 68, 90)

  const enforcementPending = seededValue(seed + 89, 10, 48)
  const enforcementCases = seededValue(seed + 97, 8, 30)
  const enforcementBacklog = seededValue(seed + 101, 10, 40)
  const enforcementSla = seededValue(seed + 103, 60, 84)

  return {
    moduleCards: [
      {
        id: "facility-oversight",
        label: "Facility Oversight",
        description: "Facility licensing and compliance monitoring.",
        count: `${formatCount(licensingPending)} renewals pending`,
      },
      {
        id: "professional-licensing",
        label: "Professional Licensing",
        description: "Health worker progression and retention review.",
        count: `${formatCount(renewals)} renewals under review`,
      },
      {
        id: "enforcement",
        label: "Discipline & Enforcement",
        description: "Unlicensed practice and disciplinary case follow-up.",
        count: `${formatCount(enforcementCases)} active enforcement cases`,
      },
      {
        id: "affiliations",
        label: "Affiliation Integrity",
        description: "Professional-to-facility linkage validation.",
        count: `${formatCount(affiliationConflicts)} affiliation conflicts flagged`,
      },
    ],
    metrics: [
      {
        id: "renewals",
        title: "Applications awaiting decision",
        value: formatCount(renewals),
        delta: `${seededValue(seed + 107, 18, 74)} urgent`,
        trend: "up",
      },
      {
        id: "inspections",
        title: "Inspections overdue",
        value: formatCount(inspectionsOverdue),
        delta: `${countiesFlagged} counties`,
        trend: inspectionsOverdue > 30 ? "down" : "neutral",
      },
      {
        id: "alerts",
        title: "Escalations open",
        value: formatCount(escalations),
        delta: `${seededValue(seed + 109, 1, 9)} new today`,
        trend: "up",
      },
      {
        id: "discipline",
        title: "Disciplinary cases open",
        value: formatCount(disciplineCases),
        delta: `${seededValue(seed + 113, 4, 18)} hearing-ready`,
        trend: "neutral",
      },
    ],
    priorityQueues: [
      {
        id: "renewals-evidence",
        title: "Renewals pending evidence",
        value: formatCount(licensingPending),
        detail: "Files missing inspection attachments.",
        route: "license-management",
        tone: "attention",
      },
      {
        id: "retention-cpd",
        title: "Retention renewals pending CPD checks",
        value: formatCount(renewals),
        detail: "Declarations require CPD validation.",
        route: "license-management",
        tone: "attention",
      },
      {
        id: "unlicensed-practice",
        title: "Unlicensed practice alerts",
        value: formatCount(escalations),
        detail: "County and public reports awaiting action.",
        route: "users-roles",
        tone: "critical",
      },
      {
        id: "inspection-signoff",
        title: "County inspection reports pending sign-off",
        value: formatCount(inspectionsOverdue),
        detail: "Findings submitted but not closed.",
        route: "license-management",
        tone: "steady",
      },
      {
        id: "affiliation-conflicts",
        title: "Affiliation scope conflicts",
        value: formatCount(affiliationConflicts),
        detail: "Practice scope does not match service line.",
        route: "affiliations",
        tone: "critical",
      },
    ],
    affiliations: [
      {
        id: "a1",
        professionalName: "Agnes Njeri Kamau",
        cadre: "Registered Nurse",
        facility: "Embakasi Specialist Clinic",
        status: "Escalated",
        company: companyLabel,
        requestedAt: "Today, 08:45",
      },
      {
        id: "a2",
        professionalName: "Dr. Felix Onyango",
        cadre: "Medical Officer",
        facility: "Mombasa Care Centre",
        status: "Pending",
        company: companyLabel,
        requestedAt: "Today, 07:58",
      },
      {
        id: "a3",
        professionalName: "Beatrice Chepkirui",
        cadre: "Critical Care Nurse",
        facility: "Nakuru Heart and Trauma",
        status: "Pending",
        company: companyLabel,
        requestedAt: "Yesterday, 17:12",
      },
      {
        id: "a4",
        professionalName: "Dr. Ibrahim Abdullahi",
        cadre: "Dentist",
        facility: "Garissa Dental Unit",
        status: "Confirmed",
        company: companyLabel,
        requestedAt: "Yesterday, 11:06",
      },
    ],
    scopeItems: [
      {
        id: "facilities-under-watch",
        title: "Facilities under watch",
        value: formatCount(facilitiesUnderWatch),
        detail: "Licensed and provisional facilities under supervisory mandate.",
      },
      {
        id: "practitioners-monitored",
        title: "Practitioners monitored",
        value: formatCount(practitionersMonitored),
        detail: "Workforce records under retention and CPD supervision.",
      },
      {
        id: "inspections-this-month",
        title: "Inspections this month",
        value: formatCount(inspectionsThisMonth),
        detail: "County visits logged for enforcement and compliance checks.",
      },
      {
        id: "county-alerts",
        title: "Counties flagged high risk",
        value: formatCount(countiesFlagged),
        detail: "Counties with repeated compliance breaches and unresolved inspection actions.",
      },
    ],
    recentActivity: [
      {
        id: "r1",
        title: "Facility operating license suspended",
        detail: "Nairobi South inspection closed with suspension.",
        time: "10:14",
        route: "license-management",
      },
      {
        id: "r2",
        title: "Retention anomalies escalated",
        detail: "Declaration mismatch moved to pre-review.",
        time: "09:39",
        route: "license-management",
      },
      {
        id: "r3",
        title: "Taskforce resolved an unlicensed clinic report",
        detail: "Case closed after site verification.",
        time: "08:55",
        route: "regulator-settings",
      },
      {
        id: "r4",
        title: "Affiliation conflict cleared for Makueni maternity unit",
        detail: "Reviewer approved revised nurse assignment.",
        time: "08:12",
        route: "affiliations",
      },
    ],
    companyBoards: [
      {
        id: "licensing-desk",
        unitName: "Licensing Desk",
        focus: "License applications, renewals, and decision closure.",
        pendingRenewals: formatCount(licensingPending),
        activeCases: formatCount(licensingCases),
        inspectionBacklog: formatCount(licensingBacklog),
        slaCompliance: licensingSla,
        route: "license-management",
      },
      {
        id: "inspection-desk",
        unitName: "Inspection Desk",
        focus: "Inspection scheduling, findings, and closure follow-up.",
        pendingRenewals: formatCount(inspectionPending),
        activeCases: formatCount(inspectionCases),
        inspectionBacklog: formatCount(inspectionBacklog),
        slaCompliance: inspectionSla,
        route: "license-management",
      },
      {
        id: "enforcement-desk",
        unitName: "Enforcement Desk",
        focus: "Unlicensed practice escalation and disciplinary outcomes.",
        pendingRenewals: formatCount(enforcementPending),
        activeCases: formatCount(enforcementCases),
        inspectionBacklog: formatCount(enforcementBacklog),
        slaCompliance: enforcementSla,
        route: "users-roles",
      },
    ],
    countyRiskItems: [
      {
        id: "nairobi",
        company: companyLabel,
        county: "Nairobi",
        riskLevel: "Critical",
        openInvestigations: `${seededValue(seed + 127, 4, 11)} open investigations`,
        complianceRate: seededValue(seed + 131, 54, 74),
        note: "High complaint volume from private outpatient facilities.",
        route: "license-management",
      },
      {
        id: "mombasa",
        company: companyLabel,
        county: "Mombasa",
        riskLevel: "High",
        openInvestigations: `${seededValue(seed + 137, 3, 8)} open investigations`,
        complianceRate: seededValue(seed + 139, 62, 81),
        note: "Repeated CPD verification gaps.",
        route: "license-management",
      },
      {
        id: "kisumu",
        company: companyLabel,
        county: "Kisumu",
        riskLevel: "High",
        openInvestigations: `${seededValue(seed + 149, 2, 7)} open investigations`,
        complianceRate: seededValue(seed + 151, 66, 84),
        note: "Inspection findings awaiting closure evidence.",
        route: "license-management",
      },
      {
        id: "nakuru",
        company: companyLabel,
        county: "Nakuru",
        riskLevel: "Moderate",
        openInvestigations: `${seededValue(seed + 157, 1, 5)} open investigations`,
        complianceRate: seededValue(seed + 163, 72, 90),
        note: "Compliance improving after targeted follow-up.",
        route: "license-management",
      },
      {
        id: "uasin-gishu",
        company: companyLabel,
        county: "Uasin Gishu",
        riskLevel: "Stable",
        openInvestigations: `${seededValue(seed + 167, 1, 3)} open investigation`,
        complianceRate: seededValue(seed + 173, 80, 95),
        note: "Consistent closure of inspection actions.",
        route: "license-management",
      },
    ],
    directives: [
      {
        id: "d1",
        company: companyLabel,
        title: "Finalize private facility retention exceptions for council review",
        deadline: "March 12, 2026 · 17:00",
        owner: "Director, Licensing",
        status: "Due Today",
        route: "license-management",
      },
      {
        id: "d2",
        company: companyLabel,
        title: "Submit CPD variance summary for nursing renewals",
        deadline: "March 15, 2026",
        owner: "Head, Professional Regulation",
        status: "Due This Week",
        route: "license-management",
      },
      {
        id: "d3",
        company: companyLabel,
        title: "Publish county enforcement bulletin for unlicensed practice hotspots",
        deadline: "March 18, 2026",
        owner: "Enforcement Secretariat",
        status: "On Track",
        route: "regulator-settings",
      },
    ],
  }
}

const initialSnapshot = buildMockSnapshot()
const initialTabs = initialSnapshot.moduleCards.map((item) => item.label)

export const useDashboardStore = create<DashboardState>((set) => ({
  activeInternalTab: initialTabs[0],
  internalTabs: initialTabs,
  ...initialSnapshot,
  setActiveInternalTab: (tab: string) => set({ activeInternalTab: tab }),
  applyMockForCompany: (company?: string | null) =>
    set((state) => {
      const snapshot = buildMockSnapshot(company)
      const internalTabs = snapshot.moduleCards.map((item) => item.label)
      const activeInternalTab = internalTabs.includes(state.activeInternalTab)
        ? state.activeInternalTab
        : internalTabs[0]

      return {
        ...snapshot,
        internalTabs,
        activeInternalTab,
      }
    }),
}))
