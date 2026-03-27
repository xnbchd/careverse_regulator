export interface DashboardMetric {
  id: string
  title: string
  value: string
  delta: string
  trend: "up" | "down" | "neutral"
}

export interface DashboardQueue {
  id: string
  title: string
  value: string
  detail: string
  route: string
  tone: "critical" | "attention" | "steady"
}

export interface DashboardModuleCard {
  id: string
  label: string
  description: string
  count: string
}

export interface DashboardAffiliationItem {
  id: string
  professionalName: string
  cadre: string
  facility: string
  status: "Pending" | "Confirmed" | "Escalated"
  company: string
  requestedAt: string
}

export interface DashboardScopeItem {
  id: string
  title: string
  value: string
  detail: string
}

export interface DashboardActivityItem {
  id: string
  title: string
  detail: string
  time: string
  route: string
}

export interface DashboardCompanyBoard {
  id: string
  unitName: string
  focus: string
  pendingRenewals: string
  activeCases: string
  inspectionBacklog: string
  slaCompliance: number
  route: string
}

export interface DashboardCountyRiskItem {
  id: string
  company: string
  county: string
  riskLevel: "Critical" | "High" | "Moderate" | "Stable"
  openInvestigations: string
  complianceRate: number
  note: string
  route: string
}

export interface DashboardDirectiveItem {
  id: string
  company: string
  title: string
  deadline: string
  owner: string
  status: "Due Today" | "Due This Week" | "On Track"
  route: string
}

export interface DashboardStateSnapshot {
  metrics: DashboardMetric[]
  priorityQueues: DashboardQueue[]
  moduleCards: DashboardModuleCard[]
  affiliations: DashboardAffiliationItem[]
  scopeItems: DashboardScopeItem[]
  recentActivity: DashboardActivityItem[]
  companyBoards: DashboardCompanyBoard[]
  countyRiskItems: DashboardCountyRiskItem[]
  directives: DashboardDirectiveItem[]
}

export interface DashboardState {
  activeInternalTab: string
  internalTabs: string[]
  metrics: DashboardStateSnapshot["metrics"]
  priorityQueues: DashboardStateSnapshot["priorityQueues"]
  moduleCards: DashboardStateSnapshot["moduleCards"]
  affiliations: DashboardStateSnapshot["affiliations"]
  scopeItems: DashboardStateSnapshot["scopeItems"]
  recentActivity: DashboardStateSnapshot["recentActivity"]
  companyBoards: DashboardStateSnapshot["companyBoards"]
  countyRiskItems: DashboardStateSnapshot["countyRiskItems"]
  directives: DashboardStateSnapshot["directives"]
  setActiveInternalTab: (tab: string) => void
  applyMockForCompany: (company?: string | null) => void
}
