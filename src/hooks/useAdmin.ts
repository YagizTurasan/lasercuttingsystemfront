import { useState, useCallback } from 'react';
import { message } from 'antd';
import { 
  adminService, 
  AdminDashboardSummaryDto,
  SubscriptionStatsDto,
  RevenueStatsDto,
  RecentActivityDto,
  AdminUserListDto,
  AdminUserDetailDto,
  AdminMachineListDto,
  AdminErrorCodeListDto,
  AdminCreateUserRequest,
  AdminUpdateUserRequest,
  AdminUserSubscriptionRequest,
  AdminMachineCreateRequest,
  AdminMachineUpdateRequest,
  AdminErrorCodeCreateRequest,
  AdminErrorCodeUpdateRequest
} from '../services/admin.service';
import { PagedResult, SearchRequest } from '../types/api';

interface UseAdminDashboardReturn {
  dashboardSummary: AdminDashboardSummaryDto | null;
  subscriptionStats: SubscriptionStatsDto | null;
  revenueStats: RevenueStatsDto | null;
  recentActivities: PagedResult<RecentActivityDto> | null;
  loading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  refreshStats: () => Promise<void>;
  refreshRevenue: (fromDate?: string, toDate?: string) => Promise<void>;
  refreshActivities: (request: SearchRequest) => Promise<void>;
}

interface UseAdminUsersReturn {
  users: PagedResult<AdminUserListDto> | null;
  selectedUser: AdminUserDetailDto | null;
  availableRoles: string[];
  loading: boolean;
  error: string | null;
  searchUsers: (request: SearchRequest) => Promise<void>;
  getUserById: (userId: string) => Promise<void>;
  createUser: (request: AdminCreateUserRequest) => Promise<boolean>;
  updateUser: (userId: string, request: AdminUpdateUserRequest) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  activateUser: (userId: string) => Promise<boolean>;
  deactivateUser: (userId: string) => Promise<boolean>;
  assignRole: (userId: string, role: string) => Promise<boolean>;
  removeRole: (userId: string, role: string) => Promise<boolean>;
  changeUserSubscription: (userId: string, request: AdminUserSubscriptionRequest) => Promise<boolean>;
  resetUserPassword: (userId: string, newPassword: string) => Promise<boolean>;
  loadAvailableRoles: () => Promise<void>;
}

interface UseAdminMachinesReturn {
  machines: PagedResult<AdminMachineListDto> | null;
  loading: boolean;
  error: string | null;
  searchMachines: (request: SearchRequest) => Promise<void>;
  createMachine: (request: AdminMachineCreateRequest) => Promise<boolean>;
  updateMachine: (machineId: string, request: AdminMachineUpdateRequest) => Promise<boolean>;
  deleteMachine: (machineId: string) => Promise<boolean>;
}

interface UseAdminErrorCodesReturn {
  errorCodes: PagedResult<AdminErrorCodeListDto> | null;
  errorSources: any[];
  loading: boolean;
  error: string | null;
  searchErrorCodes: (request: SearchRequest) => Promise<void>;
  createErrorCode: (request: AdminErrorCodeCreateRequest) => Promise<boolean>;
  updateErrorCode: (errorCodeId: string, request: AdminErrorCodeUpdateRequest) => Promise<boolean>;
  deleteErrorCode: (errorCodeId: string) => Promise<boolean>;
  loadErrorSources: () => Promise<void>;
}

