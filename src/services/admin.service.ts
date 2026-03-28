import { httpClient } from '../lib/http-client';
import { API_CONFIG } from '../lib/config';
import { ApiResponse, PagedResult, SearchRequest } from '../types/api';

export interface AdminDashboardSummaryDto {
  totalUsers: number;
  activeUsers: number;
  totalErrorCodes: number;
  totalMachines: number;
  activeSubscriptions: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  lastUpdated: string;
}

export interface SubscriptionStatsDto {
  planDistributions: PlanDistributionDto[];
  totalSubscriptions: number;
  averageMonthlyRevenue: number;
  totalRevenue: number;
}

export interface PlanDistributionDto {
  planName: string;
  displayName: string;
  userCount: number;
  revenue: number;
  percentage: number;
}

export interface RevenueStatsDto {
  currentMonthRevenue: number;
  lastMonthRevenue: number;
  currentYearRevenue: number;
  lastYearRevenue: number;
  monthlyGrowthRate: number;
  yearlyGrowthRate: number;
  monthlyBreakdown: MonthlyRevenueDto[];
}

export interface MonthlyRevenueDto {
  year: number;
  month: number;
  monthName: string;
  revenue: number;
  transactionCount: number;
}

export interface RecentActivityDto {
  activityType: string;
  description: string;
  userEmail?: string;
  userName?: string;
  createdAt: string;
  timeAgo: string;
}

export interface AdminUserListDto {
  id: string;
  email: string;
  fullName: string;
  companyName?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  currentPlan?: string;
  subscriptionEndDate?: string;
  totalPayments: number;
  selectedMachinesCount: number;
  roles: string[];
}

export interface AdminUserDetailDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  activeSubscription?: AdminUserSubscriptionDto;
  subscriptionHistory: AdminUserSubscriptionDto[];
  machineSelections: AdminUserMachineSelectionDto[];
  paymentHistory: AdminPaymentHistoryDto[];
  roles: string[];
  totalPayments: number;
  totalLogins: number;
  lastLoginDate?: string;
}

export interface AdminUserSubscriptionDto {
  id: string;
  planName: string;
  planDisplayName: string;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  isCurrentlyActive: boolean;
  daysRemaining: number;
}

export interface AdminUserMachineSelectionDto {
  id: string;
  machineId: string;
  machineBrand: string;
  selectionOrder: number;
  selectedAt: string;
}

export interface AdminPaymentHistoryDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
  planName: string;
  paymentProviderId?: string;
}

export interface AdminCreateUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  password: string;
  emailConfirmed: boolean;
  roles: string[];
  initialPlanId?: string;
}

export interface AdminUpdateUserRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  roles: string[];
}

export interface AdminUserSubscriptionRequest {
  planId: string;
  startDate: string;
  autoRenew: boolean;
  overrideValidation: boolean;
}

export interface AdminMachineListDto {
  id: string;
  brand: string;
  description?: string;
  modelsCount: number;
  errorCodesCount: number;
  usersCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface AdminMachineCreateRequest {
  brand: string;
  description?: string;
}

export interface AdminMachineUpdateRequest {
  brand: string;
  description?: string;
  isActive: boolean;
}

export interface AdminErrorCodeListDto {
  id: string;
  code: string;
  title: string;
  machineBrand?: string;
  partName?: string;
  sourceName?: string;
  accessLevel: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminErrorCodeCreateRequest {
  code: string;
  title: string;
  description?: string;
  solutions?: string;
  machineId?: string;
  machinePartId?: string;
  errorSourceId?: string;
  isFreeAccess: boolean;
  isCommonAcrossAllMachines: boolean;
}

export interface AdminErrorCodeUpdateRequest {
  code: string;
  title: string;
  description?: string;
  solutions?: string;
  machineId?: string;
  machinePartId?: string;
  errorSourceId?: string;
  isFreeAccess: boolean;
  isCommonAcrossAllMachines: boolean;
  isActive: boolean;
}

const ADMIN_API_CONFIG = {
  ...API_CONFIG,
  ENDPOINTS: {
    ...API_CONFIG.ENDPOINTS,
    ADMIN: {
      DASHBOARD: {
        SUMMARY: '/admin/dashboard/summary',
        SUBSCRIPTION_STATS: '/admin/dashboard/subscription-stats',
        REVENUE_STATS: '/admin/dashboard/revenue-stats',
        RECENT_ACTIVITIES: '/admin/dashboard/recent-activities',
      },
      USERS: {
        SEARCH: '/admin/users/search',
        BY_ID: (id: string) => `/admin/users/${id}`,
        CREATE: '/admin/users',
        UPDATE: (id: string) => `/admin/users/${id}`,
        DELETE: (id: string) => `/admin/users/${id}`,
        ACTIVATE: (id: string) => `/admin/users/${id}/activate`,
        DEACTIVATE: (id: string) => `/admin/users/${id}/deactivate`,
        ASSIGN_ROLE: (id: string, role: string) => `/admin/users/${id}/roles/${role}`,
        REMOVE_ROLE: (id: string, role: string) => `/admin/users/${id}/roles/${role}`,
        CHANGE_SUBSCRIPTION: (id: string) => `/admin/users/${id}/subscription`,
        RESET_PASSWORD: (id: string) => `/admin/users/${id}/reset-password`,
        AVAILABLE_ROLES: '/admin/users/roles',
      },
      MACHINES: {
        SEARCH: '/admin/machines/search',
        CREATE: '/admin/machines',
        UPDATE: (id: string) => `/admin/machines/${id}`,
        DELETE: (id: string) => `/admin/machines/${id}`,
      },
      ERROR_CODES: {
        SEARCH: '/admin/error-codes/search',
        CREATE: '/admin/error-codes',
        UPDATE: (id: string) => `/admin/error-codes/${id}`,
        DELETE: (id: string) => `/admin/error-codes/${id}`,
        SOURCES: '/admin/error-codes/sources',
      },
    },
  },
};

export class AdminService {
  async getDashboardSummary(): Promise<AdminDashboardSummaryDto> {
    const response = await httpClient.get<ApiResponse<AdminDashboardSummaryDto>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.SUMMARY
    );
    return response.data!;
  }

