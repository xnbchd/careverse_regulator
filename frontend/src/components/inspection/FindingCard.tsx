import { Card, Button, Space, Tag } from 'antd'
import { CalendarOutlined, InfoCircleOutlined } from '@ant-design/icons'
import type { Finding } from '@/types/inspection'
import FindingsBadge from './FindingsBadge'

interface FindingCardProps {
  finding: Finding
  onView: (finding: Finding) => void
}

export default function FindingCard({ finding, onView }: FindingCardProps) {
  return (
    <Card
      style={{
        marginBottom: '12px',
        borderRadius: '8px',
        border: '1px solid #EAECF0',
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: '#667085', marginBottom: '4px' }}>
              {finding.findingId}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#101828', marginBottom: '8px' }}>
              {finding.facilityName}
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <FindingsBadge severity={finding.severity} />
              <FindingsBadge status={finding.status} />
            </div>
          </div>
        </div>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size={8}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <Tag color="blue" style={{ margin: 0 }}>
            {finding.category}
          </Tag>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '14px', color: '#475467' }}>
          <InfoCircleOutlined style={{ color: '#667085', marginTop: '2px' }} />
          <span style={{ flex: 1, lineHeight: '20px' }}>{finding.description}</span>
        </div>
        <div style={{ fontSize: '13px', color: '#667085' }}>
          {finding.inspectionDate && `Inspection: ${finding.inspectionDate}`}
          {finding.dueDate && ` | Due: ${finding.dueDate}`}
          {finding.resolvedDate && ` | Resolved: ${finding.resolvedDate}`}
        </div>
      </Space>

      <Button
        type="primary"
        block
        onClick={() => onView(finding)}
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
