export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName?: string;
  acceptTerms: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
  user: UserInfoResponse;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  emailConfirmed: boolean;
  requiresEmailConfirmation: boolean;
  message: string;
}

export interface UserInfoResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  emailConfirmed: boolean;
  isActive: boolean;
  subscriptionLevel?: number;
}

export interface TokenResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface ErrorCodeDto {
  id: string;
  code: string;
  title: string;
  description?: string;
  solutions?: string;
  machineBrand?: string;
  partName?: string;
  errorSource?: ErrorSourceDto;
  fullHierarchyPath: string;
  accessLevel: string;
  hasAccess: boolean;
}

export interface ErrorCodeListDto {
  id: string;
  code: string;
  title: string;
  description?: string;
  solutions: string;
  machineBrand?: string;
  partName?: string;
  sourceName?: string;
  fullHierarchyPath: string;
  accessLevel: string;
  hasAccess: boolean;
}

export interface ErrorSourceDto {
  id: string;
  sourceName: string;
  description?: string;
}

export interface LaserMachineListDto {
  id: string;
  brand: string;
  description?: string;
  displayName: string;
  isSelected: boolean;
  selectionOrder?: number;
  hasAccess: boolean;
  accessType: string;
}

export interface LaserMachineDto {
  id: string;
  brand: string;
  description?: string;
  displayName: string;
  models: MachineModelDto[];
  isSelected: boolean;
  selectionOrder?: number;
  hasAccess: boolean;
  accessType: string;
}

export interface MachineModelDto {
  id: string;
  modelCode: string;
  description?: string;
  fullName: string;
}

export interface MachineSectionDto {
  id: string;
  sectionName: string;
  description?: string;
}

export interface MachinePartDto {
  id: string;
  partName: string;
  description?: string;
  fullHierarchyName: string;
}

export interface ReorderRequest {
  machineIds: string[];
}

export interface SubscriptionPlanDto {
  id: string;
  name: string;
  displayName: string;
  price: number;
  currency: string;
  billingPeriod: string;
  level: number;
  maxMachineSelection: number;
  canAccessAllMachines: boolean;
  isFreePlan: boolean;
  hasUnlimitedMachineSelection: boolean;
  machineSelectionText: string;
}

export interface UserSubscriptionDto {
  id: string;
  plan: SubscriptionPlanDto;
  startDate: string;
  endDate: string;
  status: string;
  autoRenew: boolean;
  isCurrentlyActive: boolean;
  daysRemaining: number;
}

export interface SubscribeRequest {
  planId: string;
  autoRenew?: boolean;
}

export interface PaymentHistoryDto {
  id: string;
  amount: number;
  currency: string;
  status: string;
  transactionDate: string;
  planName: string;
  paymentProviderId?: string;
}

export interface UserDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  companyName?: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  activeSubscription?: UserSubscriptionDto;
  roles: string[];
  canSelectMachines: boolean;
  subscriptionLevel: number;
  isEnterprise: boolean;
  selectedMachineIds: string[];
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  companyName?: string;
}

export interface SearchRequest {
  query?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDescending?: boolean;
  filters?: Record<string, any>;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SelectionStatus {
  userId: string;
  subscription: {
    level: string;
    plan: string;
    isEnterprise: boolean;
  };
  selections: {
    current: number;
    maximum: string;
    canSelectMore: boolean;
    remainingSlots: number;
  };
  selectedMachines: Array<{
    id: string;
    brand: string;
    selectionOrder?: number;
  }>;
}

export interface AccessInfo {
  userId: string;
  subscription: {
    level: string;
    plan: string;
    isEnterprise: boolean;
  };
  access: {
    totalAccessibleCodes: number;
    freeCodesCount: number;
    premiumCodesCount: number;
    hasFullAccess: boolean;
  };
}