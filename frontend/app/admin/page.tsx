'use client';

import React, { useEffect, useState } from 'react';
import { Layout, Menu, theme, message, ConfigProvider, List, Avatar, Input, Button, Card, Form, InputNumber, Select, Modal, DatePicker, TimePicker, Tag, Table, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MessageOutlined,
  PieChartOutlined,
  SettingOutlined,
  StarOutlined,
  AudioOutlined,
  SendOutlined,
  DeleteOutlined,
  EditOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { socket } from '@/lib/socket';
import Image from 'next/image';
import { ImageUpload } from '@/components/ui/image-upload';

const { Header, Sider, Content } = Layout;
const { TextArea } = Input;

// Types
type ChatMessage = {
  id?: string;
  sender: string;
  message: string;
  timestamp: string;
};

type MenuItem = {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image_url: string;
  quantity_per_serve: number;
};

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type Order = {
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
  status: 'Awaiting Payment' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled';
  created_at: string;
};

// Add proper type for form values
type MenuFormValues = {
  name: string;
  price: number;
  description?: string;
  category: string;
  quantity_per_serve: number;
};

// Add Feedback type
type Feedback = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  diningOption: string;
  ratings: Record<string, string>;
  comments: string;
  created_at?: string;
};

// MenuPanel component with CRUD operations
const MenuPanel = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fooditems`);
      if (!response.ok) throw new Error('Failed to fetch menu items');
      const data = await response.json();
      setMenuItems(data);
    } catch (err) {
      console.error('Failed to fetch menu items:', err);
      message.error('Failed to fetch menu items');
    }
  };

  const handleAddItem = async (values: MenuFormValues) => {
    try {
      setLoading(true);

      if (!imageUrl) {
        message.error('Please upload an image');
        return;
      }

      const menuItem = {
        name: values.name,
        price: values.price,
        description: values.description || '',
        category: values.category,
        image_url: imageUrl,
        quantity_per_serve: values.quantity_per_serve
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fooditems`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menuItem)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add menu item');
      }

      await fetchMenuItems(); // Refresh the list
      message.success('Menu item added successfully');
      form.resetFields();
      setImageUrl(undefined);
    } catch (err) {
      console.error('Failed to add menu item:', err);
      message.error(err instanceof Error ? err.message : 'Failed to add menu item');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/fooditems/${id}`, { 
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete item');
      }

      await fetchMenuItems(); // Refresh the list
      message.success('Item deleted successfully');
    } catch (err) {
      console.error('Failed to delete item:', err);
      message.error('Failed to delete item');
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Item Form */}
      <Card className="shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddItem}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="name"
              label="Item Name"
              rules={[{ required: true, message: 'Please enter item name' }]}
            >
              <Input placeholder="Enter item name" />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price (₹)"
              rules={[{ required: true, message: 'Please enter price' }]}
            >
              <InputNumber 
                min={0} 
                className="w-full" 
                placeholder="Enter price"
              />
            </Form.Item>

            <Form.Item
              name="category"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select placeholder="Select category">
                <Select.Option value="starters">Starters</Select.Option>
                <Select.Option value="main-course">Main Course</Select.Option>
                <Select.Option value="desserts">Desserts</Select.Option>
                <Select.Option value="beverages">Beverages</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="quantity_per_serve"
              label="Quantity per Serve"
              rules={[{ required: true, message: 'Please enter quantity' }]}
            >
              <InputNumber 
                min={1} 
                className="w-full" 
                placeholder="Enter quantity per serve"
              />
            </Form.Item>

            <Form.Item
              label="Image"
              required
              help={!imageUrl && 'Please upload an image'}
            >
              <ImageUpload
                onUploadComplete={(url) => {
                  setImageUrl(url);
                  message.success('Image uploaded successfully');
                }}
                onError={(error) => {
                  message.error(error);
                }}
              />
              {imageUrl && (
                <div className="mt-2">
                  <Image
                    src={imageUrl}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="rounded-md object-cover"
                  />
                </div>
              )}
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              className="md:col-span-2"
            >
              <TextArea rows={4} placeholder="Enter item description" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-4">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              className="bg-blue-500"
            >
              Add Item
            </Button>
          </div>
        </Form>
      </Card>

      {/* Menu Items Grid */}
      <Card className="shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card
            key={item.id}
            cover={
              <div className="relative h-48">
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>
            }
            actions={[
              <EditOutlined key="edit" onClick={() => message.info('Edit functionality coming soon')} />,
              <DeleteOutlined key="delete" onClick={() => handleDeleteItem(item.id)} className="text-red-500" />
            ]}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <Card.Meta
              title={
                <div className="flex justify-between items-center">
                  <span>{item.name}</span>
                  <span className="text-green-600">₹{item.price}</span>
                </div>
              }
              description={
                <div>
                  <p className="text-gray-600">{item.description}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {item.category}
                    </span>
                    <span className="text-gray-500">
                      Qty: {item.quantity_per_serve}
                    </span>
                  </div>
                </div>
              }
            />
          </Card>
        ))}
        </div>
      </Card>
    </div>
  );
};

// MessagesPanel component
const MessagesPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // Fetch existing messages
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/chat/messages`)
      .then(res => res.json())
      .then((data: ChatMessage[]) => setMessages(data))
      .catch(error => console.error('Error fetching messages:', error));

    return () => {
      socket.off('new_message');
    };
  }, []);

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    const reply: ChatMessage = {
      sender: 'Admin',
      message: replyText,
      timestamp: new Date().toISOString()
    };
    socket.emit('new_message', reply);
    setReplyText('');
    // Do NOT update setMessages here to avoid duplication
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="flex h-[calc(100vh-300px)]">
          {/* Messages List */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4">
          <List
            itemLayout="horizontal"
            dataSource={messages}
            renderItem={(msg: ChatMessage) => (
              <List.Item 
                className={`mb-4 p-4 rounded-lg ${
                  msg.sender === 'Admin' 
                    ? 'bg-blue-50 ml-8' 
                    : 'bg-white mr-8 shadow-sm'
                }`}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar 
                      icon={msg.sender === 'Admin' ? <UserOutlined /> : <MessageOutlined />}
                      className={msg.sender === 'Admin' ? 'bg-blue-500' : 'bg-green-500'}
                    />
                  }
                  title={
                    <div className="flex justify-between">
                      <span>{msg.sender}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  }
                  description={msg.message}
                />
              </List.Item>
            )}
          />
        </div>
        {/* Reply Input */}
        <div className="mt-4 flex gap-4">
          <Input
            placeholder="Type your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onPressEnter={handleSendReply}
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendReply}
            disabled={!replyText.trim()}
            className="bg-blue-500"
          >
            Send
          </Button>
        </div>
      </div>
        </div>
      </Card>
    </div>
  );
};

