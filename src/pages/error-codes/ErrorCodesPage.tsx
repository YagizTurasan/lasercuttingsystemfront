import { useEffect, useState } from 'react';
import {
  Typography, Card, Table, Tag, Input, Button, Alert,
  Space, Select, Tooltip
} from 'antd';
import {
  SearchOutlined, WarningOutlined, ReloadOutlined, EyeOutlined, LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../../lib/http-client';
import { API_CONFIG } from '../../lib/config';
import { ErrorCodeListDto, PagedResult, SearchRequest } from '../../types/api';

const { Title, Text } = Typography;

export function ErrorCodesPage() {
  const navigate = useNavigate();
  const [errorCodes, setErrorCodes] = useState<ErrorCodeListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [accessFilter, setAccessFilter] = useState<string | undefined>(undefined);

  const loadErrorCodes = async (pageNum = page, q = search, access = accessFilter) => {
    try {
      setLoading(true);
      setError(null);
      const request: SearchRequest = {
        query: q || undefined,
        pageNumber: pageNum,
        pageSize,
        filters: access ? { accessLevel: access } : undefined,
      };
      const result = await httpClient.post<PagedResult<ErrorCodeListDto>>(
        API_CONFIG.ENDPOINTS.ERROR_CODES.SEARCH,
        request
      );
      setErrorCodes(result.items);
      setTotal(result.totalCount);
    } catch (err: any) {
      setError(err.message || 'Hata kodları yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadErrorCodes();
  }, []);

  const handleSearch = () => {
    setPage(1);
    loadErrorCodes(1, search, accessFilter);
  };

  const accessLevelTag = (level: string, hasAccess: boolean) => {
    if (!hasAccess) return <Tag icon={<LockOutlined />} color="default">Kısıtlı</Tag>;
    if (level === 'Free') return <Tag color="green">Ücretsiz</Tag>;
    if (level === 'Premium') return <Tag color="gold">Premium</Tag>;
    return <Tag color="blue">{level}</Tag>;
  };

  const columns = [
    {
      title: 'Kod',
      dataIndex: 'code',
      key: 'code',
      width: 100,
      render: (code: string) => <Text strong style={{ fontFamily: 'monospace' }}>{code}</Text>,
    },
    {
      title: 'Başlık',
      dataIndex: 'title',
      key: 'title',
      render: (title: string, record: ErrorCodeListDto) => (
        <div>
          <Text>{title}</Text>
          {record.fullHierarchyPath && (
            <div>
              <Text type="secondary" style={{ fontSize: 11 }}>{record.fullHierarchyPath}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Makine',
      dataIndex: 'machineBrand',
      key: 'machineBrand',
      width: 130,
      render: (brand: string) => brand ? <Tag color="blue">{brand}</Tag> : <Text type="secondary">-</Text>,
    },
    {
      title: 'Parça',
      dataIndex: 'partName',
      key: 'partName',
      width: 130,
      render: (part: string) => part || <Text type="secondary">-</Text>,
    },
    {
      title: 'Erişim',
      dataIndex: 'accessLevel',
      key: 'accessLevel',
      width: 110,
      render: (level: string, record: ErrorCodeListDto) => accessLevelTag(level, record.hasAccess),
    },
    {
      title: '',
      key: 'action',
      width: 70,
      render: (_: any, record: ErrorCodeListDto) => (
        <Tooltip title={!record.hasAccess ? 'Erişim yok' : 'Detay'}>
          <Button
            type="text"
            icon={record.hasAccess ? <EyeOutlined /> : <LockOutlined />}
            disabled={!record.hasAccess}
            onClick={() => navigate(`/error-codes/${record.id}`)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <WarningOutlined style={{ marginRight: 8, color: '#faad14' }} />
            Hata Kodları
          </Title>
          <Text type="secondary">Laser kesim sistemi hata kodları veritabanı</Text>
        </div>
        <Button icon={<ReloadOutlined />} onClick={() => loadErrorCodes()}>Yenile</Button>
      </div>

      {error && (
        <Alert message="Hata" description={error} type="error" showIcon closable
          onClose={() => setError(null)} style={{ marginBottom: 24 }} />
      )}

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input
            placeholder="Kod veya başlık ara..."
            prefix={<SearchOutlined />}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 300 }}
            allowClear
          />
          <Select
            placeholder="Erişim seviyesi"
            allowClear
            style={{ width: 160 }}
            value={accessFilter}
            onChange={val => { setAccessFilter(val); setPage(1); loadErrorCodes(1, search, val); }}
            options={[
              { value: 'Free', label: 'Ücretsiz' },
              { value: 'Premium', label: 'Premium' },
            ]}
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
            Ara
          </Button>
        </Space>
      </Card>

      <Card>
        <Table
          columns={columns}
          dataSource={errorCodes}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            showTotal: (t) => `Toplam ${t} hata kodu`,
            onChange: (p) => { setPage(p); loadErrorCodes(p); },
            showSizeChanger: false,
          }}
          rowClassName={(record) => !record.hasAccess ? 'ant-table-row-disabled' : ''}
          size="small"
          scroll={{ x: 700 }}
        />
      </Card>
    </div>
  );
}
