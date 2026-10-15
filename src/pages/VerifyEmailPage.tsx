import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Result, Spin } from 'antd';
import { AuthPageShell } from '../components/AuthPageShell';
import { authService } from '../services/auth.service';
import { getErrorMessage } from '../lib/http-client';

type Status = 'verifying' | 'success' | 'error';

/** E-postadaki doğrulama bağlantısının açtığı sayfa: /verify-email?email=...&token=... */
export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get('email') ?? '';
  const token = searchParams.get('token') ?? '';

  const missingParams = !email || !token;
  const [status, setStatus] = useState<Status>(missingParams ? 'error' : 'verifying');
  const [message, setMessage] = useState(missingParams ? 'Doğrulama bağlantısı eksik veya bozuk.' : '');
  const [resending, setResending] = useState(false);
  // StrictMode efekti iki kez çalıştırır; token tek kullanımlık olduğu için istek bir kez gönderilmeli
  const requested = useRef(false);

  useEffect(() => {
    if (missingParams || requested.current) return;
    requested.current = true;

    authService.verifyEmail({ email, token })
      .then(() => setStatus('success'))
      .catch(err => {
        setStatus('error');
        setMessage(getErrorMessage(err, 'E-posta doğrulanamadı'));
      });
  }, [email, token, missingParams]);

  const handleResend = async () => {
    try {
      setResending(true);
      await authService.sendEmailVerification(email);
      setMessage('Yeni doğrulama bağlantısı e-posta adresinize gönderildi.');
    } catch (err) {
      setMessage(getErrorMessage(err, 'Doğrulama e-postası gönderilemedi'));
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthPageShell>
      {status === 'verifying' && (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin size="large" />
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', marginTop: 16 }}>E-posta adresiniz doğrulanıyor...</p>
        </div>
      )}

      {status === 'success' && (
        <Result
          status="success"
          title="E-posta adresiniz doğrulandı"
          subTitle={email}
          extra={<Button type="primary" onClick={() => navigate('/login')}>Giriş Yap</Button>}
        />
      )}

      {status === 'error' && (
        <Result
          status="error"
          title="Doğrulama başarısız"
          subTitle={message}
          extra={[
            email && (
              <Button key="resend" onClick={handleResend} loading={resending}>
                Yeni bağlantı gönder
              </Button>
            ),
            <Button key="login" type="primary" onClick={() => navigate('/login')}>Giriş sayfası</Button>,
          ]}
        />
      )}
    </AuthPageShell>
  );
}
