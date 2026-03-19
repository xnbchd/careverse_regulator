import { Button } from 'antd'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import type { PaginationMeta } from '@/types/inspection'

interface PaginationControlsProps {
  pagination: PaginationMeta | null
  onPageChange: (page: number) => void
  isMobile?: boolean
}

export default function PaginationControls({ pagination, onPageChange, isMobile }: PaginationControlsProps) {
  if (!pagination || pagination.total_pages <= 1) {
    return null
  }

  const { page, total_pages, has_prev, has_next, total_count } = pagination

  const pageNumbers = []
  const maxVisible = isMobile ? 3 : 5
  let start = Math.max(1, page - Math.floor(maxVisible / 2))
  let end = Math.min(total_pages, start + maxVisible - 1)

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }

  for (let i = start; i <= end; i++) {
    pageNumbers.push(i)
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '24px',
        padding: isMobile ? '12px 0' : '16px 0',
        borderTop: '1px solid #f0f0f0',
      }}
    >
      <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#667085' }}>
        Showing {total_count > 0 ? (page - 1) * pagination.page_size + 1 : 0} to{' '}
        {Math.min(page * pagination.page_size, total_count)} of {total_count} results
      </div>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button
          icon={<LeftOutlined />}
          disabled={!has_prev}
          onClick={() => onPageChange(page - 1)}
          style={{
            borderRadius: '8px',
            height: isMobile ? '32px' : '36px',
            minWidth: isMobile ? '32px' : '36px',
            padding: isMobile ? '4px' : '4px 8px',
          }}
        />

        {start > 1 && (
          <>
            <Button
              onClick={() => onPageChange(1)}
              style={{
                borderRadius: '8px',
                height: isMobile ? '32px' : '36px',
                minWidth: isMobile ? '32px' : '36px',
              }}
            >
              1
            </Button>
            {start > 2 && <span style={{ padding: '0 4px' }}>...</span>}
          </>
        )}

        {pageNumbers.map((pageNum) => (
          <Button
            key={pageNum}
            type={pageNum === page ? 'primary' : 'default'}
            onClick={() => onPageChange(pageNum)}
            style={{
              borderRadius: '8px',
              height: isMobile ? '32px' : '36px',
              minWidth: isMobile ? '32px' : '36px',
              backgroundColor: pageNum === page ? '#11b5a1' : undefined,
              borderColor: pageNum === page ? '#11b5a1' : undefined,
            }}
          >
            {pageNum}
          </Button>
        ))}

        {end < total_pages && (
          <>
            {end < total_pages - 1 && <span style={{ padding: '0 4px' }}>...</span>}
            <Button
              onClick={() => onPageChange(total_pages)}
              style={{
                borderRadius: '8px',
                height: isMobile ? '32px' : '36px',
                minWidth: isMobile ? '32px' : '36px',
              }}
            >
              {total_pages}
            </Button>
          </>
        )}

        <Button
          icon={<RightOutlined />}
          disabled={!has_next}
          onClick={() => onPageChange(page + 1)}
          style={{
            borderRadius: '8px',
            height: isMobile ? '32px' : '36px',
            minWidth: isMobile ? '32px' : '36px',
            padding: isMobile ? '4px' : '4px 8px',
          }}
        />
      </div>
    </div>
  )
}
