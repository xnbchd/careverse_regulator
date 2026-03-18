import { Tag } from 'antd'
import type { Finding } from '@/stores/findingsStore'

interface FindingsBadgeProps {
  severity?: Finding['severity']
  status?: Finding['status']
}

export default function FindingsBadge({ severity, status }: FindingsBadgeProps) {
  if (severity) {
    const severityConfig = {
      Critical: {
        color: '#FEF3F2',
        borderColor: '#FECDCA',
        textColor: '#B42318',
        text: 'Critical',
      },
      Major: {
        color: '#FFFAEB',
        borderColor: '#FEDF89',
        textColor: '#B54708',
        text: 'Major',
      },
      Minor: {
        color: '#F0F9FF',
        borderColor: '#B9E6FE',
        textColor: '#026AA2',
        text: 'Minor',
      },
    }

    const config = severityConfig[severity]

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

  if (status) {
    const statusConfig = {
      Open: {
        color: '#FEF3F2',
        borderColor: '#FECDCA',
        textColor: '#B42318',
        text: 'Open',
      },
      'Resolved': {
        color: '#ECFDF3',
        borderColor: '#ABEFC6',
        textColor: '#067647',
        text: 'Resolved',
      },
      'In Progress': {
        color: '#F0F9FF',
        borderColor: '#B9E6FE',
        textColor: '#026AA2',
        text: 'In Progress',
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

  return null
}
