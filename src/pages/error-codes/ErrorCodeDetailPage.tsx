import { useEffect, useState } from 'react';
import {
  Typography, Card, Spin, Alert, Button, Tag, Descriptions, Divider
} from 'antd';
import {
  ArrowLeftOutlined, WarningOutlined, LockOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { httpClient } from '../../lib/http-client';
import { API_CONFIG } from '../../lib/config';
import { ErrorCodeDto } from '../../types/api';

const { Title, Text, Paragraph } = Typography;

export function ErrorCodeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [errorCode, setErrorCode] = useState<ErrorCodeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await httpClient.get<ErrorCodeDto>(API_CONFIG.ENDPOINTS.ERROR_CODES.BY_ID(id!));
        setErrorCode(data);
      } catch (err: any) {
        setError(err.message || 'Hata kodu yüklenemedi');
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Yükleniyor..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: 24 }}>
        <Alert message="Hata" description={error} type="error" showIcon
          action={<Button onClick={() => navigate('/error-codes')}>Geri Dön</Button>} />
      </div>
    );
  }

  if (!errorCode) return null;

  const accessTag = () => {
    if (!errorCode.hasAccess) return <Tag icon={<LockOutlined />} color="default">Erişim Yok</Tag>;
    if (errorCode.accessLevel === 'Free') return <Tag color="green">Ücretsiz</Tag>;
    return <Tag color="gold">Premium</Tag>;
  };

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/error-codes')}
        style={{ marginBottom: 16 }}
      >
        Hata Kodlarına Dön
      </Button>

      <Card>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 24 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 12,
            background: '#fff7e6', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <WarningOutlined style={{ fontSize: 28, color: '#faad14' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <Title level={3} style={{ margin: 0 }}>{errorCode.title}</Title>
              {accessTag()}
            </div>
            <Text type="secondary" style={{ fontFamily: 'monospace', fontSize: 14 }}>
              Kod: {errorCode.code}
            </Text>
            {errorCode.fullHierarchyPath && (
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>{errorCode.fullHierarchyPath}</Text>
              </div>
            )}
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small" style={{ marginBottom: 24 }}>
          {errorCode.machineBrand && (
            <Descriptions.Item label="Makine">
              <Tag color="blue">{errorCode.machineBrand}</Tag>
            </Descriptions.Item>
          )}
          {errorCode.partName && (
            <Descriptions.Item label="Parça">{errorCode.partName}</Descriptions.Item>
          )}
          {errorCode.errorSource && (
            <Descriptions.Item label="Kaynak">{errorCode.errorSource.sourceName}</Descriptions.Item>
          )}
          <Descriptions.Item label="Erişim Seviyesi">{errorCode.accessLevel}</Descriptions.Item>
        </Descriptions>

        {errorCode.hasAccess ? (
          <>
            {errorCode.description && (
              <>
                <Divider orientation="left">Açıklama</Divider>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{errorCode.description}</Paragraph>
              </>
            )}
            {errorCode.solutions && (
              <>
                <Divider orientation="left">Çözüm Önerileri</Divider>
                <Paragraph style={{ whiteSpace: 'pre-wrap' }}>{errorCode.solutions}</Paragraph>
              </>
            )}
          </>
        ) : (
          <Alert
            icon={<LockOutlined />}
            message="Bu içeriğe erişim için premium abonelik gereklidir"
            description="Detaylı açıklama ve çözüm önerilerini görmek için aboneliğinizi yükseltin."
            type="warning"
            showIcon
            action={
              <Button type="primary" onClick={() => navigate('/subscription')}>
                Plan Yükselt
              </Button>
            }
          />
        )}
      </Card>
    </div>
  );
}
