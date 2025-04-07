import { Table, Tag, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface OrderType {
  key: string;
  orderId: string;
  customerName: string;
  tableNumber: string;
  items: string;
  preferences: string[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  time: string;
}

export default function OrdersPanel() {
  const columns: ColumnsType<OrderType> = [
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Customer',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: 'Table',
      dataIndex: 'tableNumber',
      key: 'tableNumber',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <div style={{ maxWidth: 200 }}>
          {items.split(',').map((item: string, index: number) => (
            <div key={index}>{item}</div>
          ))}
        </div>
      ),
    },
    {
      title: 'Preferences',
      key: 'preferences',
      dataIndex: 'preferences',
      render: (preferences: string[]) => (
        <>
          {preferences.map((pref) => (
            <Tag color="blue" key={pref}>
              {pref}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (status) => {
        let color, icon;
        switch (status) {
          case 'ready':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'preparing':
            color = 'orange';
            icon = <ClockCircleOutlined />;
            break;
          default:
            color = 'gray';
        }
        return (
          <Tag icon={icon} color={color}>
            {status.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleStatusUpdate(record.orderId, 'ready')}
          >
            Mark Ready
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => handleStatusUpdate(record.orderId, 'delivered')}
          >
            Mark Delivered
          </Button>
        </Space>
      ),
    },
  ];

  const data: OrderType[] = [
    {
      key: '1',
      orderId: 'ORD-001',
      customerName: 'John Doe',
      tableNumber: 'A5',
      items: 'Paneer Tikka, Butter Naan, Coke',
      preferences: ['Extra Spicy', 'No Onion'],
      status: 'preparing',
      time: '12:30 PM'
    },
    // More sample data...
  ];

  // const handleStatusUpdate = (orderId: string, status: string) => {
  //   // Implement status update logic
  //   console.log(`Updating order ${orderId} to ${status}`);
  // };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2>Current Orders</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button type="primary">Refresh</Button>
          <Button>Export</Button>
        </div>
      </div>
      <Table 
        columns={columns} 
        dataSource={data} 
        scroll={{ x: true }}
      />
    </div>
  );
}