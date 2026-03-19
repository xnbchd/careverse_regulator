import { Modal, Select, DatePicker, Input, Button, Alert } from 'antd'
import { useResponsive } from '@/hooks/useResponsive'
import dayjs from 'dayjs'

interface ScheduleInspectionModalProps {
  open: boolean
  onClose: () => void
  onSubmit: () => void
  formData: {
    facility: string
    inspector: string
    date: string
    note: string
  }
  setFormData: (data: ScheduleInspectionModalProps['formData']) => void
  facilities: Array<{ value: string; label: string }>
  inspectors: Array<{ value: string; label: string }>
  loading?: boolean
  error?: string | null
}

export default function ScheduleInspectionModal({
  open,
  onClose,
  onSubmit,
  formData,
  setFormData,
  facilities,
  inspectors,
  loading = false,
  error = null,
}: ScheduleInspectionModalProps) {
  const { isMobile } = useResponsive()

  return (
    <Modal
      title={
        <div>
          <div style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: 600, color: '#101828', marginBottom: '4px' }}>
            Facility Inspection
          </div>
          <div style={{ fontSize: isMobile ? '13px' : '14px', color: '#475467', fontWeight: 400 }}>
            Fill in the details below to generate report
          </div>
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={isMobile ? '100%' : 640}
      style={isMobile ? { top: 0, paddingBottom: 0, maxWidth: '100vw' } : {}}
      bodyStyle={isMobile ? { maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' } : {}}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
        {error && (
          <Alert
            message="Error"
            description={error}
            type="error"
            showIcon
            closable
            style={{ marginBottom: '8px' }}
          />
        )}

        <div>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#344054',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Facility <span style={{ color: '#F04438' }}>*</span>
          </label>
          <Select
            placeholder="Select Facility"
            value={formData.facility || undefined}
            onChange={(value) => setFormData({ ...formData, facility: value })}
            style={{ width: '100%' }}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={facilities}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#344054',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Inspector (User) <span style={{ color: '#F04438' }}>*</span>
          </label>
          <Select
            value={formData.inspector}
            onChange={(value) => setFormData({ ...formData, inspector: value })}
            style={{ width: '100%' }}
            size="large"
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
            }
            options={inspectors}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#344054',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Set Inspection Date <span style={{ color: '#F04438' }}>*</span>
          </label>
          <DatePicker
            value={formData.date ? dayjs(formData.date, 'DD/MM/YYYY') : null}
            onChange={(date) => setFormData({ ...formData, date: date ? date.format('DD/MM/YYYY') : '' })}
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            size="large"
            disabledDate={(current) => {
              // Disable dates before today (start of day)
              const today = dayjs().startOf('day')
              return current && current.valueOf() < today.valueOf()
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: '#344054',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Note To Inspector
          </label>
          <Input.TextArea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            placeholder="Check Safety Compliance"
            rows={4}
            style={{ resize: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: isMobile ? 'column-reverse' : 'row', justifyContent: 'space-between', gap: isMobile ? '8px' : '0', marginTop: '16px' }}>
          <Button
            size={isMobile ? 'middle' : 'large'}
            onClick={onClose}
            block={isMobile}
            disabled={loading}
            style={{
              width: isMobile ? '100%' : '48%',
              borderColor: '#11b5a1',
              color: '#11b5a1',
            }}
          >
            Cancel
          </Button>
          <Button
            type="primary"
            size={isMobile ? 'middle' : 'large'}
            onClick={onSubmit}
            disabled={!formData.facility || !formData.inspector || !formData.date}
            loading={loading}
            block={isMobile}
            style={{
              width: isMobile ? '100%' : '48%',
              backgroundColor: '#11b5a1',
              borderColor: '#11b5a1',
            }}
          >
            Schedule Inspection
          </Button>
        </div>
      </div>
    </Modal>
  )
}
