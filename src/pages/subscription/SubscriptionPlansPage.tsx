import { useEffect, useState } from 'react';
import {
  Typography, Card, Row, Col, Button, Tag, Spin, Alert,
  List, message
} from 'antd';
import {
  CrownOutlined, CheckOutlined, ThunderboltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscription.service';
import { SubscriptionPlanDto } from '../../types/api';

const { Title, Text } = Typography;

export function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<SubscriptionPlanDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await subscriptionService.getAvailablePlans();
        setPlans(data);
      } catch (err: any) {
        setError(err.message || 'Planlar yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlanDto) => {
    if (plan.isFreePlan) return;
    try {
      setSubscribing(plan.id);
      await subscriptionService.subscribe({ planId: plan.id, autoRenew: true });
      message.success(`${plan.displayName} planına başarıyla abone oldunuz!`);
      navigate('/subscription/current');
    } catch (err: any) {
      message.error(err.message || 'Abonelik gerçekleştirilemedi');
    } finally {
      setSubscribing(null);
    }
  };

  const getPlanColor = (level: number) => {
    if (level === 0) return '#8c8c8c';
    if (level === 1) return '#1890ff';
    if (level === 2) return '#faad14';
    return '#722ed1';
  };

  const getPlanIcon = (level: number) => {
    if (level >= 2) return <CrownOutlined />;
    if (level === 1) return <ThunderboltOutlined />;
    return <CheckOutlined />;
  };

  const getPlanFeatures = (plan: SubscriptionPlanDto) => [
    plan.machineSelectionText || `${plan.maxMachineSelection} makine seçimi`,
    plan.canAccessAllMachines ? 'Tüm makinelere erişim' : 'Seçili makine erişimi',
    plan.hasUnlimitedMachineSelection ? 'Sınırsız makine seçimi' : null,
    plan.level >= 2 ? 'Tüm hata kodlarına tam erişim' : 'Temel hata kodu erişimi',
    plan.level >= 3 ? 'Öncelikli destek' : null,
  ].filter(Boolean) as string[];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Planlar yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Abonelik Planları</Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          İhtiyaçlarınıza en uygun planı seçin
        </Text>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom: 24 }} />
      )}

      <Row gutter={[24, 24]} justify="center">
        {plans.map(plan => {
          const color = getPlanColor(plan.level);
          const isPopular = plan.level === 2;
          return (
            <Col xs={24} sm={12} lg={6} key={plan.id}>
              <Card
                style={{
                  borderColor: isPopular ? color : undefined,
                  borderWidth: isPopular ? 2 : 1,
                  position: 'relative',
                  height: '100%',
                }}
                styles={{ body: { padding: 24 } }}
              >
                {isPopular && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%',
                    transform: 'translateX(-50%)',
                    background: color, color: '#fff',
                    padding: '2px 16px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}>
                    En Popüler
                  </div>
                )}
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: `${color}15`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 12px',
                    fontSize: 24, color,
                  }}>
                    {getPlanIcon(plan.level)}
                  </div>
                  <Title level={4} style={{ margin: 0, color }}>{plan.displayName}</Title>
                  <div style={{ marginTop: 12 }}>
                    {plan.isFreePlan ? (
                      <Title level={2} style={{ margin: 0, color }}>Ücretsiz</Title>
                    ) : (
                      <>
                        <Title level={2} style={{ margin: 0, color }}>
                          {plan.price.toLocaleString('tr-TR')} {plan.currency}
                        </Title>
                        <Text type="secondary">/ {plan.billingPeriod}</Text>
                      </>
                    )}
                  </div>
                  {plan.level > 0 && (
                    <Tag color="blue" style={{ marginTop: 8 }}>Seviye {plan.level}</Tag>
                  )}
                </div>

                <List
                  size="small"
                  dataSource={getPlanFeatures(plan)}
                  renderItem={item => (
                    <List.Item style={{ padding: '6px 0', border: 'none' }}>
                      <CheckOutlined style={{ color: '#52c41a', marginRight: 8, flexShrink: 0 }} />
                      <Text style={{ fontSize: 13 }}>{item}</Text>
                    </List.Item>
                  )}
                  style={{ marginBottom: 24 }}
                />

                <Button
                  type={plan.isFreePlan ? 'default' : 'primary'}
                  block
                  size="large"
                  loading={subscribing === plan.id}
                  disabled={plan.isFreePlan}
                  onClick={() => handleSubscribe(plan)}
                  style={!plan.isFreePlan ? { background: color, borderColor: color } : {}}
                >
                  {plan.isFreePlan ? 'Mevcut Plan' : 'Seç'}
                </Button>
              </Card>
            </Col>
          );
        })}
      </Row>

      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Button type="link" onClick={() => navigate('/subscription/current')}>
          Mevcut aboneliğimi görüntüle
        </Button>
      </div>
    </div>
  );
}
