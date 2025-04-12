'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, theme, message, notification, ConfigProvider, List, Avatar, Input, Button } from 'antd';
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
} from '@ant-design/icons';
import { socket } from '@/lib/socket';

const { Header, Sider, Content } = Layout;

// Add this type for our messages
type ChatMessage = {
  id?: string;
  sender: string;
  message: string;
  table_number: string;
  timestamp: string;
};

// MessagesPanel component
const MessagesPanel = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  useEffect(() => {
    socket.on('new_message', (msg: ChatMessage) => {
      setMessages(prev => [...prev, msg]);
    });

    // Fetch existing messages
    fetch('/api/chat/messages')
      .then(res => res.json())
      .then(data => setMessages(data))
      .catch(error => console.error('Error fetching messages:', error));

    return () => {
      socket.off('new_message');
    };
  }, []);

  const handleSendReply = () => {
    if (!selectedTable || !replyText.trim()) return;

    const reply: ChatMessage = {
      sender: 'Admin',
      message: replyText,
      table_number: selectedTable,
      timestamp: new Date().toISOString()
    };

    socket.emit('admin_reply', reply);
    setMessages(prev => [...prev, reply]);
    setReplyText('');
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
                      <span>{msg.sender === 'Admin' ? 'Admin' : `Table ${msg.table_number}`}</span>
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
            prefix={
              <select 
                value={selectedTable || ''} 
                onChange={(e) => setSelectedTable(e.target.value)}
                className="border-none outline-none bg-transparent mr-2"
                aria-label="Select table number"
              >
                <option value="">Select Table</option>
                {Array.from({ length: 10 }, (_, i) => i + 1).map(num => (
                  <option key={num} value={num}>Table {num}</option>
                ))}
              </select>
            }
          />
          <Button 
            type="primary" 
            icon={<SendOutlined />}
            onClick={handleSendReply}
            disabled={!selectedTable || !replyText.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
};

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('messages');
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
      default: return <OrdersPanel />;
    }
  };

  return (
    <ConfigProvider>
      <Layout style={{ minHeight: '100vh' }}>
        <Sider 
          collapsible 
          collapsed={collapsed} 
          onCollapse={(value: boolean) => setCollapsed(value)}
          width={250}
          className="min-h-screen"
        >
          <div className="h-16 m-4 bg-white/20 flex items-center justify-center text-white text-lg font-bold">
            {collapsed ? 'RMS' : 'Restaurant Admin'}
          </div>
          <Menu
            theme="dark"
            defaultSelectedKeys={['orders']}
            mode="inline"
            onSelect={({ key }) => setActiveTab(key)}
            items={[
              {
                key: 'orders',
                icon: <ShoppingCartOutlined />,
                label: 'Orders',
              },
              {
                key: 'preferences',
                icon: <UserOutlined />,
                label: 'Customer Preferences',
              },
              {
                key: 'menu',
                icon: <AppstoreOutlined />,
                label: 'Menu Management',
              },
              {
                key: 'feedback',
                icon: <StarOutlined />,
                label: 'Customer Feedback',
              },
              {
                key: 'reports',
                icon: <PieChartOutlined />,
                label: 'Daily Reports',
              },
              {
                key: 'messages',
                icon: <MessageOutlined />,
                label: 'Customer Messages',
              },
              {
                key: 'music',
                icon: <AudioOutlined />,
                label: 'Song Requests',
              },
              {
                key: 'settings',
                icon: <SettingOutlined />,
                label: 'Settings',
              },
            ]}
          />
        </Sider>
        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }} />
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ 
              padding: 24, 
              background: colorBgContainer,
              borderRadius: '8px',
              minHeight: '280px'
            }}>
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

// Add some actual content to the OrdersPanel as an example
const OrdersPanel = () => (
  <div className="space-y-4">
    <h2 className="text-2xl font-bold">Current Orders</h2>
    <div className="bg-white p-4 rounded-lg shadow">
      <p className="text-gray-600">No active orders at the moment</p>
    </div>
  </div>
);

const PreferencesPanel = () => (
  <div>
    <h2>Customer Preferences</h2>
    {/* Preferences tracking will go here */}
  </div>
);

const MenuPanel = () => (
  <div>
    <h2>Menu Management</h2>
    {/* Menu CRUD interface will go here */}
  </div>
);

const FeedbackPanel = () => (
  <div>
    <h2>Customer Feedback</h2>
    {/* Feedback review system will go here */}
  </div>
);

const ReportsPanel = () => (
  <div>
    <h2>Daily Reports</h2>
    {/* Reports and analytics will go here */}
  </div>
);

const MusicPanel = () => (
  <div>
    <h2>Song Requests</h2>
    {/* Music request management will go here */}
  </div>
);