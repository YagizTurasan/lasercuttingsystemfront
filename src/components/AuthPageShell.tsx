import { useNavigate } from 'react-router-dom';
import '../css/ForgotPasswordPage.css';

/** Şifre sıfırlama ve e-posta doğrulama sayfalarının ortak çerçevesi (ForgotPasswordPage ile aynı görünüm) */
export function AuthPageShell({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-background"></div>
      <div className="forgot-password-overlay"></div>

      <div className="forgot-password-header">
        <div className="forgot-password-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">⚡</div>
          <span>LaserCode Pro</span>
        </div>
      </div>

      <div className="forgot-password-container">
        <div className="forgot-password-glass-card">
          <div className="forgot-password-form-container">{children}</div>
        </div>
      </div>

      <div className="forgot-password-footer">
        <p>&copy; 2025 LaserCode Pro. Tüm hakları saklıdır.</p>
      </div>
    </div>
  );
}
