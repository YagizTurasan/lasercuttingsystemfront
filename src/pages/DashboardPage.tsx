import { useEffect, useState } from 'react';
import { Typography, Card, Row, Col, Spin, Alert, Button } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { dashboardService, DashboardStats } from '../services/dashboard.service';

const { Title, Text } = Typography;

export function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardStats = await dashboardService.getDashboardStats();
      setStats(dashboardStats);
    } catch (err: any) {
      setError(err.message || 'Dashboard verileri yüklenemedi');
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const handleRefresh = () => {
    loadDashboardStats();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" tip="Dashboard yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <Title level={2}>Hoş geldiniz, {user?.firstName}!</Title>
          <Text type="secondary">Laser kesim sistemi dashboard'ınız</Text>
        </div>
        <Button 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
          loading={loading}
        >
          Yenile
        </Button>
      </div>

      {error && (
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: '24px' }}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#52c41a', margin: '0 0 8px 0' }}>
                {stats?.selectedMachinesCount || 0}
              </Title>
              <Text>Seçili Makineler</Text>
              {stats?.selectedMachinesCount === 0 && (
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Henüz makine seçmediniz
                  </Text>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title level={3} style={{ color: '#1890ff', margin: '0 0 8px 0' }}>
                {stats?.totalErrorCodes?.toLocaleString('tr-TR') || 0}
              </Title>
              <Text>Erişilebilir Hata Kodları</Text>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  ({stats?.freeErrorCodes || 0} ücretsiz)
                </Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card>
            <div style={{ textAlign: 'center' }}>
              <Title 
                level={3} 
                style={{ 
                  color: stats?.userInfo.hasActiveSubscription ? '#52c41a' : '#faad14',
                  margin: '0 0 8px 0'
                }}
              >
                {stats?.subscriptionStatus || 'Free'}
              </Title>
              <Text>Abonelik Durumu</Text>
              <div style={{ marginTop: '8px' }}>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Level: {stats?.userInfo.subscriptionLevel || '0'}
                </Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Additional Info Cards */}
      <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
        <Col xs={24}>
          <Card title="Sistem Durumu" size="small">
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Makine Seçimi</Text>
                  <div>
                    <Text type={stats?.userInfo.canSelectMachines ? 'success' : 'warning'}>
                      {stats?.userInfo.canSelectMachines ? 'Aktif' : 'Pasif'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Hesap Durumu</Text>
                  <div>
                    <Text type={user?.emailConfirmed ? 'success' : 'warning'}>
                      {user?.emailConfirmed ? 'Doğrulanmış' : 'Bekliyor'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Şirket</Text>
                  <div>
                    <Text>
                      {user?.companyName || 'Belirtilmemiş'}
                    </Text>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={6}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong>Üyelik</Text>
                  <div>
                    <Text type="secondary">
                      {new Date().toLocaleDateString('tr-TR')}
                    </Text>
                  </div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}