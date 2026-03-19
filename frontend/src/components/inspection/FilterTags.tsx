import { Tag, Space } from 'antd'
import { CloseCircleFilled } from '@ant-design/icons'

export interface FilterTag {
  key: string
  label: string
  onRemove: () => void
}

interface FilterTagsProps {
  tags: FilterTag[]
  onClearAll?: () => void
}

export default function FilterTags({ tags, onClearAll }: FilterTagsProps) {
  if (tags.length === 0) {
    return null
  }

  return (
    <div style={{ marginBottom: '16px' }}>
      <Space size={[8, 8]} wrap>
        {tags.map((tag) => (
          <Tag
            key={tag.key}
            closable
            closeIcon={<CloseCircleFilled style={{ fontSize: '14px' }} />}
            onClose={(e) => {
              e.preventDefault()
              tag.onRemove()
            }}
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: '#F0F9FF',
              border: '1px solid #BAE6FD',
              color: '#0369A1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {tag.label}
          </Tag>
        ))}
        {onClearAll && tags.length > 1 && (
          <Tag
            onClick={onClearAll}
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              color: '#DC2626',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Clear All
          </Tag>
        )}
      </Space>
    </div>
  )
}
