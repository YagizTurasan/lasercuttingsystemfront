import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Form, Input, Button, Alert, Typography, Result } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { AuthPageShell } from '../components/AuthPageShell';
import { authService } from '../services/auth.service';
import { getErrorMessage } from '../lib/http-client';

const { Title, Text } = Typography;

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

/** E-postadaki "Şifremi Sıfırla" bağlantısının açtığı sayfa: /reset-password?email=...&token=... */
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    try {
      setLoading(true);
      setError(null);
      await authService.resetPassword({ email, token, ...values });
      setDone(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Şifre sıfırlanamadı'));
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) {
    return (
      <AuthPageShell>
        <Result
          status="warning"
          title="Geçersiz bağlantı"
          subTitle="Şifre sıfırlama bağlantısı eksik veya bozuk. Lütfen yeni bir bağlantı isteyin."
          extra={<Button type="primary" onClick={() => navigate('/forgot-password')}>Yeni bağlantı iste</Button>}
        />
      </AuthPageShell>
    );
  }

  if (done) {
    return (
      <AuthPageShell>
        <Result
          status="success"
          title="Şifreniz sıfırlandı"
          subTitle="Yeni şifrenizle giriş yapabilirsiniz. Güvenlik için diğer tüm oturumlarınız kapatıldı."
          extra={<Button type="primary" onClick={() => navigate('/login')}>Giriş Yap</Button>}
        />
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <div className="forgot-password-form-header">
        <Title level={2} style={{ color: '#ffffff', marginBottom: 8 }}>Yeni Şifre Belirle</Title>
        <Text style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{email}</Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ margin: '24px 0' }}
          action={<Button size="small" onClick={() => navigate('/forgot-password')}>Yeni bağlantı</Button>}
        />
      )}

      <Form layout="vertical" size="large" onFinish={handleSubmit} style={{ marginTop: 24 }}>
        <Form.Item
          name="newPassword"
          label="Yeni şifre"
          rules={[
            { required: true, message: 'Yeni şifrenizi girin' },
            { min: 8, message: 'Şifre en az 8 karakter olmalı' },
            { pattern: /\d/, message: 'Şifre en az bir rakam içermeli' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" className="custom-input" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="Yeni şifre (tekrar)"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Şifrenizi tekrar girin' },
            ({ getFieldValue }) => ({
              validator: (_, value) =>
                !value || getFieldValue('newPassword') === value
                  ? Promise.resolve()
                  : Promise.reject(new Error('Şifreler eşleşmiyor')),
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} autoComplete="new-password" className="custom-input" />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={loading} className="forgot-password-button">
          Şifreyi Sıfırla
        </Button>
      </Form>
    </AuthPageShell>
  );
}
