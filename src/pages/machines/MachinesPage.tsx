import { useEffect, useState } from 'react';
import {
  Typography, Card, Row, Col, Spin, Alert, Button, Tag, Empty,
  message, Badge, Tooltip, Input
} from 'antd';
import {
  ToolOutlined, CheckCircleOutlined, PlusCircleOutlined,
  MinusCircleOutlined, ReloadOutlined, SearchOutlined
} from '@ant-design/icons';
import { httpClient } from '../../lib/http-client';
import { API_CONFIG } from '../../lib/config';
import { LaserMachineListDto } from '../../types/api';

const { Title, Text } = Typography;

export function MachinesPage() {
  const [machines, setMachines] = useState<LaserMachineListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const loadMachines = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await httpClient.get<LaserMachineListDto[]>(API_CONFIG.ENDPOINTS.MACHINES.ALL);
      setMachines(data);
    } catch (err: any) {
      setError(err.message || 'Makineler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMachines();
  }, []);

  const handleSelect = async (machine: LaserMachineListDto) => {
    try {
      setActionLoading(machine.id);
      if (machine.isSelected) {
        await httpClient.post(API_CONFIG.ENDPOINTS.MACHINES.UNSELECT(machine.id));
        message.success(`${machine.brand} seçimi kaldırıldı`);
      } else {
        await httpClient.post(API_CONFIG.ENDPOINTS.MACHINES.SELECT(machine.id));
        message.success(`${machine.brand} seçildi`);
      }
      await loadMachines();
    } catch (err: any) {
      message.error(err.message || 'İşlem gerçekleştirilemedi');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = machines.filter(m =>
    m.brand.toLowerCase().includes(search.toLowerCase()) ||
    (m.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const selectedCount = machines.filter(m => m.isSelected).length;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Makineler yükleniyor..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>Makineler</Title>
          <Text type="secondary">Laser kesim makinelerinizi seçin ve yönetin</Text>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge count={selectedCount} showZero color="#52c41a">
            <Tag icon={<CheckCircleOutlined />} color="success" style={{ padding: '4px 12px' }}>
              Seçili
            </Tag>
          </Badge>
          <Button icon={<ReloadOutlined />} onClick={loadMachines}>Yenile</Button>
        </div>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom: 24 }} />
      )}

      <Input
        placeholder="Makine ara..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ marginBottom: 24, maxWidth: 400 }}
        allowClear
      />

      {filtered.length === 0 ? (
        <Empty description="Makine bulunamadı" />
      ) : (
        <Row gutter={[16, 16]}>
          {filtered.map(machine => (
            <Col xs={24} sm={12} lg={8} xl={6} key={machine.id}>
              <Card
                hoverable
                style={{
                  borderColor: machine.isSelected ? '#52c41a' : undefined,
                  borderWidth: machine.isSelected ? 2 : 1,
                }}
                actions={[
                  <Tooltip title={!machine.hasAccess ? 'Bu makine için aboneliğiniz yok' : ''} key="action">
                    <Button
                      type={machine.isSelected ? 'default' : 'primary'}
                      danger={machine.isSelected}
                      icon={machine.isSelected ? <MinusCircleOutlined /> : <PlusCircleOutlined />}
                      loading={actionLoading === machine.id}
                      disabled={!machine.hasAccess}
                      onClick={() => handleSelect(machine)}
                      size="small"
                    >
                      {machine.isSelected ? 'Kaldır' : 'Seç'}
                    </Button>
                  </Tooltip>
                ]}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 8,
                    background: machine.isSelected ? '#f6ffed' : '#f0f0f0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ToolOutlined style={{ fontSize: 20, color: machine.isSelected ? '#52c41a' : '#8c8c8c' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text strong style={{ fontSize: 15 }}>{machine.brand}</Text>
                      {machine.isSelected && (
                        <Tag color="success" style={{ margin: 0 }}>Seçili</Tag>
                      )}
                    </div>
                    {machine.description && (
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                        {machine.description}
                      </Text>
                    )}
                    <div style={{ marginTop: 8 }}>
                      <Tag color={machine.hasAccess ? 'blue' : 'default'} style={{ fontSize: 11 }}>
                        {machine.accessType || (machine.hasAccess ? 'Erişilebilir' : 'Kısıtlı')}
                      </Tag>
                      {machine.selectionOrder && (
                        <Tag color="geekblue" style={{ fontSize: 11 }}>
                          #{machine.selectionOrder}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </div>
  );
}
