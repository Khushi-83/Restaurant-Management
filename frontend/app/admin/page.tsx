'use client';

import { useEffect, useState } from 'react';
import { Layout, Menu, theme, message, notification } from 'antd';
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

  // Real-Time Setup
  useEffect(() => {
    socket.connect();
    
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
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value: boolean) => setCollapsed(value)}
        width={250}
      >
        <div className="demo-logo-vertical" style={{
          height: '64px',
          margin: '16px',
          background: 'rgba(255, 255, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '18px',
          fontWeight: 'bold'
        }}>
          {collapsed ? 'RMS' : 'Restaurant Admin'}
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={['orders']}
          mode="inline"
          onSelect={(info: { key: string }) => setActiveTab(info.key)}
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
            borderRadius: '8px'
          }}>
            {renderContent()}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

// Placeholder components for each panel
const OrdersPanel = () => (
  <div>
    <h2>Current Orders</h2>
    {/* Order management table will go here */}
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