import { Drawer, Collapse, Space, Divider, Empty, Button } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { useResponsive } from '@/hooks/useResponsive'
import type { Inspection, Finding, Attachment } from '@/types/inspection'
import FindingsBadge from './FindingsBadge'

interface FindingsDrawerProps {
  open: boolean
  onClose: () => void
  inspection: Inspection | null
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

function handleDownloadAttachment(attachment: Attachment) {
  // Frappe file URLs are already absolute paths
  window.open(attachment.file_url, '_blank')
}

export default function FindingsDrawer({ open, onClose, inspection }: FindingsDrawerProps) {
  const { isMobile } = useResponsive()

  if (!inspection) return null

  // Group findings by category (filter out findings with missing/empty category)
  const findingsByCategory = (inspection.findings || [])
    .filter(finding => finding.category && finding.category.trim())
    .reduce((acc, finding) => {
      const category = finding.category.trim()
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(finding)
      return acc
    }, {} as Record<string, Finding[]>)

  const categories = Object.keys(findingsByCategory)
  const hasValidFindings = categories.length > 0

  return (
    <Drawer
      title={`Findings for ${inspection.facilityName}`}
      placement="right"
      width={isMobile ? '100%' : '40%'}
      onClose={onClose}
      open={open}
    >
      {!hasValidFindings ? (
        <Empty description="No findings recorded for this inspection" />
      ) : (
        <Collapse
          items={categories.map(category => ({
            key: category,
            label: `${category} (${findingsByCategory[category].length})`,
            children: (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {findingsByCategory[category].map(finding => (
                  <div key={finding.id} style={{ padding: '12px', border: '1px solid #f0f0f0', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                      <FindingsBadge severity={finding.severity} />
                      <FindingsBadge status={finding.status} />
                    </div>
                    <p style={{ margin: '8px 0', fontSize: '14px' }}>{finding.description}</p>
                    {finding.correctiveAction && (
                      <p style={{ margin: '8px 0', fontSize: '13px', color: '#666' }}>
                        <strong>Corrective Action:</strong> {finding.correctiveAction}
                      </p>
                    )}
                    {finding.attachments && finding.attachments.length > 0 && (
                      <div style={{ margin: '12px 0' }}>
                        <strong style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '8px' }}>
                          Attachments ({finding.attachments.length})
                        </strong>
                        <Space direction="vertical" size="small" style={{ width: '100%' }}>
                          {finding.attachments.map((attachment) => (
                            <Button
                              key={attachment.name}
                              size="small"
                              icon={<DownloadOutlined />}
                              onClick={() => handleDownloadAttachment(attachment)}
                              style={{ width: '100%', textAlign: 'left', justifyContent: 'flex-start' }}
                            >
                              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {attachment.file_name}
                              </span>
                              <span style={{ marginLeft: '8px', fontSize: '12px', color: '#999' }}>
                                ({formatFileSize(attachment.file_size)})
                              </span>
                            </Button>
                          ))}
                        </Space>
                      </div>
                    )}
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                      {finding.dueDate && `Due: ${finding.dueDate}`}
                      {finding.resolvedDate && ` | Resolved: ${finding.resolvedDate}`}
                    </div>
                  </div>
                ))}
              </Space>
            ),
          }))}
        />
      )}
      <Divider />
      <div style={{ fontSize: '13px', color: '#666' }}>
        {inspection.inspectedDate ? `Inspected: ${inspection.inspectedDate}` : 'Not yet inspected'}
      </div>
    </Drawer>
  )
}
