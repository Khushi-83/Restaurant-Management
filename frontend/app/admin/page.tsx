'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, theme, message, notification, ConfigProvider } from 'antd';
import {
  AppstoreOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  MessageOutlined,
  PieChartOutlined,
  SettingOutlined,
  StarOutlined,
  AudioOutlined,
} from '@ant-design/icons';
import { socket } from '@/lib/socket';

const { Header, Sider, Content } = Layout;

export default function AdminDashboard() {
  const [collapsed, setCollapsed] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('orders');
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Real-Time Setup with error handling
  useEffect(() => {
    try {
      socket.connect();
      
      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        message.error('Failed to connect to real-time updates');
      });
      
      socket.on('order_update', (order) => {
        message.success(`New order from Table ${order.table_number}`);
      });
      
      socket.on('new_message', (msg) => {
        notification.info({
          message: `Message from ${msg.sender}`,
          description: msg.message,
        });
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

const MessagesPanel = () => (
  <div>
    <h2>Customer Messages</h2>
    {/* Real-time chat interface will go here */}
  </div>
);

const MusicPanel = () => (
  <div>
    <h2>Song Requests</h2>
    {/* Music request management will go here */}
  </div>
);