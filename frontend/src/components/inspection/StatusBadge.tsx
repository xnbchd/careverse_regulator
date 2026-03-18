import { Tag } from 'antd'
import type { Inspection } from '@/stores/inspectionStore'

interface StatusBadgeProps {
  status: Inspection['status']
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig = {
    'Non Compliant': {
      color: '#FFFAEB',
      borderColor: '#FEDF89',
      textColor: '#B54708',
      text: 'Non Compliant',
    },
    'Completed': {
      color: '#ECFDF3',
      borderColor: '#ABEFC6',
      textColor: '#067647',
      text: 'Completed',
    },
    'Pending': {
      color: '#FEF3F2',
      borderColor: '#FECDCA',
      textColor: '#B42318',
      text: 'Pending',
    },
  }

  const config = statusConfig[status]

  return (
    <Tag
      style={{
        backgroundColor: config.color,
        borderColor: config.borderColor,
        color: config.textColor,
        padding: '2px 10px 2px 8px',
        borderRadius: '16px',
        fontSize: '14px',
        fontWeight: 500,
        border: '1px solid',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: config.textColor,
        }}
      />
      {config.text}
    </Tag>
  )
}
