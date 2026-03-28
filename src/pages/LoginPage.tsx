import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import '../css/LoginPage.css';

export function LoginPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate('/dashboard');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
      <div className="login-page">
        {/* Background Video - Optional */}
        <div className="login-background"></div>
        <div className="login-overlay"></div>
        
        {/* Header */}
        <div className="login-header">
          <div className="login-logo" onClick={handleBackHome}>
            <div className="logo-icon">⚡</div>
            <span>LaserCode Pro</span>
          </div>
        </div>

        {/* Login Container */}
        <div className="login-container">
          <div className="login-glass-card">
            <LoginForm onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <p>&copy; 2025 LaserCode Pro. Tüm hakları saklıdır.</p>
        </div>
      </div>
  );
}