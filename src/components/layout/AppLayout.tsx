import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography } from 'antd';
import {
  DashboardOutlined,
  ToolOutlined,
  WarningOutlined,
  CrownOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  CreditCardOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/machines',
      icon: <ToolOutlined />,
      label: 'Makineler',
    },
    {
      key: '/error-codes',
      icon: <WarningOutlined />,
      label: 'Hata Kodları',
    },
    {
      key: 'subscription',
      icon: <CrownOutlined />,
      label: 'Abonelik',
      children: [
        {
          key: '/subscription',
          icon: <CrownOutlined />,
          label: 'Planlar',
        },
        {
          key: '/subscription/current',
          icon: <CreditCardOutlined />,
          label: 'Mevcut Abonelik',
        },
        {
          key: '/subscription/payments',
          icon: <HistoryOutlined />,
          label: 'Ödeme Geçmişi',
        },
      ],
    },
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Profil',
    },
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profil',
      onClick: () => navigate('/profile'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Çıkış Yap',
      danger: true,
      onClick: async () => {
        await logout();
        navigate('/login');
      },
    },
  ];

  const selectedKey = location.pathname;

  const openKeys = menuItems
    .filter((item: any) => item.children?.some((c: any) => c.key === selectedKey))
    .map((item: any) => item.key);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#001529',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
        width={220}
      >
        <div style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '0 16px',
        }}>
          {collapsed ? (
            <ToolOutlined style={{ color: '#1890ff', fontSize: 24 }} />
          ) : (
            <Text strong style={{ color: '#fff', fontSize: 14 }}>
              Laser Cutting
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[selectedKey]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8 }}
        />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 220, transition: 'margin-left 0.2s' }}>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 4px rgba(0,21,41,0.08)',
          position: 'sticky',
          top: 0,
          zIndex: 99,
        }}>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: 16 }}
          />
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <Text strong>{user?.firstName} {user?.lastName}</Text>
            </div>
          </Dropdown>
        </Header>

        <Content style={{ margin: 0, minHeight: 'calc(100vh - 64px)', background: '#f5f5f5' }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
