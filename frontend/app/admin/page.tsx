'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, theme, message, ConfigProvider, List, Avatar, Input, Button, Card, Form, InputNumber, Select } from 'antd';
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
  MenuUnfoldOutlined
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

type Order = {
  id: string;
  table_number: string;
  items: MenuItem[];
  status: 'pending' | 'preparing' | 'ready' | 'delivered';
  total_price: number;
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Menu Management</h2>
      </div>

      {/* Add Item Form */}
      <Card className="mb-6 shadow-sm">
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
    <div className="flex h-[calc(100vh-200px)]">
      {/* Messages List */}
      <div className="flex-1 flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Customer Messages</h2>
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
  );
};

// OrdersPanel component with better UI
const OrdersPanel = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // Fetch orders
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`)
      .then(res => res.json())
      .then(data => setOrders(data))
      .catch(() => message.error('Failed to fetch orders'));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Current Orders</h2>
        <div className="flex gap-2">
          <Select defaultValue="all" style={{ width: 120 }}>
            <Select.Option value="all">All Orders</Select.Option>
            <Select.Option value="pending">Pending</Select.Option>
            <Select.Option value="preparing">Preparing</Select.Option>
            <Select.Option value="ready">Ready</Select.Option>
            <Select.Option value="delivered">Delivered</Select.Option>
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card className="text-center py-8">
          <ShoppingCartOutlined style={{ fontSize: 48 }} className="text-gray-300 mb-4" />
          <p className="text-gray-600">No active orders at the moment</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => (
            <Card key={order.id} className="shadow-md p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Table: {order.table_number}</span>
                <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</span>
              </div>
              <div className="mb-2">
                <span className="font-medium">Status: </span>
                <span className="capitalize text-blue-600">{order.status}</span>
              </div>
              <div>
                <span className="font-medium">Items:</span>
                <ul className="list-disc list-inside ml-2">
                  {order.items.map(item => (
                    <li key={item.id} className="text-sm">
                      {item.name} × {item.quantity_per_serve} — ₹{item.price}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span className="text-lg text-red-600 font-bold">₹{order.total_price}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const PreferencesPanel = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold mb-6">Customer Preferences</h2>
    <Card className="shadow-sm">
      <p className="text-gray-600">Customer preferences tracking coming soon...</p>
    </Card>
  </div>
);

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
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Customer Feedback</h2>
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, []);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Daily Reports</h2>
      <Card className="shadow-sm mb-4">
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
      <Card className="shadow-sm">
        <p className="text-gray-600">Analytics and reporting dashboard coming soon...</p>
      </Card>
    </div>
  );
};

const MusicPanel = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold mb-6">Song Requests</h2>
    <Card className="shadow-sm">
      <p className="text-gray-600">Music request management coming soon...</p>
    </Card>
  </div>
);

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

      return () => {
        socket.disconnect();
      };
    } catch (error) {
      console.error('Socket setup error:', error);
    }
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'orders': return <OrdersPanel />;
      case 'preferences': return <PreferencesPanel />;
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
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1">
          {/* Sidebar for desktop */}
          <div className="hidden md:block">
            <Sider 
              collapsible 
              collapsed={collapsed} 
              onCollapse={(value: boolean) => setCollapsed(value)}
              width={250}
              className="min-h-screen shadow-lg"
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
              <div className="relative w-64 bg-white min-h-screen shadow-lg z-50">
                <Sider
                  collapsed={false}
                  width={250}
                  className="min-h-screen shadow-lg"
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
            </div>
          )}
          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            <Header style={{ padding: '0 16px', background: colorBgContainer }} className="shadow-sm sticky top-0 z-30">
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
            <Content className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8" style={{ overflow: 'auto' }}>
              <div
                className="rounded-lg min-h-[280px]"
                style={{
                  background: colorBgContainer,
                  padding: 0,
                  backgroundImage:
                    'radial-gradient(circle, #e5e7eb 1px, transparent 1px), radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              >
                <div className="p-2 sm:p-4 md:p-6 lg:p-8">
                  {renderContent()}
                </div>
              </div>
            </Content>
          </div>
        </div>
      </div>
    </ConfigProvider>
  );
}