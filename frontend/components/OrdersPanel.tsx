import { Table, Tag, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

interface OrderType {
  key: string;
  orderId: string;
  customerName: string;
  tableNo: string;
  items: { name: string; quantity: number; price: number }[];
  preferences: string[];
  status: string;
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
      dataIndex: 'tableNo',
      key: 'tableNo',
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderType['items']) => (
        <div style={{ maxWidth: 200 }}>
          {items.map((item, index) => (
            <div key={index}>{item.name} × {item.quantity} (₹{item.price})</div>
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
      render: (status: string) => {
        let color, icon;
        switch (status) {
          case 'ready':
          case 'Ready':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'preparing':
          case 'Preparing':
            color = 'orange';
            icon = <ClockCircleOutlined />;
            break;
          case 'Awaiting Payment':
            color = 'blue';
            icon = <ClockCircleOutlined />;
            break;
          case 'Paid':
            color = 'green';
            icon = <CheckCircleOutlined />;
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
      render: (_: string, record: OrderType) => (
        <Space size="middle">
          <Button 
            type="primary" 
            size="small"
            onClick={() => handleStatusUpdate(record.orderId, 'Ready')}
          >
            Mark Ready
          </Button>
          <Button 
            type="default" 
            size="small"
            onClick={() => handleStatusUpdate(record.orderId, 'Delivered')}
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
      tableNo: 'A5',
      items: [
        { name: 'Paneer Tikka', quantity: 2, price: 250 },
        { name: 'Butter Naan', quantity: 3, price: 40 },
        { name: 'Coke', quantity: 1, price: 60 },
      ],
      preferences: ['Extra Spicy', 'No Onion'],
      status: 'Preparing',
      time: '12:30 PM'
    },
    // More sample data...
  ];

  const handleStatusUpdate = (orderId: string, status: string) => {
    // Implement status update logic
    console.log(`Updating order ${orderId} to ${status}`);
  };

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