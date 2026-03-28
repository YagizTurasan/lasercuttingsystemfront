import { useState } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { authService } from '../services/auth.service';
import { ForgotPasswordRequest } from '../types/api';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

interface ForgotPasswordFormProps {
  onBack?: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [form] = Form.useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (values: ForgotPasswordRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await authService.forgotPassword(values);
      setEmail(values.email);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Şifre sıfırlama bağlantısı gönderilemedi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackHome = () => {
    navigate('/');
  };

  if (isSuccess) {
    return (
      <div className="forgot-password-form-container">
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={handleBackHome}
          className="back-button"
        >
          Ana Sayfaya Dön
        </Button>

        <div className="success-result">
          <div className="success-icon">
            <CheckCircleOutlined />
          </div>
          
          <Title level={2} style={{ color: '#ffffff', marginBottom: 16 }}>
            Email Gönderildi!
          </Title>
          
          <Text style={{ 
            color: 'rgba(255, 255, 255, 0.7)', 
            fontSize: '16px',
            display: 'block',
            marginBottom: 32,
            lineHeight: 1.6
          }}>
            Şifre sıfırlama bağlantısı <strong style={{ color: '#00d4ff' }}>{email}</strong> adresine gönderildi. 
            <br />
            Email kutunuzu kontrol edin.
          </Text>

          <div className="success-actions">
            <Button
              type="primary"
              size="large"
              onClick={onBack}
              className="success-button"
            >
              Giriş Sayfasına Dön
            </Button>
            
            <Button
              type="text"
              size="large"
              onClick={() => setIsSuccess(false)}
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '16px'
              }}
            >
              Farklı email ile tekrar dene
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="forgot-password-form-container">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={handleBackHome}
        className="back-button"
      >
        Ana Sayfaya Dön
      </Button>

      <div className="forgot-password-form-header">
        <div className="forgot-password-form-icon">
          <div className="form-logo-icon">🔐</div>
        </div>
        <Title level={2} style={{ color: '#ffffff', marginBottom: 8 }}>
          Şifremi Unuttum
        </Title>
        <Text style={{ 
          color: 'rgba(255, 255, 255, 0.7)', 
          fontSize: '16px',
          lineHeight: 1.6,
          textAlign: 'center',
          display: 'block'
        }}>
          Email adresinizi girin, size şifre sıfırlama bağlantısı gönderelim
        </Text>
      </div>

      {error && (
        <Alert
          message="Hata"
          description={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
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
        name="forgotPassword"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        className="forgot-password-form"
      >
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

        <Form.Item style={{ marginBottom: 24 }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            className="forgot-password-button"
          >
            {isLoading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
          </Button>
        </Form.Item>

        <div className="forgot-password-links">
          <Button 
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={onBack}
            className="back-to-login-button"
          >
            Giriş sayfasına dön
          </Button>
        </div>
      </Form>
    </div>
  );
}