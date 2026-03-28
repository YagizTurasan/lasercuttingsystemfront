import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Tag, Button, Alert, Spin, Space
} from 'antd';
import {
  HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ClockCircleOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { subscriptionService } from '../../services/subscription.service';
import { PaymentHistoryDto } from '../../types/api';

const { Title, Text } = Typography;

export function PaymentHistoryPage() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentHistoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await subscriptionService.getPaymentHistory();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Ödeme geçmişi yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const statusTag = (status: string) => {
    const map: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
      Completed: { color: 'success', icon: <CheckCircleOutlined />, label: 'Tamamlandı' },
      Failed: { color: 'error', icon: <CloseCircleOutlined />, label: 'Başarısız' },
      Pending: { color: 'warning', icon: <ClockCircleOutlined />, label: 'Bekliyor' },
    };
    const s = map[status] || { color: 'default', icon: null, label: status };
    return <Tag icon={s.icon} color={s.color}>{s.label}</Tag>;
  };

  const columns = [
    {
      title: 'Tarih',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 140,
      render: (date: string) => new Date(date).toLocaleDateString('tr-TR'),
      sorter: (a: PaymentHistoryDto, b: PaymentHistoryDto) =>
        new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
      defaultSortOrder: 'ascend' as const,
    },
    {
      title: 'Plan',
      dataIndex: 'planName',
      key: 'planName',
      render: (plan: string) => <Tag color="blue">{plan}</Tag>,
    },
    {
      title: 'Tutar',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number, record: PaymentHistoryDto) => (
        <Text strong>{amount.toLocaleString('tr-TR')} {record.currency}</Text>
      ),
    },
    {
      title: 'Durum',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: statusTag,
    },
    {
      title: 'İşlem No',
      dataIndex: 'paymentProviderId',
      key: 'paymentProviderId',
      render: (id: string) => id
        ? <Text type="secondary" copyable style={{ fontSize: 11, fontFamily: 'monospace' }}>{id}</Text>
        : <Text type="secondary">-</Text>,
    },
  ];

  const totalPaid = payments
    .filter(p => p.status === 'Completed')
    .reduce((sum, p) => sum + p.amount, 0);

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
          <Title level={2} style={{ margin: 0 }}>
            <HistoryOutlined style={{ marginRight: 8 }} />
            Ödeme Geçmişi
          </Title>
          <Text type="secondary">Geçmiş abonelik ödemeleriniz</Text>
        </div>
        <Space>
          <Button onClick={() => navigate('/subscription/current')}>Mevcut Abonelik</Button>
          <Button icon={<ReloadOutlined />} onClick={load}>Yenile</Button>
        </Space>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom: 24 }} />
      )}

      {payments.length > 0 && (
        <Card style={{ marginBottom: 16, background: '#f6ffed', borderColor: '#b7eb8f' }}>
          <Space size="large">
            <div>
              <Text type="secondary">Toplam İşlem</Text>
              <div><Text strong style={{ fontSize: 18 }}>{payments.length}</Text></div>
            </div>
            <div>
              <Text type="secondary">Toplam Ödeme</Text>
              <div>
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {totalPaid.toLocaleString('tr-TR')} {payments[0]?.currency}
                </Text>
              </div>
            </div>
          </Space>
        </Card>
      )}

      <Card>
        <Table
          columns={columns}
          dataSource={payments}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: 'Henüz ödeme kaydı yok' }}
          pagination={{ pageSize: 20, showTotal: t => `Toplam ${t} kayıt` }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
}
