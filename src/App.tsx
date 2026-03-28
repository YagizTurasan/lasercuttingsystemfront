import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import 'antd/dist/reset.css';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { MachinesPage } from './pages/machines/MachinesPage';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ErrorCodesPage } from './pages/error-codes/ErrorCodesPage';
import { ErrorCodeDetailPage } from './pages/error-codes/ErrorCodeDetailPage';
import { SubscriptionPlansPage } from './pages/subscription/SubscriptionPlansPage';
import { CurrentSubscriptionPage } from './pages/subscription/CurrentSubscriptionPage';
import { PaymentHistoryPage } from './pages/subscription/PaymentHistoryPage';
import { ProfilePage } from './pages/ProfilePage';
import HomePage from './pages/HomePage';

import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminUsersPage } from './pages/admin/AdminUserPage';
import { AdminMachinesPage } from './pages/admin/AdminMachinePage';
import { AdminErrorCodesPage } from './pages/admin/AdminErrorCodesPage';

const authTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#00d4ff',
    colorBgBase: '#0a0e1a',
    colorTextBase: '#ffffff',
    borderRadius: 12,
    colorBorder: 'rgba(0, 212, 255, 0.2)',
    colorBgContainer: 'rgba(255, 255, 255, 0.05)',
  },
  components: {
    Input: {
      colorBgContainer: 'rgba(255, 255, 255, 0.05)',
      colorBorder: 'rgba(255, 255, 255, 0.2)',
      colorText: '#ffffff',
      colorTextPlaceholder: 'rgba(255, 255, 255, 0.5)',
    },
    Button: {
      colorPrimary: '#00d4ff',
      colorPrimaryHover: '#00bfee',
      colorPrimaryActive: '#0099cc',
      colorLink: '#00d4ff',
      colorLinkHover: '#00bfee',
    },
    Form: {
      labelColor: '#ffffff',
    },
    Alert: {
      colorErrorBg: 'rgba(255, 77, 77, 0.1)',
      colorErrorBorder: 'rgba(255, 77, 77, 0.3)',
      colorErrorText: 'rgba(255, 255, 255, 0.8)',
    },
    Result: {
      colorTextHeading: '#ffffff',
      colorTextDescription: 'rgba(255, 255, 255, 0.7)',
    },
    Message: {
      contentBg: 'rgba(0, 212, 255, 0.1)',
      colorText: '#ffffff',
    },
    Checkbox: {
      colorPrimary: '#00d4ff',
      colorPrimaryHover: '#00bfee',
    },
  }
};

const appTheme = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#1890ff',
    colorTextBase: '#262626',
    colorText: '#262626',
    colorTextSecondary: '#595959',
    colorTextTertiary: '#8c8c8c',
    borderRadius: 8,
  },
  components: {
    Typography: {
      colorText: '#262626',
      colorTextSecondary: '#595959',
      colorTextDescription: '#8c8c8c',
    },
    Card: {
      colorText: '#262626',
      colorTextDescription: '#595959',
    },
  }
};

const AuthWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={trTR} theme={authTheme}>
    {children}
  </ConfigProvider>
);

const AppThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ConfigProvider locale={trTR} theme={appTheme}>
    {children}
  </ConfigProvider>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <AuthWrapper>
            <HomePage />
          </AuthWrapper>
        } />
        <Route path="/login" element={
          <AuthWrapper>
            <LoginPage />
          </AuthWrapper>
        } />
        <Route path="/register" element={
          <AuthWrapper>
            <RegisterPage />
          </AuthWrapper>
        } />
        <Route path="/forgot-password" element={
          <AuthWrapper>
            <ForgotPasswordPage />
          </AuthWrapper>
        } />
        
        <Route
          path="/dashboard" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/machines" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <MachinesPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/error-codes" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <ErrorCodesPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/error-codes/:id" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <ErrorCodeDetailPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />

        <Route
          path="/subscription"
          element={
            <AppThemeWrapper>
              <AppLayout>
                <SubscriptionPlansPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/subscription/current" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <CurrentSubscriptionPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/subscription/payments" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <PaymentHistoryPage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <AppThemeWrapper>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </AppThemeWrapper>
          } 
        />

        <Route
          path="/admin/dashboard"
          element={
            <AppThemeWrapper>
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <AppThemeWrapper>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/admin/machines" 
          element={
            <AppThemeWrapper>
              <AdminLayout>
                <AdminMachinesPage />
              </AdminLayout>
            </AppThemeWrapper>
          } 
        />
        <Route 
          path="/admin/error-codes" 
          element={
            <AppThemeWrapper>
              <AdminLayout>
                <AdminErrorCodesPage />
              </AdminLayout>
            </AppThemeWrapper>
          } 
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;