import { useEffect, useState } from 'react'
import { Button, Empty, Badge } from 'antd'
import { ProCard } from '@ant-design/pro-components'
import { useInspectionStore } from '@/stores/inspectionStore'
import type { Inspection, Finding } from '@/types/inspection'
import { useFindingsStore } from '@/stores/findingsStore'
import * as inspectionApi from '@/api/inspectionApi'
import { useResponsive } from '@/hooks/useResponsive'
import { showSuccess, showError, extractErrorMessage } from '@/utils/toast'
import InspectionTable from './InspectionTable'
import InspectionCard from './InspectionCard'
import InspectionFilters from './InspectionFilters'
import type { DateRange } from './DateRangeSelector'
import ScheduleInspectionModal from './ScheduleInspectionModal'
import InspectionDetailModal from './InspectionDetailModal'
import FindingsTable from './FindingsTable'
import FindingCard from './FindingCard'
import FindingsFilters from './FindingsFilters'
import FindingsDrawer from './FindingsDrawer'
import PaginationControls from './PaginationControls'
import dayjs from 'dayjs'

interface InspectionViewProps {
  onNavigate: (route: string) => void
  company?: string | null
}

export default function InspectionView({ onNavigate, company }: InspectionViewProps) {
  const { inspections, facilities, professionals, loading, error, activeTab, setActiveTab, pagination, setPage, fetchInspections, fetchFacilities, fetchProfessionals, createInspection } = useInspectionStore()
  const { findings, fetchFindings } = useFindingsStore()
  const { isMobile, isTablet } = useResponsive()

  // Inspection tab state
  const [searchText, setSearchText] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isInspectionDetailModalVisible, setIsInspectionDetailModalVisible] = useState(false)
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null)
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['all'])
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | 'recent'>('asc')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [formData, setFormData] = useState({
    facility: '',
    inspector: '',
    date: dayjs().format('DD/MM/YYYY'),
    note: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [modalError, setModalError] = useState<string | null>(null)

  // Findings tab state
  const [findingsSearchText, setFindingsSearchText] = useState('')
  const [findingsDateRange, setFindingsDateRange] = useState<DateRange | null>(null)
  const [selectedSeverities, setSelectedSeverities] = useState<string[]>(['all'])
  const [selectedFindingStatuses, setSelectedFindingStatuses] = useState<string[]>(['all'])
  const [findingsSortOrder, setFindingsSortOrder] = useState<'asc' | 'desc' | 'recent'>('asc')
  const [selectedFindingRowKeys, setSelectedFindingRowKeys] = useState<React.Key[]>([])
  const [selectedInspectionForDrawer, setSelectedInspectionForDrawer] = useState<Inspection | null>(null)
  const [loadingInspectionDetails, setLoadingInspectionDetails] = useState(false)
  const [isFindingModalVisible, setIsFindingModalVisible] = useState(false)

  // Calculate active findings filter count
  const activeFindingsFiltersCount =
    (findingsSearchText ? 1 : 0) +
    (!selectedSeverities.includes('all') ? 1 : 0) +
    (!selectedFindingStatuses.includes('all') ? 1 : 0) +
    (findingsDateRange ? 1 : 0)

  useEffect(() => {
    fetchInspections()
    fetchFacilities()
    fetchProfessionals()
  }, [])

  // Fetch inspections when filters change (Scheduled Inspections tab)
  useEffect(() => {
    if (activeTab === 'scheduled') {
      const filters: any = {}
      if (searchText) filters.search = searchText
      if (dateRange) {
        filters.startDate = dateRange.start
        filters.endDate = dateRange.end
      }
      if (sortOrder === 'asc') {
        filters.sortBy = 'facility_name'
        filters.sortOrder = 'asc'
      } else if (sortOrder === 'desc') {
        filters.sortBy = 'facility_name'
        filters.sortOrder = 'desc'
      } else {
        filters.sortBy = 'modified'
        filters.sortOrder = 'desc'
      }

      // Add status filter (only if not 'all')
      if (!selectedStatuses.includes('all')) {
        filters.status = selectedStatuses.join(',')
      }

      fetchInspections(1, filters)
    }
  }, [searchText, selectedStatuses, dateRange, sortOrder, activeTab])

  // Fetch findings when filters change (Findings tab)
  useEffect(() => {
    if (activeTab === 'findings') {
      const filters: any = {}
      if (findingsSearchText) filters.search = findingsSearchText
      if (findingsDateRange) {
        filters.startDate = findingsDateRange.start
        filters.endDate = findingsDateRange.end
      }
      if (findingsSortOrder === 'asc') {
        filters.sortBy = 'facility_name'
        filters.sortOrder = 'asc'
      } else if (findingsSortOrder === 'desc') {
        filters.sortBy = 'facility_name'
        filters.sortOrder = 'desc'
      } else {
        filters.sortBy = 'modified'
        filters.sortOrder = 'desc'
      }

      // Add severity filter (API-driven)
      if (!selectedSeverities.includes('all')) {
        filters.severity = selectedSeverities.join(',')
      }

      // Add status filter (API-driven)
      if (!selectedFindingStatuses.includes('all')) {
        filters.status = selectedFindingStatuses.join(',')
      }

      fetchFindings(filters)
    }
  }, [findingsSearchText, selectedSeverities, selectedFindingStatuses, findingsDateRange, findingsSortOrder, activeTab])

  // Get facilities and professionals from the store
  const allFacilities = facilities.map((f) => ({ value: f.name, label: f.facility_name }))
  const allInspectors = professionals.map((p) => ({ value: p.name, label: p.full_name }))

  // Calculate active filter count for inspections
  const activeInspectionFiltersCount =
    (searchText ? 1 : 0) +
    (!selectedStatuses.includes('all') ? 1 : 0) +
    (dateRange ? 1 : 0)

  // Use inspections directly from store (API-filtered)
  const filteredInspections = inspections

  const handleScheduleInspection = async () => {
    setSubmitting(true)
    setModalError(null)

    try {
      await createInspection(formData)
      showSuccess('Inspection scheduled successfully')
      setIsModalVisible(false)
      setFormData({
        facility: '',
        inspector: '',
        date: dayjs().format('DD/MM/YYYY'),
        note: '',
      })
    } catch (error) {
      const errorMessage = extractErrorMessage(error)
      setModalError(errorMessage)
      showError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleViewInspection = (inspection: Inspection) => {
    setSelectedInspection(inspection)
    setIsInspectionDetailModalVisible(true)
  }

  // Use findings directly from store (API-filtered)
  const filteredFindings = findings

  const handleViewFinding = async (finding: Finding) => {
    if (!finding.inspectionId || loadingInspectionDetails) return

    setLoadingInspectionDetails(true)
    try {
      const fullInspection = await inspectionApi.getInspection(finding.inspectionId)
      setSelectedInspectionForDrawer(fullInspection)
      setIsFindingModalVisible(true)
    } catch (error) {
      showError('Failed to load inspection details')
    } finally {
      setLoadingInspectionDetails(false)
    }
  }

  return (
    <div className="inspection-shell" style={{ padding: isMobile ? '16px' : '24px' }}>
      <ProCard ghost style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'flex-start', gap: isMobile ? '16px' : '0' }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', color: '#000' }}>
              Inspection Management
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: isMobile ? '14px' : '16px', fontWeight: 600, color: '#8c8c8c' }}>
              Schedule & View Facility Inspections
            </p>

            <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', marginTop: isMobile ? '16px' : '29px', overflowX: 'auto' }}>
              <div
                style={{
                  borderBottom: activeTab === 'scheduled' ? '2px solid #11b5a1' : 'none',
                  paddingBottom: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setActiveTab('scheduled')}
              >
                <span
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 600,
                    color: activeTab === 'scheduled' ? '#11b5a1' : '#667085',
                  }}
                >
                  Scheduled Inspections
                </span>
              </div>
              <div
                style={{
                  borderBottom: activeTab === 'findings' ? '2px solid #11b5a1' : 'none',
                  paddingBottom: '11px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => setActiveTab('findings')}
              >
                <span
                  style={{
                    fontSize: isMobile ? '13px' : '14px',
                    fontWeight: 600,
                    color: activeTab === 'findings' ? '#11b5a1' : '#667085',
                  }}
                >
                  Inspection Findings
                </span>
              </div>
            </div>
          </div>

          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            onClick={() => {
              setIsModalVisible(true)
              setModalError(null)
            }}
            block={isMobile}
            style={{
              backgroundColor: '#11b5a1',
              borderColor: '#11b5a1',
              borderRadius: '10px',
              height: isMobile ? '40px' : '44px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 600,
            }}
          >
            Schedule Inspection
          </Button>
        </div>
      </ProCard>

      {activeTab === 'scheduled' && (
        <>
          {filteredInspections.length === 0 && searchText === '' && selectedStatuses.includes('all') ? (
            <ProCard style={{ marginTop: '80px' }}>
              <Empty
                description={
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#101828', margin: '8px 0' }}>
                      No Scheduled Inspections found
                    </p>
                    <p style={{ fontSize: '14px', color: '#475467', margin: 0 }}>
                      Click on "Schedule Inspection" to input new records
                    </p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </ProCard>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: isMobile ? '16px' : '24px',
                }}
              >
                <InspectionFilters
                  searchText={searchText}
                  onSearchChange={setSearchText}
                  selectedStatuses={selectedStatuses}
                  onStatusChange={setSelectedStatuses}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange}
                  sortOrder={sortOrder}
                  onSortChange={setSortOrder}
                  activeFilterCount={activeInspectionFiltersCount}
                />
              </div>

              {isMobile || isTablet ? (
                <div>
                  {filteredInspections.map((inspection) => (
                    <InspectionCard
                      key={inspection.id}
                      inspection={inspection}
                      onView={handleViewInspection}
                    />
                  ))}
                </div>
              ) : (
                <InspectionTable
                  inspections={filteredInspections}
                  selectedRowKeys={selectedRowKeys}
                  onSelectionChange={setSelectedRowKeys}
                  onViewInspection={handleViewInspection}
                />
              )}

              <PaginationControls
                pagination={pagination}
                onPageChange={setPage}
                isMobile={isMobile}
              />
            </>
          )}
        </>
      )}

      {activeTab === 'findings' && (
        <>
          {filteredFindings.length === 0 &&
          findingsSearchText === '' &&
          selectedSeverities.includes('all') &&
          selectedFindingStatuses.includes('all') ? (
            <ProCard style={{ marginTop: '80px' }}>
              <Empty
                description={
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '18px', fontWeight: 600, color: '#101828', margin: '8px 0' }}>
                      No Inspection Findings available
                    </p>
                    <p style={{ fontSize: '14px', color: '#475467', margin: 0 }}>
                      Inspection findings will appear here once inspections are completed
                    </p>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            </ProCard>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  marginBottom: isMobile ? '16px' : '24px',
                }}
              >
                <FindingsFilters
                  searchText={findingsSearchText}
                  onSearchChange={setFindingsSearchText}
                  selectedSeverities={selectedSeverities}
                  onSeverityChange={setSelectedSeverities}
                  selectedStatuses={selectedFindingStatuses}
                  onStatusChange={setSelectedFindingStatuses}
                  dateRange={findingsDateRange}
                  onDateRangeChange={setFindingsDateRange}
                  sortOrder={findingsSortOrder}
                  onSortChange={setFindingsSortOrder}
                  activeFilterCount={activeFindingsFiltersCount}
                />
              </div>

              {isMobile || isTablet ? (
                <div>
                  {filteredFindings.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      finding={finding}
                      onView={handleViewFinding}
                    />
                  ))}
                </div>
              ) : (
                <FindingsTable
                  findings={filteredFindings}
                  selectedRowKeys={selectedFindingRowKeys}
                  onSelectionChange={setSelectedFindingRowKeys}
                  onViewFinding={handleViewFinding}
                />
              )}
            </>
          )}
        </>
      )}

      <ScheduleInspectionModal
        open={isModalVisible}
        onClose={() => {
          setIsModalVisible(false)
          setModalError(null)
        }}
        onSubmit={handleScheduleInspection}
        formData={formData}
        setFormData={setFormData}
        facilities={allFacilities}
        inspectors={allInspectors}
        loading={submitting}
        error={modalError}
      />

      <InspectionDetailModal
        open={isInspectionDetailModalVisible}
        onClose={() => {
          setIsInspectionDetailModalVisible(false)
          setSelectedInspection(null)
        }}
        inspection={selectedInspection}
      />

      <FindingsDrawer
        open={isFindingModalVisible}
        onClose={() => {
          setIsFindingModalVisible(false)
          setSelectedInspectionForDrawer(null)
        }}
        inspection={selectedInspectionForDrawer}
      />
    </div>
  )
}
