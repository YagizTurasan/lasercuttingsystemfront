import { Form, Input, Button, Alert, Typography, Checkbox } from 'antd';
import { LockOutlined, MailOutlined, BankOutlined, UserOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { RegisterRequest } from '../types/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface RegisterFormProps {
  onSuccess?: () => void;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuth();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSubmit = async (values: RegisterRequest) => {
    try {
      clearError();
      await register(values);
      onSuccess?.();
    } catch (error) {
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="register-form-container">
      <Button
        type="text" 
        icon={<ArrowLeftOutlined />} 
        onClick={handleBackHome}
        className="back-button"
      >
        Ana Sayfaya Dön
      </Button>

      <div className="register-form-header">
        <div className="register-form-icon">
          <div className="form-logo-icon">⚡</div>
        </div>
        <Title level={2} style={{ color: '#ffffff', marginBottom: 8 }}>
          Hesap Oluştur
        </Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px' }}>
          LaserCode Pro'ya katılın ve laser kesim süreçlerinizi optimize edin
        </Text>
      </div>

      {error && (
        <Alert
          message="Kayıt Hatası"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ 
            marginBottom: 24,
            background: 'rgba(255, 77, 77, 0.1)',
            border: '1px solid rgba(255, 77, 77, 0.3)',
            borderRadius: '12px'
          }}
        />
      )}

      <Form
        form={form}
        name="register"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        className="register-form"
      >
        <div className="form-row">
          <Form.Item
            name="firstName"
            label={<span style={{ color: '#ffffff' }}>Ad</span>}
            rules={[
              { required: true, message: 'Adınızı giriniz!' },
              { min: 2, message: 'Ad en az 2 karakter olmalıdır!' }
            ]}
            className="form-item-half"
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#00d4ff' }} />}
              placeholder="Adınız" 
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={<span style={{ color: '#ffffff' }}>Soyad</span>}
            rules={[
              { required: true, message: 'Soyadınızı giriniz!' },
              { min: 2, message: 'Soyad en az 2 karakter olmalıdır!' }
            ]}
            className="form-item-half"
          >
            <Input 
              prefix={<UserOutlined style={{ color: '#00d4ff' }} />}
              placeholder="Soyadınız" 
              className="custom-input"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="email"
          label={<span style={{ color: '#ffffff' }}>Email Adresi</span>}
          rules={[
            { required: true, message: 'Email adresinizi giriniz!' },
            { type: 'email', message: 'Geçerli bir email adresi giriniz!' }
          ]}
        >
          <Input 
            prefix={<MailOutlined style={{ color: '#00d4ff' }} />} 
            placeholder="ornek@email.com"
            className="custom-input"
          />
        </Form.Item>

        <Form.Item
          name="companyName"
          label={<span style={{ color: '#ffffff' }}>Şirket Adı <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>(Opsiyonel)</span></span>}
        >
          <Input 
            prefix={<BankOutlined style={{ color: '#00d4ff' }} />} 
            placeholder="Şirket adınız"
            className="custom-input"
          />
        </Form.Item>

        <div className="form-row">
          <Form.Item
            name="password"
            label={<span style={{ color: '#ffffff' }}>Şifre</span>}
            rules={[
              { required: true, message: 'Şifrenizi giriniz!' },
              { min: 8, message: 'Şifre en az 8 karakter olmalıdır!' }
            ]}
            className="form-item-half"
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#00d4ff' }} />}
              placeholder="Şifreniz"
              className="custom-input"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label={<span style={{ color: '#ffffff' }}>Şifre Tekrarı</span>}
            dependencies={['password']}
            rules={[
              { required: true, message: 'Şifrenizi tekrar giriniz!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Şifreler eşleşmiyor!'));
                },
              }),
            ]}
            className="form-item-half"
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#00d4ff' }} />}
              placeholder="Şifre tekrarı"
              className="custom-input"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="acceptTerms"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('Kullanım şartlarını kabul etmelisiniz!')),
            },
          ]}
        >
          <Checkbox style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            <a 
              href="/terms" 
              style={{ 
                color: '#00d4ff', 
                textDecoration: 'none' 
              }}
            >
              Kullanım şartlarını
            </a> ve <a 
              href="/privacy" 
              style={{ 
                color: '#00d4ff', 
                textDecoration: 'none' 
              }}
            >
              gizlilik politikasını
            </a> kabul ediyorum
          </Checkbox>
        </Form.Item>

        <Form.Item style={{ marginBottom: 16 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            className="register-button"
          >
            {isLoading ? 'Hesap oluşturuluyor...' : 'Hesap Oluştur'}
          </Button>
        </Form.Item>

        <div className="register-links">
          <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            Zaten hesabınız var mı?{' '}
            <a 
              href="/login" 
              style={{ 
                color: '#00d4ff', 
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              Giriş yapın
            </a>
          </Text>
        </div>
      </Form>
    </div>
  );
}