// OrdersPanel component with enhanced UI for all client orders
const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

    // Subscribe to live updates for admin
    socket.connect();
    socket.emit('join_admin');
    const onNewOrder = () => fetchOrders();
    const onStatus = () => fetchOrders();
    const onCancelled = () => fetchOrders();
    socket.on('order_update', onNewOrder);
    socket.on('admin_order_status_update', onStatus);
    socket.on('order_status_update', onStatus);
    socket.on('order_cancelled', onCancelled);
    return () => {
      socket.off('order_update', onNewOrder);
      socket.off('admin_order_status_update', onStatus);
      socket.off('order_status_update', onStatus);
      socket.off('order_cancelled', onCancelled);
    };
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

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesSearch = searchTerm === '' || 
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.table_number.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: orders.length,
    awaitingPayment: orders.filter(o => o.status === 'Awaiting Payment').length,
    preparing: orders.filter(o => o.status === 'Preparing').length,
    ready: orders.filter(o => o.status === 'Ready').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
    cancelled: orders.filter(o => o.status === 'Cancelled').length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.total_price || 0), 0)
  };

  return (
    <div className="space-y-6">
      {/* Header with Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button 
              type="primary" 
              icon={<ReloadOutlined />}
              onClick={fetchOrders}
              loading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-blue-600">Total Orders</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.awaitingPayment}</div>
            <div className="text-sm text-yellow-600">Awaiting Payment</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.preparing}</div>
            <div className="text-sm text-orange-600">Preparing</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.ready}</div>
            <div className="text-sm text-blue-600">Ready</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-green-600">Delivered</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-purple-600">Total Revenue</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search by customer name, order ID, or table number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ maxWidth: 400 }}
            prefix={<UserOutlined />}
          />
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 200 }}
            placeholder="Filter by status"
          >
            <Select.Option value="all">All Orders</Select.Option>
            <Select.Option value="Awaiting Payment">Awaiting Payment</Select.Option>
            <Select.Option value="Preparing">Preparing</Select.Option>
            <Select.Option value="Ready">Ready</Select.Option>
            <Select.Option value="Delivered">Delivered</Select.Option>
            <Select.Option value="Cancelled">Cancelled</Select.Option>
          </Select>
        </div>
      </div>

      {/* Orders Grid */}
      {filteredOrders.length === 0 ? (
        <Card className="text-center py-12">
          <ShoppingCartOutlined style={{ fontSize: 64 }} className="text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {orders.length === 0 ? 'No orders received yet' : 'No orders match your filters'}
          </h3>
          <p className="text-gray-500">
            {orders.length === 0 ? 'Orders from clients will appear here' : 'Try adjusting your search or filter criteria'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map(order => (
            <Card 
              key={order.order_id} 
              className="shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4"
              style={{
                borderLeftColor: 
                  order.status === 'Delivered' ? '#10B981' :
                  order.status === 'Ready' ? '#3B82F6' :
                  order.status === 'Preparing' ? '#F59E0B' :
                  order.status === 'Awaiting Payment' ? '#F59E0B' :
                  '#EF4444'
              }}
            >
              {/* Order Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-lg">#{order.order_id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'Preparing' ? 'bg-orange-100 text-orange-800' :
                      order.status === 'Awaiting Payment' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Table {order.table_number} • {new Date(order.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">₹{order.total_price}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.payment_status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {order.payment_status}
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <UserOutlined className="text-blue-500" />
                  <span className="font-semibold text-gray-800">{order.customer_name}</span>
                </div>
                <div className="text-sm text-gray-600">
                  📧 {order.customer_email} • 📞 {order.customer_phone}
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-4">
                <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <ShoppingCartOutlined />
                  Order Items ({order.items?.length || 0})
                </div>
                <div className="space-y-2">
                  {order.items?.map((item: OrderItem, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                      <div className="flex-1">
                        <div className="font-medium text-gray-800">{item.name}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-800">₹{item.price}</div>
                        <div className="text-sm text-gray-500">Total: ₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 flex-wrap">
                {order.status === 'Awaiting Payment' && (
                  <Button 
                    type="primary" 
                    size="small"
                    loading={updatingOrder === order.order_id}
                    onClick={() => handleStatusUpdate(order.order_id, 'Preparing')}
                    icon={<EditOutlined />}
                  >
                    Start Preparing
                  </Button>
                )}
                {order.status === 'Preparing' && (
                  <Button 
                    type="primary" 
                    size="small"
                    loading={updatingOrder === order.order_id}
                    onClick={() => handleStatusUpdate(order.order_id, 'Ready')}
                    icon={<EditOutlined />}
                  >
                    Mark Ready
                  </Button>
                )}
                {order.status === 'Ready' && (
                  <Button 
                    type="default" 
                    size="small"
                    loading={updatingOrder === order.order_id}
                    onClick={() => handleStatusUpdate(order.order_id, 'Delivered')}
                    icon={<EditOutlined />}
                  >
                    Mark Delivered
                  </Button>
                )}
                {order.status !== 'Delivered' && order.status !== 'Cancelled' && (
                  <Button 
                    danger
                    size="small"
                    onClick={() => handleCancelOrder(order.order_id)}
                    icon={<DeleteOutlined />}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};



const FeedbackPanel = () => {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/feedback`)
      .then(res => res.json())
      .then(data => setFeedbacks(data))
      .catch(() => setFeedbacks([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        {loading ? (
          <p>Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-gray-600">No feedback yet.</p>
        ) : (
          <List
            dataSource={feedbacks}
            renderItem={fb => (
              <List.Item>
                <List.Item.Meta
                  title={`${fb.firstName} ${fb.lastName} (${fb.email})`}
                  description={
                    <>
                      <div><b>Dining Option:</b> {fb.diningOption}</div>
                      <div><b>Ratings:</b> {fb.ratings && Object.entries(fb.ratings).map(([cat, val]) => `${cat}: ${val}`).join(', ')}</div>
                      <div><b>Comments:</b> {fb.comments}</div>
                      <div className="text-xs text-gray-400">{fb.created_at && new Date(fb.created_at).toLocaleString()}</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  );
};

const ReportsPanel = () => {
  const [sales, setSales] = useState<{ [item: string]: number }>({});
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = () => {
      // Fetch sales data
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/reports/daily-sales`)
        .then(res => res.json())
        .then(data => {
          setSales(data);
          setLoading(false);
          setError(null);
        })
        .catch(() => {
          setSales({});
          setLoading(false);
          setError('Failed to fetch daily sales');
        });

      // Fetch orders data
      setOrdersLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setOrdersLoading(false);
        })
        .catch(() => {
          setOrders([]);
          setOrdersLoading(false);
        });
    };

    fetchData();

    // Set up real-time updates
    socket.on('order_update', () => {
      fetchData(); // Refresh data when new order comes in
    });

    socket.on('order_status_update', () => {
      fetchData(); // Refresh data when order status changes
    });

    // Refresh data every 30 seconds
    const interval = setInterval(fetchData, 30000);

    return () => {
      socket.off('order_update');
      socket.off('order_status_update');
      clearInterval(interval);
    };
  }, []);

  // Filter today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    return orderDate >= today;
  });

  // Calculate today's statistics
  const todayStats = {
    totalOrders: todayOrders.length,
    totalRevenue: todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0),
    averageOrder: todayOrders.length > 0 ? todayOrders.reduce((sum, order) => sum + (order.total_price || 0), 0) / todayOrders.length : 0,
    pendingOrders: todayOrders.filter(order => order.status === 'Awaiting Payment').length,
    preparingOrders: todayOrders.filter(order => order.status === 'Preparing').length,
    readyOrders: todayOrders.filter(order => order.status === 'Ready').length,
    deliveredOrders: todayOrders.filter(order => order.status === 'Delivered').length
  };

  return (
    <div className="space-y-6">
      {/* Today's Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{todayStats.totalOrders}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">₹{todayStats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">Total Revenue</div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">₹{todayStats.averageOrder.toFixed(0)}</div>
            <div className="text-sm text-gray-600">Average Order</div>
          </div>
        </Card>
        <Card className="shadow-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{todayStats.pendingOrders + todayStats.preparingOrders}</div>
            <div className="text-sm text-gray-600">Active Orders</div>
          </div>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card className="shadow-sm">
        <h3 className="font-semibold mb-4">Todays Order Status</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{todayStats.pendingOrders}</div>
            <div className="text-sm text-gray-600">Awaiting Payment</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{todayStats.preparingOrders}</div>
            <div className="text-sm text-gray-600">Preparing</div>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{todayStats.readyOrders}</div>
            <div className="text-sm text-gray-600">Ready</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{todayStats.deliveredOrders}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>
      </Card>

      {/* Recent Orders */}
      <Card className="shadow-sm">
        <h3 className="font-semibold mb-4">Recent Orders (Today)</h3>
        {ordersLoading ? (
          <p>Loading orders...</p>
        ) : todayOrders.length === 0 ? (
          <p className="text-gray-600">No orders today.</p>
        ) : (
          <div className="space-y-3">
            {todayOrders.slice(0, 5).map(order => (
              <div key={order.order_id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">Table {order.table_number} - {order.customer_name}</div>
                  <div className="text-sm text-gray-600">
                    {order.items?.slice(0, 2).map(item => item.name).join(', ')}
                    {order.items?.length > 2 && ` +${order.items.length - 2} more`}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleTimeString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">₹{order.total_price}</div>
                  <div className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                    order.status === 'Preparing' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
            {todayOrders.length > 5 && (
              <div className="text-center text-sm text-gray-500">
                +{todayOrders.length - 5} more orders today
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Sales by Food Item */}
      <Card className="shadow-sm">
        <h3 className="font-semibold mb-2">Sales by Food Item (Today)</h3>
        {loading ? (
          <p>Loading sales data...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : Object.keys(sales).length === 0 ? (
          <p className="text-gray-600">No sales yet today.</p>
        ) : (
          <ul>
            {Object.entries(sales).map(([item, count]) => (
              <li key={item} className="flex justify-between border-b py-1 last:border-b-0">
                <span>{item}</span>
                <span className="font-bold">{count}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

const MusicPanel = () => (
  <div className="space-y-6">
    <Card className="shadow-sm">
      <p className="text-gray-600">Music request management coming soon...</p>
    </Card>
  </div>
);

// Bookings Panel (admin view)
type Booking = {
  id?: string;
  booking_id: string;
  customer_name: string;
  customer_phone: string;
  party_size: number;
  table_number: number;
  booking_time: string;
  duration_minutes: number;
  status: 'Booked' | 'Seated' | 'Completed' | 'Cancelled';
  created_at?: string;
};

const BookingsPanel = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [available, setAvailable] = useState<number[]>([]);
  const [now, setNow] = useState<Date>(new Date());
  const [duration, setDuration] = useState<number>(60);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings`);
      const data = await res.json();
      setBookings(Array.isArray(data) ? data : []);
    } catch {
      message.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailable = async (atDate?: Date, dur?: number) => {
    try {
      const at = (atDate || now).toISOString();
      const d = dur || duration;
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings/available?at=${encodeURIComponent(at)}&duration=${d}`);
      const data = await res.json();
      setAvailable(Array.isArray(data?.available) ? data.available : []);
    } catch {
      setAvailable([]);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchAvailable();
    socket.connect();
    socket.emit('join_admin');
    const onBooking = () => { fetchBookings(); fetchAvailable(); };
    socket.on('booking_update', onBooking);
    socket.on('booking_status_update', onBooking);
    socket.on('booking_cancelled', onBooking);
    return () => {
      socket.off('booking_update', onBooking);
      socket.off('booking_status_update', onBooking);
      socket.off('booking_cancelled', onBooking);
    };
  }, []);

  const updateStatus = async (bookingId: string, status: Booking['status']) => {
    setUpdatingId(bookingId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Failed');
      message.success(`Status set to ${status}`);
      fetchBookings();
    } catch {
      message.error('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelBooking = (bookingId: string) => {
    Modal.confirm({
      title: 'Cancel booking?',
      onOk: async () => {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/bookings/${bookingId}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed');
          message.success('Booking cancelled');
          fetchBookings();
          fetchAvailable();
        } catch {
          message.error('Failed to cancel');
        }
      }
    });
  };

  const columns: ColumnsType<Booking> = [
    { title: 'ID', dataIndex: 'booking_id', key: 'booking_id', width: 160 },
    { title: 'Name', dataIndex: 'customer_name', key: 'customer_name' },
    { title: 'Phone', dataIndex: 'customer_phone', key: 'customer_phone' },
    { title: 'Party', dataIndex: 'party_size', key: 'party_size', width: 80 },
    { title: 'Table', dataIndex: 'table_number', key: 'table_number', width: 80 },
    { 
      title: 'Time', key: 'booking_time', dataIndex: 'booking_time', width: 180,
      render: (t) => new Date(String(t)).toLocaleString()
    },
    { title: 'Duration', dataIndex: 'duration_minutes', key: 'duration_minutes', width: 100 },
    { 
      title: 'Status', dataIndex: 'status', key: 'status', width: 120,
      render: (s) => {
        const status = String(s) as Booking['status'];
        const color = status === 'Booked' ? 'blue' : status === 'Seated' ? 'orange' : status === 'Completed' ? 'green' : 'red';
        return <Tag color={color}>{status}</Tag>;
      }
    },
    {
      title: 'Actions', key: 'actions', width: 260,
      render: (_: unknown, rec: Booking) => (
        <Space size="small">
          {rec.status === 'Booked' && (
            <Button size="small" type="primary" loading={updatingId === rec.booking_id} onClick={() => updateStatus(rec.booking_id, 'Seated')}>Seat</Button>
          )}
          {rec.status === 'Seated' && (
            <Button size="small" onClick={() => updateStatus(rec.booking_id, 'Completed')} loading={updatingId === rec.booking_id}>Complete</Button>
          )}
          {rec.status !== 'Cancelled' && rec.status !== 'Completed' && (
            <Button size="small" danger onClick={() => cancelBooking(rec.booking_id)}>Cancel</Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="shadow-sm">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Date</label>
            <DatePicker 
              value={dayjs(now)}
              onChange={(d) => {
                const cur = new Date(now);
                const base = d ? d.toDate() : new Date();
                cur.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
                setNow(cur);
                fetchAvailable(cur, duration);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Time</label>
            <TimePicker
              value={dayjs(now)}
              onChange={(t) => {
                const cur = new Date(now);
                if (t) {
                  const dd = t.toDate();
                  cur.setHours(dd.getHours(), dd.getMinutes(), 0, 0);
                }
                setNow(cur);
                fetchAvailable(cur, duration);
              }}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600">Duration (mins)</label>
            <InputNumber min={15} max={240} step={15} value={duration} onChange={(v) => { const val = Number(v || 60); setDuration(val); fetchAvailable(now, val); }} />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm text-gray-600 mb-2">Available tables</div>
          {available.length === 0 ? (
            <div className="text-gray-500">No tables available at the selected time.</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {available.map(t => (
                <span key={t} className="px-3 py-1 bg-green-50 text-green-700 rounded border border-green-200">Table {t}</span>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold">Bookings ({bookings.length})</h3>
          <Button icon={<ReloadOutlined />} onClick={() => { fetchBookings(); fetchAvailable(); }} loading={loading}>Refresh</Button>
        </div>
        <Table 
          rowKey="booking_id"
          columns={columns}
          dataSource={bookings}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('menu');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Real-Time Setup with error handling
  useEffect(() => {
    try {
      socket.connect();

      // Join admin room for admin-specific messages
      socket.emit('join_admin');
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        message.error('Failed to connect to real-time updates');
      });
      
      socket.on('order_update', (order) => {
        message.success(`New order from Table ${order.table_number}`);
      });
      socket.on('order_status_update', () => {
        message.info('Order status updated');
      });
      socket.on('order_cancelled', () => {
        message.warning('Order cancelled');
      });

      return () => {
        socket.off('connect_error');
        socket.off('order_update');
        socket.off('order_status_update');
        socket.off('order_cancelled');
        socket.disconnect();
      };
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersPanel />;
      case 'bookings': return <BookingsPanel />;
      case 'menu': return <MenuPanel />;
      case 'feedback': return <FeedbackPanel />;
      case 'reports': return <ReportsPanel />;
      case 'messages': return <MessagesPanel />;
      case 'music': return <MusicPanel />;
      default: return <MenuPanel />;
    }
  };

  return (
    <ConfigProvider>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar for desktop */}
        <div className="hidden md:block">
          <Sider 
            collapsible 
            collapsed={collapsed} 
            onCollapse={(value: boolean) => setCollapsed(value)}
            width={250}
            className="h-screen shadow-lg"
            theme="light"
          >
            <div className="h-16 m-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold rounded-lg">
              {collapsed ? 'RMS' : 'Restaurant Admin'}
            </div>
            <Menu
              mode="inline"
              defaultSelectedKeys={['menu']}
              onSelect={({ key }) => setActiveTab(key)}
              items={[
                { key: 'menu', icon: <AppstoreOutlined />, label: 'Menu Management' },
                { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
                { key: 'bookings', icon: <CalendarOutlined />, label: 'Bookings' },
                { key: 'messages', icon: <MessageOutlined />, label: 'Customer Messages' },
                { key: 'feedback', icon: <StarOutlined />, label: 'Customer Feedback' },
                { key: 'preferences', icon: <UserOutlined />, label: 'Customer Preferences' },
                { key: 'reports', icon: <PieChartOutlined />, label: 'Daily Reports' },
                { key: 'music', icon: <AudioOutlined />, label: 'Song Requests' },
                { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
              ]}
              className="border-r-0"
            />
          </Sider>
        </div>
        {/* Sidebar for mobile */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            <div className="fixed inset-0 bg-black opacity-30" onClick={() => setMobileSidebarOpen(false)} />
            <div className="relative w-64 bg-white h-screen shadow-lg z-50">
              <Sider
                collapsed={false}
                width={250}
                className="h-screen shadow-lg"
                theme="light"
                style={{ position: 'relative' }}
              >
                <div className="h-16 m-4 bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white text-lg font-bold rounded-lg">
                  Restaurant Admin
                </div>
                <Menu
                  mode="inline"
                  defaultSelectedKeys={[activeTab]}
                  onSelect={({ key }) => { setActiveTab(key); setMobileSidebarOpen(false); }}
                  items={[
                    { key: 'menu', icon: <AppstoreOutlined />, label: 'Menu Management' },
                    { key: 'orders', icon: <ShoppingCartOutlined />, label: 'Orders' },
                    { key: 'bookings', icon: <CalendarOutlined />, label: 'Bookings' },
                    { key: 'messages', icon: <MessageOutlined />, label: 'Customer Messages' },
                    { key: 'feedback', icon: <StarOutlined />, label: 'Customer Feedback' },
                   
                    { key: 'reports', icon: <PieChartOutlined />, label: 'Daily Reports' },
                    { key: 'music', icon: <AudioOutlined />, label: 'Song Requests' },
                    { key: 'settings', icon: <SettingOutlined />, label: 'Settings' },
                  ]}
                  className="border-r-0"
                />
              </Sider>
            </div>
          </div>
        )}
        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header style={{ padding: '0 16px', background: colorBgContainer }} className="shadow-sm z-30">
            <div className="flex items-center justify-between h-16 w-full">
              <div className="flex items-center gap-2">
                {/* Mobile menu button */}
                <button
                  className="md:hidden p-2 rounded hover:bg-gray-100 focus:outline-none"
                  onClick={() => setMobileSidebarOpen(true)}
                  aria-label="Open sidebar"
                >
                  <MenuUnfoldOutlined className="text-xl" />
                </button>
                <h1 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </h1>
              </div>
              <div className="flex items-center gap-2 md:gap-4">
                <Avatar icon={<UserOutlined />} />
                <span className="hidden sm:inline text-gray-600">Admin</span>
              </div>
            </div>
          </Header>
          <Content className="flex-1 bg-gray-50" style={{ overflow: 'auto' }}>
            <div className="h-full p-6">
              {renderContent()}
            </div>
          </Content>
        </div>
      </div>
    </ConfigProvider>
  );
}