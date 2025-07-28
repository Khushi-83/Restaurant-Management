import { Table, Tag, Space, Button, message, Modal } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { CheckCircleOutlined, ClockCircleOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderType {
  id: string;
  order_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  table_number: string | number;
  items: OrderItem[];
  total_price: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
}

export default function OrdersPanel() {
  const [orders, setOrders] = useState<OrderType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`);
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      message.error('Failed to fetch orders');
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusUpdate = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update order status');
      }

      message.success(`Order status updated to ${status}`);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      message.error('Failed to update order status');
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    Modal.confirm({
      title: 'Cancel Order',
      content: 'Are you sure you want to cancel this order?',
      okText: 'Yes',
      cancelText: 'No',
      onOk: async () => {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders/${orderId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            throw new Error('Failed to cancel order');
          }

          message.success('Order cancelled successfully');
          fetchOrders(); // Refresh the orders list
        } catch (error) {
          message.error('Failed to cancel order');
          console.error('Error cancelling order:', error);
        }
      },
    });
  };

  const columns: ColumnsType<OrderType> = [
    {
      title: 'Order ID',
      dataIndex: 'order_id',
      key: 'order_id',
      width: 150,
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      width: 120,
    },
    {
      title: 'Table',
      dataIndex: 'table_number',
      key: 'table_number',
      width: 80,
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      width: 250,
      render: (items: OrderItem[]) => (
        <div style={{ maxWidth: 240 }}>
          {items.map((item, index) => (
            <div key={index} style={{ fontSize: '12px', marginBottom: '2px' }}>
              {item.name} × {item.quantity} (₹{item.price})
            </div>
          ))}
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total_price',
      key: 'total_price',
      width: 100,
      render: (price: number) => `₹${price}`,
    },
    {
      title: 'Payment',
      key: 'payment',
      width: 120,
      render: (_, record: OrderType) => (
        <div>
          <div style={{ fontSize: '12px' }}>{record.payment_method}</div>
          <Tag color={record.payment_status === 'PAID' ? 'green' : 'orange'}>
            {record.payment_status}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      width: 120,
      render: (status: string) => {
        let color, icon;
        switch (status) {
          case 'Ready':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'Preparing':
            color = 'orange';
            icon = <ClockCircleOutlined />;
            break;
          case 'Awaiting Payment':
            color = 'blue';
            icon = <ClockCircleOutlined />;
            break;
          case 'Delivered':
            color = 'green';
            icon = <CheckCircleOutlined />;
            break;
          case 'Cancelled':
            color = 'red';
            icon = <ClockCircleOutlined />;
            break;
          default:
            color = 'gray';
            icon = <ClockCircleOutlined />;
        }
        return (
          <Tag icon={icon} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Time',
      key: 'created_at',
      dataIndex: 'created_at',
      width: 120,
      render: (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record: OrderType) => (
        <Space size="small">
          {record.status === 'Awaiting Payment' && (
            <Button 
              type="primary" 
              size="small"
              loading={updatingOrder === record.order_id}
              onClick={() => handleStatusUpdate(record.order_id, 'Preparing')}
            >
              Start Preparing
            </Button>
          )}
          {record.status === 'Preparing' && (
            <Button 
              type="primary" 
              size="small"
              loading={updatingOrder === record.order_id}
              onClick={() => handleStatusUpdate(record.order_id, 'Ready')}
            >
              Mark Ready
            </Button>
          )}
          {record.status === 'Ready' && (
            <Button 
              type="default" 
              size="small"
              loading={updatingOrder === record.order_id}
              onClick={() => handleStatusUpdate(record.order_id, 'Delivered')}
            >
              Mark Delivered
            </Button>
          )}
          {record.status !== 'Delivered' && record.status !== 'Cancelled' && (
            <Button 
              danger
              size="small"
              onClick={() => handleCancelOrder(record.order_id)}
            >
              Cancel
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Current Orders ({orders.length})</h2>
        <Space>
          <Button 
            type="primary" 
            icon={<ReloadOutlined />}
            onClick={fetchOrders}
            loading={loading}
          >
            Refresh
          </Button>
          <Button icon={<ExportOutlined />}>
            Export
          </Button>
        </Space>
      </div>
      <Table 
        columns={columns} 
        dataSource={orders}
        rowKey="order_id"
        loading={loading}
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} orders`,
        }}
      />
    </div>
  );
}