export function useAdminDashboard(): UseAdminDashboardReturn {
  const [dashboardSummary, setDashboardSummary] = useState<AdminDashboardSummaryDto | null>(null);
  const [subscriptionStats, setSubscriptionStats] = useState<SubscriptionStatsDto | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStatsDto | null>(null);
  const [recentActivities, setRecentActivities] = useState<PagedResult<RecentActivityDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshDashboard = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const summary = await adminService.getDashboardSummary();
      setDashboardSummary(summary);
    } catch (err: any) {
      setError(err.message || 'Dashboard verileri yüklenemedi');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const stats = await adminService.getSubscriptionStats();
      setSubscriptionStats(stats);
    } catch (err: any) {
      setError(err.message || 'İstatistik verileri yüklenemedi');
      console.error('Stats error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRevenue = useCallback(async (fromDate?: string, toDate?: string) => {
    try {
      setLoading(true);
      setError(null);
      const stats = await adminService.getRevenueStats(fromDate, toDate);
      setRevenueStats(stats);
    } catch (err: any) {
      setError(err.message || 'Gelir verileri yüklenemedi');
      console.error('Revenue error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshActivities = useCallback(async (request: SearchRequest) => {
    try {
      setLoading(true);
      setError(null);
      const activities = await adminService.getRecentActivities(request);
      setRecentActivities(activities);
    } catch (err: any) {
      setError(err.message || 'Aktivite verileri yüklenemedi');
      console.error('Activities error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dashboardSummary,
    subscriptionStats,
    revenueStats,
    recentActivities,
    loading,
    error,
    refreshDashboard,
    refreshStats,
    refreshRevenue,
    refreshActivities,
  };
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<PagedResult<AdminUserListDto> | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUserDetailDto | null>(null);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async (request: SearchRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getUsers(request);
      setUsers(result);
    } catch (err: any) {
      setError(err.message || 'Kullanıcılar yüklenemedi');
      console.error('Search users error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserById = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      const user = await adminService.getUserById(userId);
      setSelectedUser(user);
    } catch (err: any) {
      setError(err.message || 'Kullanıcı detayı yüklenemedi');
      console.error('Get user error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (request: AdminCreateUserRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.createUser(request);
      message.success('Kullanıcı başarıyla oluşturuldu');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Kullanıcı oluşturulamadı');
      console.error('Create user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (userId: string, request: AdminUpdateUserRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.updateUser(userId, request);
      message.success('Kullanıcı başarıyla güncellendi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Kullanıcı güncellenemedi');
      console.error('Update user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.deleteUser(userId);
      message.success('Kullanıcı başarıyla silindi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Kullanıcı silinemedi');
      console.error('Delete user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const activateUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.activateUser(userId);
      message.success('Kullanıcı başarıyla aktifleştirildi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Kullanıcı aktifleştirilemedi');
      console.error('Activate user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deactivateUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.deactivateUser(userId);
      message.success('Kullanıcı başarıyla pasifleştirildi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Kullanıcı pasifleştirilemedi');
      console.error('Deactivate user error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const assignRole = useCallback(async (userId: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.assignRole(userId, role);
      message.success('Rol başarıyla atandı');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Rol atanamadı');
      console.error('Assign role error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeRole = useCallback(async (userId: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.removeRole(userId, role);
      message.success('Rol başarıyla kaldırıldı');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Rol kaldırılamadı');
      console.error('Remove role error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const changeUserSubscription = useCallback(async (userId: string, request: AdminUserSubscriptionRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.changeUserSubscription(userId, request);
      message.success('Kullanıcı aboneliği başarıyla değiştirildi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Abonelik değiştirilemedi');
      console.error('Change subscription error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetUserPassword = useCallback(async (userId: string, newPassword: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.resetUserPassword(userId, newPassword);
      message.success('Kullanıcı şifresi başarıyla sıfırlandı');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Şifre sıfırlanamadı');
      console.error('Reset password error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAvailableRoles = useCallback(async () => {
    try {
      const roles = await adminService.getAvailableRoles();
      setAvailableRoles(roles);
    } catch (err: any) {
      console.error('Load roles error:', err);
    }
  }, []);

  return {
    users,
    selectedUser,
    availableRoles,
    loading,
    error,
    searchUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    activateUser,
    deactivateUser,
    assignRole,
    removeRole,
    changeUserSubscription,
    resetUserPassword,
    loadAvailableRoles,
  };
}

export function useAdminMachines(): UseAdminMachinesReturn {
  const [machines, setMachines] = useState<PagedResult<AdminMachineListDto> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMachines = useCallback(async (request: SearchRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getMachines(request);
      setMachines(result);
    } catch (err: any) {
      setError(err.message || 'Makineler yüklenemedi');
      console.error('Search machines error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createMachine = useCallback(async (request: AdminMachineCreateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.createMachine(request);
      message.success('Makine başarıyla oluşturuldu');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Makine oluşturulamadı');
      console.error('Create machine error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMachine = useCallback(async (machineId: string, request: AdminMachineUpdateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.updateMachine(machineId, request);
      message.success('Makine başarıyla güncellendi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Makine güncellenemedi');
      console.error('Update machine error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMachine = useCallback(async (machineId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.deleteMachine(machineId);
      message.success('Makine başarıyla silindi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Makine silinemedi');
      console.error('Delete machine error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    machines,
    loading,
    error,
    searchMachines,
    createMachine,
    updateMachine,
    deleteMachine,
  };
}

export function useAdminErrorCodes(): UseAdminErrorCodesReturn {
  const [errorCodes, setErrorCodes] = useState<PagedResult<AdminErrorCodeListDto> | null>(null);
  const [errorSources, setErrorSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchErrorCodes = useCallback(async (request: SearchRequest) => {
    try {
      setLoading(true);
      setError(null);
      const result = await adminService.getErrorCodes(request);
      setErrorCodes(result);
    } catch (err: any) {
      setError(err.message || 'Hata kodları yüklenemedi');
      console.error('Search error codes error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createErrorCode = useCallback(async (request: AdminErrorCodeCreateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.createErrorCode(request);
      message.success('Hata kodu başarıyla oluşturuldu');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Hata kodu oluşturulamadı');
      console.error('Create error code error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateErrorCode = useCallback(async (errorCodeId: string, request: AdminErrorCodeUpdateRequest): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.updateErrorCode(errorCodeId, request);
      message.success('Hata kodu başarıyla güncellendi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Hata kodu güncellenemedi');
      console.error('Update error code error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteErrorCode = useCallback(async (errorCodeId: string): Promise<boolean> => {
    try {
      setLoading(true);
      await adminService.deleteErrorCode(errorCodeId);
      message.success('Hata kodu başarıyla silindi');
      return true;
    } catch (err: any) {
      message.error(err.message || 'Hata kodu silinemedi');
      console.error('Delete error code error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadErrorSources = useCallback(async () => {
    try {
      const sources = await adminService.getErrorSources();
      setErrorSources(sources);
    } catch (err: any) {
      console.error('Load error sources error:', err);
    }
  }, []);

  return {
    errorCodes,
    errorSources,
    loading,
    error,
    searchErrorCodes,
    createErrorCode,
    updateErrorCode,
    deleteErrorCode,
    loadErrorSources,
  };
}