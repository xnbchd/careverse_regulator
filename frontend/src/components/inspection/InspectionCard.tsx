import { Card, Button, Space, Tag } from 'antd'
import { CalendarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons'
import type { Inspection } from '@/types/inspection'
import StatusBadge from './StatusBadge'
import dayjs from 'dayjs'

interface InspectionCardProps {
  inspection: Inspection
  onView: (inspection: Inspection) => void
}

function isInspectionOverdue(inspection: Inspection): boolean {
  if (inspection.status !== 'Pending') return false
  const today = dayjs().startOf('day')
  const inspectionDate = dayjs(inspection.date, 'DD/MM/YYYY')
  return inspectionDate.isBefore(today)
}

export default function InspectionCard({ inspection, onView }: InspectionCardProps) {
  return (
    <Card
      style={{
        marginBottom: '12px',
        borderRadius: '8px',
        border: isInspectionOverdue(inspection) ? '2px solid #ff4d4f' : '1px solid #EAECF0',
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#667085', marginBottom: '4px' }}>
                {inspection.inspectionId}
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#101828' }}>
                {inspection.facilityName}
              </div>
            </div>
            {isInspectionOverdue(inspection) && (
              <Tag color="red" style={{ marginLeft: '8px' }}>Overdue</Tag>
            )}
          </div>
          <StatusBadge status={inspection.status} />
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475467' }}>
          <CalendarOutlined style={{ color: '#667085' }} />
          <span>{inspection.date}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#475467' }}>
          <UserOutlined style={{ color: '#667085' }} />
          <span>{inspection.inspector}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#475467' }}>
          <FileTextOutlined style={{ color: '#667085', marginTop: '2px' }} />
          <span style={{ flex: 1, lineHeight: '20px' }}>{inspection.noteToInspector}</span>
        </div>
      </Space>

      <Button
        type="primary"
        block
        onClick={() => onView(inspection)}
        style={{
          marginTop: '16px',
          backgroundColor: '#11b5a1',
          borderColor: '#11b5a1',
        }}
      >
        View Details
      </Button>
    </Card>
  )
}
