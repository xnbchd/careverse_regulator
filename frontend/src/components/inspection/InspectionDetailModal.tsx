import { Modal, Button, Divider, Space } from 'antd'
import { CalendarOutlined, UserOutlined, IdcardOutlined, FileTextOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import type { Inspection } from '@/types/inspection'
import StatusBadge from './StatusBadge'

interface InspectionDetailModalProps {
  open: boolean
  onClose: () => void
  inspection: Inspection | null
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

export default function InspectionDetailModal({ open, onClose, inspection }: InspectionDetailModalProps) {
  const { isMobile } = useResponsive()

  if (!inspection) return null

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#101828', marginBottom: '4px' }}>
            Scheduled Inspection
          </div>
          <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#475467', fontWeight: 400 }}>
            {inspection.inspectionId}
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'flex-end', gap: '8px' }}>
          <Button
            size={isMobile ? 'middle' : 'large'}
            style={{
              borderColor: '#d0d5dd',
              width: isMobile ? '100%' : 'auto',
            }}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            style={{ backgroundColor: '#11b5a1', borderColor: '#11b5a1', width: isMobile ? '100%' : 'auto' }}
            onClick={() => {
              console.log('Start inspection:', inspection)
              onClose()
            }}
          >
            Start Inspection
          </Button>
        </div>
      }
      width={isMobile ? '100%' : 700}
      style={isMobile ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}}
      bodyStyle={isMobile ? { maxHeight: 'calc(100vh - 150px)', overflowY: 'auto', padding: isMobile ? '16px' : '24px' } : { padding: '24px' }}
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
          <div style={{ fontSize: isMobile ? '18px' : '20px', fontWeight: 600, color: '#101828', marginBottom: '8px' }}>
            {inspection.facilityName}
          </div>
          <StatusBadge status={inspection.status} />
        </div>

        {/* Info Grid */}
        <Space direction="vertical" size={isMobile ? 16 : 20} style={{ width: '100%', marginBottom: '20px' }}>
          <InfoRow
            icon={<CalendarOutlined />}
            label="Inspection Date"
            value={inspection.date}
            isMobile={isMobile}
          />
          <InfoRow
            icon={<UserOutlined />}
            label="Inspector"
            value={inspection.inspector}
            isMobile={isMobile}
          />
          <InfoRow
            icon={<IdcardOutlined />}
            label="Inspection ID"
            value={inspection.inspectionId}
            isMobile={isMobile}
          />
        </Space>

        <Divider style={{ margin: '20px 0' }} />

        {/* Notes Section */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FileTextOutlined style={{ fontSize: '16px', color: '#667085' }} />
            <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#101828' }}>
              Note to Inspector
            </div>
          </div>
          <div
            style={{
              fontSize: isMobile ? '13px' : '14px',
              color: '#475467',
              lineHeight: '22px',
              padding: isMobile ? '12px' : '16px',
              backgroundColor: '#FFFAEB',
              borderRadius: '8px',
              border: '1px solid #FEDF89',
            }}
          >
            {inspection.noteToInspector || 'No additional notes provided'}
          </div>
        </div>

        {/* Checklist Section */}
        <div
          style={{
            padding: isMobile ? '16px' : '20px',
            backgroundColor: '#F0F9FF',
            borderRadius: '12px',
            border: '1px solid #B9E6FE',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <CheckCircleOutlined style={{ fontSize: '18px', color: '#0284C7' }} />
            <div style={{ fontSize: isMobile ? '14px' : '15px', fontWeight: 600, color: '#0284C7' }}>
              Inspection Checklist
            </div>
          </div>
          <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#0369A1', lineHeight: '24px' }}>
            <ul style={{ margin: 0, paddingLeft: isMobile ? '20px' : '24px' }}>
              <li>Verify facility licensing and permits</li>
              <li>Inspect safety equipment and emergency systems</li>
              <li>Review staff credentials and certifications</li>
              <li>Check infection control protocols</li>
              <li>Evaluate patient care standards</li>
              <li>Document all findings with photos/evidence</li>
            </ul>
          </div>
        </div>
      </div>
    </Modal>
  )
}
