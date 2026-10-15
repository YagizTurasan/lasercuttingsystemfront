import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Spin, theme } from 'antd';
import trTR from 'antd/locale/tr_TR';
import 'antd/dist/reset.css';

import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/layout/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Sayfalar ayrı chunk'lara bölünür; her sayfa yalnızca ziyaret edildiğinde yüklenir
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(m => ({ default: m.VerifyEmailPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const MachinesPage = lazy(() => import('./pages/machines/MachinesPage').then(m => ({ default: m.MachinesPage })));
const ErrorCodesPage = lazy(() => import('./pages/error-codes/ErrorCodesPage').then(m => ({ default: m.ErrorCodesPage })));
const ErrorCodeDetailPage = lazy(() => import('./pages/error-codes/ErrorCodeDetailPage').then(m => ({ default: m.ErrorCodeDetailPage })));
const SubscriptionPlansPage = lazy(() => import('./pages/subscription/SubscriptionPlansPage').then(m => ({ default: m.SubscriptionPlansPage })));
const CurrentSubscriptionPage = lazy(() => import('./pages/subscription/CurrentSubscriptionPage').then(m => ({ default: m.CurrentSubscriptionPage })));
const PaymentHistoryPage = lazy(() => import('./pages/subscription/PaymentHistoryPage').then(m => ({ default: m.PaymentHistoryPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));

const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/admin/AdminUserPage').then(m => ({ default: m.AdminUsersPage })));
const AdminMachinesPage = lazy(() => import('./pages/admin/AdminMachinePage').then(m => ({ default: m.AdminMachinesPage })));
const AdminErrorCodesPage = lazy(() => import('./pages/admin/AdminErrorCodesPage').then(m => ({ default: m.AdminErrorCodesPage })));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <Spin size="large" />
  </div>
);

// Layout içindeki sayfa yüklenirken yan menü ve üst bar yerinde kalır
const ContentLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
    <Spin size="large" />
  </div>
);

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

const UserRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <AppThemeWrapper>
      <AppLayout><Suspense fallback={<ContentLoader />}>{children}</Suspense></AppLayout>
    </AppThemeWrapper>
  </ProtectedRoute>
);

const AdminRoute = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute requireAdmin>
    <AppThemeWrapper>
      <AdminLayout><Suspense fallback={<ContentLoader />}>{children}</Suspense></AdminLayout>
    </AppThemeWrapper>
  </ProtectedRoute>
);

function App() {
  const initialize = useAuth(state => state.initialize);

  // Sayfa yenilendiğinde oturumu refresh token cookie'si ile geri yükle
  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
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
          {/* E-postadaki bağlantıların açtığı sayfalar */}
          <Route path="/reset-password" element={
            <AuthWrapper>
              <ResetPasswordPage />
            </AuthWrapper>
          } />
          <Route path="/verify-email" element={
            <AuthWrapper>
              <VerifyEmailPage />
            </AuthWrapper>
          } />
          
          <Route path="/dashboard" element={<UserRoute><DashboardPage /></UserRoute>} />
          <Route path="/machines" element={<UserRoute><MachinesPage /></UserRoute>} />
          <Route path="/error-codes" element={<UserRoute><ErrorCodesPage /></UserRoute>} />
          <Route path="/error-codes/:id" element={<UserRoute><ErrorCodeDetailPage /></UserRoute>} />
          <Route path="/subscription" element={<UserRoute><SubscriptionPlansPage /></UserRoute>} />
          <Route path="/subscription/current" element={<UserRoute><CurrentSubscriptionPage /></UserRoute>} />
          <Route path="/subscription/payments" element={<UserRoute><PaymentHistoryPage /></UserRoute>} />
          <Route path="/profile" element={<UserRoute><ProfilePage /></UserRoute>} />
  
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
          <Route path="/admin/machines" element={<AdminRoute><AdminMachinesPage /></AdminRoute>} />
          <Route path="/admin/error-codes" element={<AdminRoute><AdminErrorCodesPage /></AdminRoute>} />
  
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;