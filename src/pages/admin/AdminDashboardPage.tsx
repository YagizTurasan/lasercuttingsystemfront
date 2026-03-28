import { useEffect } from 'react';
import {
  Typography, Card, Row, Col, Statistic, Spin, Alert, Button,
  List, Tag, Space
} from 'antd';
import {
  UserOutlined, ToolOutlined, WarningOutlined, CrownOutlined,
  DollarOutlined, ReloadOutlined, RiseOutlined
} from '@ant-design/icons';
import { useAdminDashboard } from '../../hooks/useAdmin';

const { Title, Text } = Typography;

export function AdminDashboardPage() {
  const {
    dashboardSummary, revenueStats, recentActivities,
    loading, error,
    refreshDashboard, refreshRevenue, refreshActivities
  } = useAdminDashboard();

  const loadAll = async () => {
    await Promise.all([
      refreshDashboard(),
      refreshRevenue(),
      refreshActivities({ pageNumber: 1, pageSize: 10 }),
    ]);
  };

  useEffect(() => { loadAll(); }, []);

  if (loading && !dashboardSummary) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Admin dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Admin Dashboard</Title>
          <Text type="secondary">
            Son güncelleme: {dashboardSummary?.lastUpdated
              ? new Date(dashboardSummary.lastUpdated).toLocaleString('tr-TR')
              : '-'}
          </Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={loadAll} loading={loading}>Yenile</Button>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable style={{ marginBottom: 24 }} />
      )}

      {/* Ana İstatistikler */}
      <Row gutter={[16, 16]}>
        {[
          { title: 'Toplam Kullanıcı', value: dashboardSummary?.totalUsers, prefix: <UserOutlined />, color: '#1890ff' },
          { title: 'Aktif Kullanıcı', value: dashboardSummary?.activeUsers, prefix: <UserOutlined />, color: '#52c41a' },
          { title: 'Toplam Makine', value: dashboardSummary?.totalMachines, prefix: <ToolOutlined />, color: '#722ed1' },
          { title: 'Hata Kodu', value: dashboardSummary?.totalErrorCodes, prefix: <WarningOutlined />, color: '#faad14' },
          { title: 'Aktif Abonelik', value: dashboardSummary?.activeSubscriptions, prefix: <CrownOutlined />, color: '#13c2c2' },
          { title: 'Aylık Gelir', value: dashboardSummary?.monthlyRevenue, prefix: <DollarOutlined />, color: '#52c41a', suffix: '₺' },
        ].map((item, idx) => (
          <Col xs={12} sm={8} lg={4} key={idx}>
            <Card>
              <Statistic
                title={item.title}
                value={item.value ?? 0}
                prefix={<span style={{ color: item.color }}>{item.prefix}</span>}
                suffix={item.suffix}
                valueStyle={{ color: item.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Gelir Kartları */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12}>
          <Card title={<Space><DollarOutlined /><span>Gelir İstatistikleri</span></Space>} size="small">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Bu Ay"
                  value={revenueStats?.currentMonthRevenue ?? 0}
                  suffix="₺"
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Geçen Ay"
                  value={revenueStats?.lastMonthRevenue ?? 0}
                  suffix="₺"
                  valueStyle={{ color: '#8c8c8c' }}
                />
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Statistic
                  title="Bu Yıl"
                  value={revenueStats?.currentYearRevenue ?? 0}
                  suffix="₺"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12} style={{ marginTop: 16 }}>
                <Statistic
                  title="Büyüme"
                  value={revenueStats?.monthlyGrowthRate ?? 0}
                  suffix="%"
                  prefix={<RiseOutlined />}
                  precision={1}
                  valueStyle={{ color: (revenueStats?.monthlyGrowthRate ?? 0) >= 0 ? '#52c41a' : '#ff4d4f' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card title="Son Aktiviteler" size="small" style={{ height: '100%' }}>
            <List
              size="small"
              dataSource={recentActivities?.items?.slice(0, 6) || []}
              locale={{ emptyText: 'Aktivite yok' }}
              renderItem={item => (
                <List.Item style={{ padding: '6px 0' }}>
                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Tag color="blue" style={{ fontSize: 11 }}>{item.activityType}</Tag>
                      <Text type="secondary" style={{ fontSize: 11 }}>{item.timeAgo}</Text>
                    </div>
                    <Text style={{ fontSize: 12 }}>{item.description}</Text>
                    {item.userName && (
                      <div>
                        <Text type="secondary" style={{ fontSize: 11 }}>{item.userName}</Text>
                      </div>
                    )}
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
