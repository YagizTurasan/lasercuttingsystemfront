import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import '../css/ForgotPasswordPage.css';

export function ForgotPasswordPage() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/login');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
      <div className="forgot-password-page">
        {/* Background */}
        <div className="forgot-password-background"></div>
        <div className="forgot-password-overlay"></div>
        
        {/* Header */}
        <div className="forgot-password-header">
          <div className="forgot-password-logo" onClick={handleBackHome}>
            <div className="logo-icon">⚡</div>
            <span>LaserCode Pro</span>
          </div>
        </div>

        {/* Forgot Password Container */}
        <div className="forgot-password-container">
          <div className="forgot-password-glass-card">
            <ForgotPasswordForm onBack={handleBack} />
          </div>
        </div>

        {/* Footer */}
        <div className="forgot-password-footer">
          <p>&copy; 2025 LaserCode Pro. Tüm hakları saklıdır.</p>
        </div>
      </div>
  );
}