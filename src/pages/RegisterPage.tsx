import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { RegisterForm } from '../components/RegisterForm';
import '../css/RegisterPage.css';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    message.success({
      content: 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.',
      style: {
        marginTop: '20vh',
      },
    });
    navigate('/login');
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    
      <div className="register-page">
        {/* Background */}
        <div className="register-background"></div>
        <div className="register-overlay"></div>
        
        {/* Header */}
        <div className="register-header">
          <div className="register-logo" onClick={handleBackHome}>
            <div className="logo-icon">⚡</div>
            <span>LaserCode Pro</span>
          </div>
        </div>

        {/* Register Container */}
        <div className="register-container">
          <div className="register-glass-card">
            <RegisterForm onSuccess={handleSuccess} />
          </div>
        </div>

        {/* Footer */}
        <div className="register-footer">
          <p>&copy; 2025 LaserCode Pro. Tüm hakları saklıdır.</p>
        </div>
      </div>
    
  );
}