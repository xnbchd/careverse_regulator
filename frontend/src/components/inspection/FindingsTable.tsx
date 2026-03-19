import { Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ProCard } from '@ant-design/pro-components'
import type { Finding } from '@/stores/findingsStore'
import FindingsBadge from './FindingsBadge'

interface FindingsTableProps {
  findings: Finding[]
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onViewFinding: (finding: Finding) => void
}

export default function FindingsTable({
  findings,
  selectedRowKeys,
  onSelectionChange,
  onViewFinding,
}: FindingsTableProps) {
  const columns: ColumnsType<Finding> = [
    {
      title: 'Finding ID',
      dataIndex: 'findingId',
      key: 'findingId',
      width: 120,
    },
    {
      title: 'Facility Name',
      dataIndex: 'facilityName',
      key: 'facilityName',
      width: 200,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      width: 180,
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 120,
      render: (severity: Finding['severity']) => <FindingsBadge severity={severity} />,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: Finding['status']) => <FindingsBadge status={status} />,
    },
    {
      title: 'Due Date',
      dataIndex: 'dueDate',
      key: 'dueDate',
      width: 120,
    },
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record: Finding) => (
        <Button
          type="primary"
          onClick={() => onViewFinding(record)}
          style={{
            backgroundColor: '#11b5a1',
            borderColor: '#11b5a1',
            borderRadius: '8px',
            height: '36px',
            padding: '4px 15px',
          }}
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
        dataSource={findings}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: false,
        }}
      />
    </ProCard>
  )
}
