import { useEffect, useState } from 'react';
import {
  Typography, Card, Row, Col, Button, Tag, Spin, Alert,
  Descriptions, Statistic, Space, Popconfirm, message
} from 'antd';
import {
  CrownOutlined, CalendarOutlined, CheckCircleOutlined,
  CloseCircleOutlined, ReloadOutlined, SyncOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscription.service';
import { UserSubscriptionDto } from '../../types/api';

const { Title, Text } = Typography;

export function CurrentSubscriptionPage() {
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<UserSubscriptionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getCurrentSubscription();
      setSubscription(data);
    } catch (err: any) {
      setError(err.message || 'Abonelik bilgileri yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await subscriptionService.cancelSubscription();
      message.success('Abonelik iptal edildi');
      await load();
    } catch (err: any) {
      message.error(err.message || 'Abonelik iptal edilemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenew = async () => {
    try {
      setActionLoading(true);
      await subscriptionService.renewSubscription();
      message.success('Abonelik yenilendi');
      await load();
    } catch (err: any) {
      message.error(err.message || 'Abonelik yenilenemedi');
    } finally {
      setActionLoading(false);
    }
  };

  const statusTag = (status: string, isActive: boolean) => {
    if (isActive) return <Tag icon={<CheckCircleOutlined />} color="success">Aktif</Tag>;
    if (status === 'Cancelled') return <Tag icon={<CloseCircleOutlined />} color="error">İptal Edildi</Tag>;
    return <Tag color="default">{status}</Tag>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Mevcut Abonelik</Title>
          <Text type="secondary">Aktif abonelik bilgileriniz</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={load}>Yenile</Button>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom: 24 }} />
      )}

      {!subscription ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CrownOutlined style={{ fontSize: 48, color: '#d9d9d9', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#8c8c8c' }}>Aktif abonelik bulunamadı</Title>
            <Text type="secondary">Bir plan seçerek avantajlardan yararlanabilirsiniz.</Text>
            <div style={{ marginTop: 24 }}>
              <Button type="primary" size="large" onClick={() => navigate('/subscription')}>
                Plan Seç
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <Space>
                  <CrownOutlined style={{ color: '#faad14' }} />
                  <span>Plan Bilgileri</span>
                </Space>
              }
            >
              <Descriptions column={{ xs: 1, sm: 2 }} size="middle">
                <Descriptions.Item label="Plan Adı">
                  <Text strong>{subscription.plan.displayName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Durum">
                  {statusTag(subscription.status, subscription.isCurrentlyActive)}
                </Descriptions.Item>
                <Descriptions.Item label="Başlangıç Tarihi">
                  <Space>
                    <CalendarOutlined />
                    {new Date(subscription.startDate).toLocaleDateString('tr-TR')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Bitiş Tarihi">
                  <Space>
                    <CalendarOutlined />
                    {new Date(subscription.endDate).toLocaleDateString('tr-TR')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Otomatik Yenileme">
                  {subscription.autoRenew
                    ? <Tag icon={<SyncOutlined />} color="blue">Açık</Tag>
                    : <Tag color="default">Kapalı</Tag>}
                </Descriptions.Item>
                <Descriptions.Item label="Fiyat">
                  <Text strong>
                    {subscription.plan.price.toLocaleString('tr-TR')} {subscription.plan.currency}
                    / {subscription.plan.billingPeriod}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                {subscription.isCurrentlyActive && (
                  <>
                    <Button onClick={() => navigate('/subscription')}>Plan Değiştir</Button>
                    <Popconfirm
                      title="Aboneliği iptal etmek istediğinizden emin misiniz?"
                      onConfirm={handleCancel}
                      okText="Evet"
                      cancelText="Hayır"
                      okButtonProps={{ danger: true }}
                    >
                      <Button danger loading={actionLoading}>İptal Et</Button>
                    </Popconfirm>
                  </>
                )}
                {!subscription.isCurrentlyActive && (
                  <Button type="primary" onClick={handleRenew} loading={actionLoading}
                    icon={<SyncOutlined />}>
                    Yenile
                  </Button>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card>
              <Statistic
                title="Kalan Süre"
                value={subscription.daysRemaining}
                suffix="gün"
                valueStyle={{
                  color: subscription.daysRemaining < 7 ? '#ff4d4f'
                    : subscription.daysRemaining < 30 ? '#faad14' : '#52c41a',
                  fontSize: 36,
                }}
              />
            </Card>

            <Card style={{ marginTop: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Text strong>Plan Özellikleri</Text>
                <div>
                  <Text type="secondary">Makine Seçimi: </Text>
                  <Text>{subscription.plan.machineSelectionText}</Text>
                </div>
                <div>
                  <Text type="secondary">Seviye: </Text>
                  <Tag color="blue">Level {subscription.plan.level}</Tag>
                </div>
              </Space>
            </Card>

            <Card style={{ marginTop: 16 }}>
              <Button block onClick={() => navigate('/subscription/payments')}>
                Ödeme Geçmişi
              </Button>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
