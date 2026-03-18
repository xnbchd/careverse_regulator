import { Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ProCard } from '@ant-design/pro-components'
import type { Inspection } from '@/stores/inspectionStore'
import StatusBadge from './StatusBadge'

interface InspectionTableProps {
  inspections: Inspection[]
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onViewInspection: (inspection: Inspection) => void
}

export default function InspectionTable({
  inspections,
  selectedRowKeys,
  onSelectionChange,
  onViewInspection,
}: InspectionTableProps) {
  const columns: ColumnsType<Inspection> = [
    {
      title: 'Inspection ID',
      dataIndex: 'inspectionId',
      key: 'inspectionId',
      width: 150,
    },
    {
      title: 'Facility Name',
      dataIndex: 'facilityName',
      key: 'facilityName',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
    {
      title: 'Inspector',
      dataIndex: 'inspector',
      key: 'inspector',
      width: 180,
    },
    {
      title: 'Note to Inspector',
      dataIndex: 'noteToInspector',
      key: 'noteToInspector',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: Inspection['status']) => <StatusBadge status={status} />,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record: Inspection) => (
        <Button
          type="primary"
          size="small"
          onClick={() => onViewInspection(record)}
          style={{ backgroundColor: '#11b5a1', borderColor: '#11b5a1' }}
        >
          View
        </Button>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectionChange,
  }

  return (
    <ProCard>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={inspections}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </ProCard>
  )
}
