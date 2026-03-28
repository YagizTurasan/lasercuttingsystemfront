// src/pages/ProfilePage.tsx
import { useEffect, useState } from 'react';
import { 
  Typography, 
  Card, 
  Row, 
  Col, 
  Button, 
  Space, 
  Avatar, 
  Spin, 
  Alert,
  Descriptions,
  Form,
  Input,
  Modal,
  message,
  Divider,
  Tag,
  Statistic,
  Collapse
} from 'antd';
import { 
  UserOutlined,
  EditOutlined,
  MailOutlined,
  BankOutlined,
  CalendarOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { httpClient } from '../lib/http-client';
import { API_CONFIG } from '../lib/config';
import { UserDto, UpdateProfileRequest, ChangePasswordRequest } from '../types/api';
import { useAuth } from '../hooks/useAuth';

const { Title, Text } = Typography;
const { Panel } = Collapse;

export function ProfilePage() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  
  // Forms
  const [editForm] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userData = await httpClient.get<UserDto>(
        API_CONFIG.ENDPOINTS.USERS.GETPROFILE
      );
      
      setUser(userData);
      
      editForm.setFieldsValue({
        firstName: userData.firstName,
        lastName: userData.lastName,
        companyName: userData.companyName
      });
      
    } catch (err: any) {
      setError(err.message || 'Profil bilgileri yüklenemedi');
      console.error('Load profile error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

  const handleUpdateProfile = async (values: UpdateProfileRequest) => {
    try {
      setUpdating(true);
      
      await httpClient.put(
        API_CONFIG.ENDPOINTS.USERS.UPDATEPROFILE,
        values
      );
      
      message.success('Profil başarıyla güncellendi');
      setEditModalVisible(false);
      editForm.resetFields();
      
      await Promise.all([
        loadUserProfile(),
        refreshUser()
      ]);
      
    } catch (err: any) {
      message.error(err.message || 'Profil güncellenemedi');
      console.error('Update profile error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const handleChangePassword = async (values: ChangePasswordRequest) => {
    try {
      setUpdating(true);
      
      await httpClient.post(
        API_CONFIG.ENDPOINTS.AUTH.CHANGEPASSWORD,
        values
      );
      
      message.success('Şifre başarıyla değiştirildi');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
      
    } catch (err: any) {
      message.error(err.message || 'Şifre değiştirilemedi');
      console.error('Change password error:', err);
    } finally {
      setUpdating(false);
    }
  };

  const getSubscriptionStatus = () => {
    if (!user?.activeSubscription) {
      return { text: 'Ücretsiz Plan', color: 'default', icon: null };
    }
    
    const plan = user.activeSubscription.plan;
    switch (plan?.level) {
      case 1:
        return { text: 'Basic', color: 'blue', icon: <UserOutlined /> };
      case 2:
        return { text: 'Professional', color: 'gold', icon: <CrownOutlined /> };
      case 3:
        return { text: 'Enterprise', color: 'purple', icon: <CrownOutlined /> };
      default:
        return { text: 'Ücretsiz', color: 'default', icon: null };
    }
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spin size="large" tip="Profil yükleniyor..." />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: isMobile ? '12px' : '24px' }}>
        <Alert
          message="Profil Bulunamadı"
          description="Kullanıcı profil bilgileri yüklenemedi."
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? '12px' : '24px' }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '16px' : '24px' }}>
        <Title level={isMobile ? 3 : 2}>Profil</Title>
        <Text type="secondary">Kişisel bilgilerinizi görüntüleyin ve düzenleyin</Text>
      </div>

      {error && (
        <Alert
          message="Hata"
          description={error}
          type="error"
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: isMobile ? '16px' : '24px' }}
        />
      )}

      {/* Mobile Layout */}
      {isMobile ? (
        <div>
          {/* Profil Kartı - Mobile */}
          <Card style={{ marginBottom: '12px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={64} 
                icon={<UserOutlined />}
                style={{ backgroundColor: '#1890ff', marginBottom: '12px' }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {user.fullName}
              </Title>
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {user.email}
              </Text>
              <div style={{ marginTop: '8px' }}>
                <Space wrap size="small">
                  <Tag 
                    color={subscriptionStatus.color}
                    icon={subscriptionStatus.icon}
                  >
                    {subscriptionStatus.text}
                  </Tag>
                  <Tag color={user.isActive ? 'green' : 'red'}>
                    {user.isActive ? 'Aktif' : 'Pasif'}
                  </Tag>
                  {user.emailConfirmed ? (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Email Doğrulandı
                    </Tag>
                  ) : (
                    <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                      Email Doğrulanmadı
                    </Tag>
                  )}
                </Space>
              </div>
              <Button 
                type="primary" 
                icon={<EditOutlined />}
                onClick={() => setEditModalVisible(true)}
                style={{ marginTop: '12px' }}
                size="small"
              >
                Düzenle
              </Button>
            </div>
          </Card>

          {/* Detaylı Bilgiler - Mobile Accordion */}
          <Card style={{ marginBottom: '12px' }}>
            <Collapse ghost>
              <Panel header="Kişisel Bilgiler" key="1">
                <div style={{ fontSize: '14px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Ad: </Text>
                    <Text>{user.firstName}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Soyad: </Text>
                    <Text>{user.lastName}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Email: </Text>
                    <Text>{user.email}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Şirket: </Text>
                    <Text>{user.companyName || 'Belirtilmemiş'}</Text>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <Text strong>Kayıt Tarihi: </Text>
                    <Text>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</Text>
                  </div>
                </div>
              </Panel>
            </Collapse>
          </Card>

          {/* Güvenlik - Mobile */}
          <Card style={{ marginBottom: '12px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center'
            }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>Şifre</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Şifrenizi değiştirin
                </Text>
              </div>
              <Button 
                icon={<LockOutlined />}
                onClick={() => setPasswordModalVisible(true)}
                size="small"
              >
                Değiştir
              </Button>
            </div>
          </Card>

          {/* Stats - Mobile */}
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Seçili Makine"
                  value={user.selectedMachineIds?.length || 0}
                  valueStyle={{ fontSize: '18px', color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card size="small">
                <Statistic
                  title="Abonelik Seviyesi"
                  value={user.subscriptionLevel}
                  valueStyle={{ fontSize: '18px', color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Quick Actions - Mobile */}
          <Card style={{ marginTop: '12px' }}>
            <Text strong style={{ fontSize: '14px', marginBottom: '12px', display: 'block' }}>
              Hızlı Aksiyonlar
            </Text>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                size="small"
                onClick={() => navigate('/machines')}
              >
                Makine Yönetimi
              </Button>
              <Button 
                block
                size="small"
                onClick={() => navigate('/subscription')}
              >
                Abonelik Planları
              </Button>
            </Space>
          </Card>
        </div>
      ) : (
        /* Desktop Layout - Original */
        <Row gutter={[24, 24]}>
          {/* Sol Panel - Profil Bilgileri */}
          <Col xs={24} lg={16}>
            {/* Profil Kartı */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <Avatar 
                  size={80} 
                  icon={<UserOutlined />}
                  style={{ backgroundColor: '#1890ff', marginRight: '24px' }}
                />
                <div style={{ flex: 1 }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {user.fullName}
                  </Title>
                  <Text type="secondary" style={{ fontSize: '16px' }}>
                    {user.email}
                  </Text>
                  <div style={{ marginTop: '8px' }}>
                    <Space>
                      <Tag 
                        color={subscriptionStatus.color}
                        icon={subscriptionStatus.icon}
                      >
                        {subscriptionStatus.text}
                      </Tag>
                      <Tag color={user.isActive ? 'green' : 'red'}>
                        {user.isActive ? 'Aktif' : 'Pasif'}
                      </Tag>
                      {user.emailConfirmed ? (
                        <Tag color="green" icon={<CheckCircleOutlined />}>
                          Email Doğrulandı
                        </Tag>
                      ) : (
                        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
                          Email Doğrulanmadı
                        </Tag>
                      )}
                    </Space>
                  </div>
                </div>
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setEditModalVisible(true)}
                >
                  Düzenle
                </Button>
              </div>

              <Divider />

              {/* Detaylı Bilgiler */}
              <Descriptions title="Kişisel Bilgiler" column={1} size="middle">
                <Descriptions.Item label="Ad" labelStyle={{ fontWeight: 'bold' }}>
                  {user.firstName}
                </Descriptions.Item>
                <Descriptions.Item label="Soyad" labelStyle={{ fontWeight: 'bold' }}>
                  {user.lastName}
                </Descriptions.Item>
                <Descriptions.Item label="Email" labelStyle={{ fontWeight: 'bold' }}>
                  <Space>
                    <MailOutlined />
                    {user.email}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Şirket" labelStyle={{ fontWeight: 'bold' }}>
                  <Space>
                    <BankOutlined />
                    {user.companyName || 'Belirtilmemiş'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Kayıt Tarihi" labelStyle={{ fontWeight: 'bold' }}>
                  <Space>
                    <CalendarOutlined />
                    {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Roller" labelStyle={{ fontWeight: 'bold' }}>
                  <Space wrap>
                    {user.roles.length > 0 ? (
                      user.roles.map(role => (
                        <Tag key={role} color="blue">{role}</Tag>
                      ))
                    ) : (
                      <Tag>Kullanıcı</Tag>
                    )}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Güvenlik */}
            <Card title="Güvenlik" style={{ marginTop: '24px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '16px',
                  border: '1px solid #f0f0f0',
                  borderRadius: '6px'
                }}>
                  <div>
                    <Text strong>Şifre</Text>
                    <br />
                    <Text type="secondary">Son güncelleme: Bilinmiyor</Text>
                  </div>
                  <Button 
                    icon={<LockOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    Şifre Değiştir
                  </Button>
                </div>
              </Space>
            </Card>
          </Col>

          {/* Sağ Panel - İstatistikler */}
          <Col xs={24} lg={8}>
            {/* Abonelik Bilgileri */}
            <Card title="Abonelik Durumu" size="small">
              {user.activeSubscription ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Statistic
                    title="Mevcut Plan"
                    value={user.activeSubscription.plan?.displayName}
                    valueStyle={{ fontSize: '16px' }}
                  />
                  <Statistic
                    title="Kalan Süre"
                    value={user.activeSubscription.daysRemaining}
                    suffix="gün"
                    valueStyle={{ 
                      color: user.activeSubscription.daysRemaining < 7 ? '#faad14' : '#52c41a' 
                    }}
                  />
                  <Button 
                    type="primary" 
                    size="small" 
                    block
                    onClick={() => navigate('/subscription/current')}
                  >
                    Abonelik Yönetimi
                  </Button>
                </Space>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <Text type="secondary">Aktif abonelik yok</Text>
                  <br />
                  <Button 
                    type="primary" 
                    size="small" 
                    style={{ marginTop: '8px' }}
                    onClick={() => navigate('/subscription')}
                  >
                    Plan Seç
                  </Button>
                </div>
              )}
            </Card>

            {/* Hesap İstatistikleri */}
            <Card title="Hesap İstatistikleri" size="small" style={{ marginTop: '16px' }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Statistic
                    title="Seçili Makine"
                    value={user.selectedMachineIds?.length || 0}
                    valueStyle={{ fontSize: '20px', color: '#1890ff' }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Abonelik Seviyesi"
                    value={user.subscriptionLevel}
                    valueStyle={{ fontSize: '20px', color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>

            {/* Hızlı Aksiyonlar */}
            <Card title="Hızlı Aksiyonlar" size="small" style={{ marginTop: '16px' }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  block
                  onClick={() => navigate('/machines')}
                >
                  Makine Yönetimi
                </Button>
                <Button 
                  block
                  onClick={() => navigate('/subscription')}
                >
                  Abonelik Planları
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      )}

      {/* Profil Düzenleme Modal */}
      <Modal
        title="Profil Düzenle"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          editForm.resetFields();
        }}
        footer={null}
        width={isMobile ? '90%' : 500}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateProfile}
        >
          <Form.Item
            name="firstName"
            label="Ad"
            rules={[
              { required: true, message: 'Ad gereklidir' },
              { min: 2, message: 'Ad en az 2 karakter olmalıdır' }
            ]}
          >
            <Input placeholder="Adınız" />
          </Form.Item>

          <Form.Item
            name="lastName"
            label="Soyad"
            rules={[
              { required: true, message: 'Soyad gereklidir' },
              { min: 2, message: 'Soyad en az 2 karakter olmalıdır' }
            ]}
          >
            <Input placeholder="Soyadınız" />
          </Form.Item>

          <Form.Item
            name="companyName"
            label="Şirket Adı (Opsiyonel)"
          >
            <Input placeholder="Şirket adınız" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setEditModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updating}
              >
                Kaydet
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Şifre Değiştirme Modal */}
      <Modal
        title="Şifre Değiştir"
        open={passwordModalVisible}
        onCancel={() => {
          setPasswordModalVisible(false);
          passwordForm.resetFields();
        }}
        footer={null}
        width={isMobile ? '90%' : 500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="currentPassword"
            label="Mevcut Şifre"
            rules={[
              { required: true, message: 'Mevcut şifre gereklidir' }
            ]}
          >
            <Input.Password placeholder="Mevcut şifreniz" />
          </Form.Item>

          <Form.Item
            name="newPassword"
            label="Yeni Şifre"
            rules={[
              { required: true, message: 'Yeni şifre gereklidir' },
              { min: 8, message: 'Şifre en az 8 karakter olmalıdır' }
            ]}
          >
            <Input.Password placeholder="Yeni şifreniz" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Şifre Tekrarı"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Şifre tekrarı gereklidir' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Yeni şifrenizi tekrar girin" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setPasswordModalVisible(false)}>
                İptal
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={updating}
              >
                Şifre Değiştir
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}