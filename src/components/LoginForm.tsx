import { Form, Input, Button, Checkbox, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';
import { LoginRequest } from '../types/api';

const { Title, Text } = Typography;

interface LoginFormProps {
  onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth();
  const [form] = Form.useForm();

  const handleSubmit = async (values: LoginRequest) => {
    try {
      clearError();
      await login(values);
      onSuccess?.();
    } catch (error) {
      
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '50px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <Title level={2}>Giriş Yap</Title>
        <Text type="secondary">Laser Cutting System</Text>
      </div>

      {error && (
        <Alert
          message="Giriş Hatası"
          description={error}
          type="error"
          showIcon
          closable
          onClose={clearError}
          style={{ marginBottom: 24 }}
        />
      )}

      <Form
        form={form}
        name="login"
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Email adresinizi giriniz!' },
            { type: 'email', message: 'Geçerli bir email adresi giriniz!' }
          ]}
        >
          <Input 
            prefix={<UserOutlined />} 
            placeholder="ornek@email.com"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Şifre"
          rules={[
            { required: true, message: 'Şifrenizi giriniz!' },
            { min: 6, message: 'Şifre en az 6 karakter olmalıdır!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Şifreniz"
          />
        </Form.Item>

        <Form.Item name="rememberMe" valuePropName="checked">
          <Checkbox>Beni hatırla</Checkbox>
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            block
          >
            Giriş Yap
          </Button>
        </Form.Item>

        <div style={{ textAlign: 'center' }}>
          <Text>
            Hesabınız yok mu?{' '}
            <a href="/register">Kayıt olun</a>
          </Text>
          <br />
          <a href="/forgot-password">Şifremi unuttum</a>
        </div>
      </Form>
    </div>
  );
}