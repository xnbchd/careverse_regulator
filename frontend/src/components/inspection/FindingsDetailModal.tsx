import { Modal, Button, Space, Divider, Tag } from 'antd'
import {
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  FolderOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import type { Finding } from '@/stores/findingsStore'
import FindingsBadge from './FindingsBadge'

interface FindingsDetailModalProps {
  open: boolean
  onClose: () => void
  finding: Finding | null
}

const InfoRow = ({ icon, label, value, isMobile }: { icon: React.ReactNode; label: string; value: React.ReactNode; isMobile: boolean }) => (
  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
    <div style={{ color: '#667085', fontSize: '18px', marginTop: '2px' }}>
      {icon}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: isMobile ? '12px' : '13px', color: '#667085', marginBottom: '4px' }}>
        {label}
      </div>
      <div style={{ fontSize: isMobile ? '14px' : '15px', color: '#101828', fontWeight: 500 }}>
        {value}
      </div>
    </div>
  </div>
)

export default function FindingsDetailModal({ open, onClose, finding }: FindingsDetailModalProps) {
  const { isMobile } = useResponsive()

  if (!finding) return null

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#101828', marginBottom: '4px' }}>
            Inspection Finding
          </div>
          <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#475467', fontWeight: 400 }}>
            {finding.findingId}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          size={isMobile ? 'middle' : 'large'}
          block={isMobile}
          style={{ backgroundColor: '#11b5a1', borderColor: '#11b5a1' }}
          onClick={onClose}
        >
          Close
        </Button>
      }
      width={isMobile ? '100%' : 800}
      style={isMobile ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}}
      bodyStyle={isMobile ? { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: isMobile ? '16px' : '24px' } : { padding: '24px' }}
    >
      <div>
        {/* Facility Header */}
        <div
          style={{
            padding: isMobile ? '16px' : '20px',
            backgroundColor: '#F9FAFB',
            borderRadius: '12px',
            border: '1px solid #EAECF0',
            marginBottom: '20px',
          }}
        >
          <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#101828', marginBottom: '12px' }}>
            {finding.facilityName}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <FindingsBadge severity={finding.severity} />
            <FindingsBadge status={finding.status} />
            <Tag color="blue">{finding.category}</Tag>
          </div>
        </div>

        {/* Info Grid */}
        <Space direction="vertical" size={isMobile ? 16 : 20} style={{ width: '100%', marginBottom: '20px' }}>
          <InfoRow
            icon={<CalendarOutlined />}
            label="Inspection Date"
            value={finding.inspectionDate}
            isMobile={isMobile}
          />
          <InfoRow
            icon={<UserOutlined />}
            label="Inspector"
            value={finding.inspector}
            isMobile={isMobile}
          />
          <InfoRow
            icon={<ClockCircleOutlined />}
            label="Due Date"
            value={finding.dueDate}
            isMobile={isMobile}
          />
          {finding.resolvedDate && (
            <InfoRow
              icon={<CheckCircleOutlined />}
              label="Resolved Date"
              value={finding.resolvedDate}
              isMobile={isMobile}
            />
          )}
        </Space>

        <Divider style={{ margin: '20px 0' }} />

        {/* Description Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <WarningOutlined style={{ fontSize: '16px', color: '#DC2626' }} />
            <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#101828' }}>
              Finding Description
            </div>
          </div>
          <div
            style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#475467',
              lineHeight: '22px',
              padding: isMobile ? '12px' : '16px',
              backgroundColor: '#FEF3F2',
              borderRadius: '8px',
              border: '1px solid #FECDCA',
            }}
          >
            {finding.description}
          </div>
        </div>

        {/* Corrective Action */}
        {finding.correctiveAction && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <CheckCircleOutlined style={{ fontSize: '16px', color: '#059669' }} />
              <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#101828' }}>
                Corrective Action Required
              </div>
            </div>
            <div
              style={{
                fontSize: isMobile ? '13px' : '14px',
                color: '#475467',
                lineHeight: '22px',
                padding: isMobile ? '12px' : '16px',
                backgroundColor: '#ECFDF3',
                borderRadius: '8px',
                border: '1px solid #ABEFC6',
              }}
            >
              {finding.correctiveAction}
            </div>
          </div>
        )}

        {/* Evidence Section */}
        {finding.evidence && finding.evidence.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <FolderOutlined style={{ fontSize: '16px', color: '#667085' }} />
              <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#101828' }}>
                Evidence & Documentation
              </div>
            </div>
            <Space direction="vertical" style={{ width: '100%' }} size={8}>
              {finding.evidence.map((doc, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: isMobile ? '12px' : '14px',
                    border: '1px solid #D0D5DD',
                    borderRadius: '8px',
                    backgroundColor: '#F9FAFB',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    <FileTextOutlined style={{ fontSize: '18px', color: '#667085' }} />
                    <span
                      style={{
                        fontSize: isMobile ? '13px' : '14px',
                        color: '#101828',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {doc}
                    </span>
                  </div>
                  <Button
                    type="text"
                    icon={<DownloadOutlined />}
                    size={isMobile ? 'small' : 'middle'}
                    style={{ color: '#11b5a1', flexShrink: 0 }}
                  >
                    {!isMobile && 'Download'}
                  </Button>
                </div>
              ))}
            </Space>
          </div>
        )}
      </div>
    </Modal>
  )
}
