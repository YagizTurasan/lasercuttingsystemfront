import { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Typography, Tag } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  ToolOutlined,
  WarningOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Kullanıcılar',
    },
    {
      key: '/admin/machines',
      icon: <ToolOutlined />,
      label: 'Makineler',
    },
    {
      key: '/admin/error-codes',
      icon: <WarningOutlined />,
      label: 'Hata Kodları',
    },
  ];

  const userMenuItems = [
    {
      key: 'user-panel',
      icon: <DashboardOutlined />,
      label: 'Kullanıcı Paneli',
      onClick: () => navigate('/dashboard'),
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        style={{
          background: '#141414',
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
          gap: 8,
        }}>
          <SafetyOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
          {!collapsed && (
            <Text strong style={{ color: '#fff', fontSize: 13 }}>
              Admin Panel
            </Text>
          )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{ borderRight: 0, marginTop: 8, background: '#141414' }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <Tag color="red" icon={<SafetyOutlined />}>Admin</Tag>
          </div>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#ff4d4f' }} />
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