  async getSubscriptionStats(): Promise<SubscriptionStatsDto> {
    const response = await httpClient.get<ApiResponse<SubscriptionStatsDto>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.SUBSCRIPTION_STATS
    );
    return response.data!;
  }

  async getRevenueStats(fromDate?: string, toDate?: string): Promise<RevenueStatsDto> {
    const params: Record<string, string> = {};
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    
    const queryString = httpClient.buildQueryString(params);
    const response = await httpClient.get<ApiResponse<RevenueStatsDto>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.REVENUE_STATS + queryString
    );
    return response.data!;
  }

  async getRecentActivities(request: SearchRequest): Promise<PagedResult<RecentActivityDto>> {
    const response = await httpClient.post<ApiResponse<PagedResult<RecentActivityDto>>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.DASHBOARD.RECENT_ACTIVITIES,
      request
    );
    return response.data!;
  }

  async getUsers(request: SearchRequest): Promise<PagedResult<AdminUserListDto>> {
    const response = await httpClient.post<ApiResponse<PagedResult<AdminUserListDto>>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.SEARCH,
      request
    );
    return response.data!;
  }

  async getUserById(userId: string): Promise<AdminUserDetailDto> {
    const response = await httpClient.get<ApiResponse<AdminUserDetailDto>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.BY_ID(userId)
    );
    return response.data!;
  }

  async createUser(request: AdminCreateUserRequest): Promise<string> {
    const response = await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.CREATE,
      request
    );
    return response.data!;
  }

  async updateUser(userId: string, request: AdminUpdateUserRequest): Promise<void> {
    await httpClient.put<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.UPDATE(userId),
      request
    );
  }

  async deleteUser(userId: string): Promise<void> {
    await httpClient.delete<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.DELETE(userId)
    );
  }

  async activateUser(userId: string): Promise<void> {
    await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.ACTIVATE(userId)
    );
  }

  async deactivateUser(userId: string): Promise<void> {
    await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.DEACTIVATE(userId)
    );
  }

  async assignRole(userId: string, role: string): Promise<void> {
    await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.ASSIGN_ROLE(userId, role)
    );
  }

  async removeRole(userId: string, role: string): Promise<void> {
    await httpClient.delete<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.REMOVE_ROLE(userId, role)
    );
  }

  async changeUserSubscription(userId: string, request: AdminUserSubscriptionRequest): Promise<void> {
    await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.CHANGE_SUBSCRIPTION(userId),
      request
    );
  }

  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.RESET_PASSWORD(userId),
      { newPassword }
    );
  }

  async getAvailableRoles(): Promise<string[]> {
    const response = await httpClient.get<ApiResponse<string[]>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.USERS.AVAILABLE_ROLES
    );
    return response.data!;
  }

  async getMachines(request: SearchRequest): Promise<PagedResult<AdminMachineListDto>> {
    const response = await httpClient.post<ApiResponse<PagedResult<AdminMachineListDto>>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.MACHINES.SEARCH,
      request
    );
    return response.data!;
  }

  async createMachine(request: AdminMachineCreateRequest): Promise<string> {
    const response = await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.MACHINES.CREATE,
      request
    );
    return response.data!;
  }

  async updateMachine(machineId: string, request: AdminMachineUpdateRequest): Promise<void> {
    await httpClient.put<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.MACHINES.UPDATE(machineId),
      request
    );
  }

  async deleteMachine(machineId: string): Promise<void> {
    await httpClient.delete<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.MACHINES.DELETE(machineId)
    );
  }

  async getErrorCodes(request: SearchRequest): Promise<PagedResult<AdminErrorCodeListDto>> {
    const response = await httpClient.post<ApiResponse<PagedResult<AdminErrorCodeListDto>>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.ERROR_CODES.SEARCH,
      request
    );
    return response.data!;
  }

  async createErrorCode(request: AdminErrorCodeCreateRequest): Promise<string> {
    const response = await httpClient.post<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.ERROR_CODES.CREATE,
      request
    );
    return response.data!;
  }

  async updateErrorCode(errorCodeId: string, request: AdminErrorCodeUpdateRequest): Promise<void> {
    await httpClient.put<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.ERROR_CODES.UPDATE(errorCodeId),
      request
    );
  }

  async deleteErrorCode(errorCodeId: string): Promise<void> {
    await httpClient.delete<ApiResponse<string>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.ERROR_CODES.DELETE(errorCodeId)
    );
  }

  async getErrorSources() {
    const response = await httpClient.get<ApiResponse<any[]>>(
      ADMIN_API_CONFIG.ENDPOINTS.ADMIN.ERROR_CODES.SOURCES
    );
    return response.data!;
  }
}

export const adminService = new AdminService();
export default adminService;