import { httpClient } from '../lib/http-client';
import { API_CONFIG } from '../lib/config';
import { 
  SubscriptionPlanDto, 
  UserSubscriptionDto, 
  SubscribeRequest,
  PaymentHistoryDto,
  ApiResponse 
} from '../types/api';

export interface SubscriptionSummary {
  subscription: UserSubscriptionDto | null;
  capabilities: {
    canSelectMachines: boolean;
    remainingMachineSelections: number;
    hasUnlimitedAccess: boolean;
    maxMachineSelections: number;
  };
  isDemo: boolean;
  demoNote?: string;
}

export interface MachineSelectionInfo {
  userId: string;
  subscription: {
    level: string;
    plan: string;
    isEnterprise: boolean;
  };
  machineSelection: {
    canSelectMore: boolean;
    remainingSelections: number;
    remainingText: string;
  };
  isDemo: boolean;
}

export class SubscriptionService {
  
  // Plan listeleme
  async getAvailablePlans(): Promise<SubscriptionPlanDto[]> {
    return await httpClient.get<SubscriptionPlanDto[]>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.PLANS
    );
  }

  // Mevcut abonelik
  async getCurrentSubscription(): Promise<UserSubscriptionDto | null> {
    try {
      return await httpClient.get<UserSubscriptionDto>(
        API_CONFIG.ENDPOINTS.SUBSCRIPTION.CURRENTSUBSCRIPTION
      );
    } catch (error) {
      return null;
    }
  }

  // Abonelik geçmişi
  async getSubscriptionHistory(): Promise<UserSubscriptionDto[]> {
    return await httpClient.get<UserSubscriptionDto[]>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.HISTORY
    );
  }

  // Abonelik oluşturma
  async subscribe(request: SubscribeRequest): Promise<ApiResponse<string>> {
    return await httpClient.post<ApiResponse<string>>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUBSCRIBE,
      request
    );
  }

  // Aboneliği iptal etme
  async cancelSubscription(): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION.CANCEL);
  }

  // Aboneliği yenileme
  async renewSubscription(): Promise<void> {
    await httpClient.post(API_CONFIG.ENDPOINTS.SUBSCRIPTION.RENEW);
  }

  // Ödeme geçmişi
  async getPaymentHistory(): Promise<PaymentHistoryDto[]> {
    return await httpClient.get<PaymentHistoryDto[]>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.PAYMENT
    );
  }

  // Makine seçim bilgileri
  async getMachineSelectionInfo(): Promise<MachineSelectionInfo> {
    return await httpClient.get<MachineSelectionInfo>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.MACHINESELECTIONINFO
    );
  }

  // Abonelik özeti (dashboard için)
  async getSubscriptionSummary(): Promise<SubscriptionSummary> {
    return await httpClient.get<SubscriptionSummary>(
      API_CONFIG.ENDPOINTS.SUBSCRIPTION.SUMMARY
    );
  }

  // Plan karşılaştırması
  async comparePlans(): Promise<{
    plans: Array<{
      id: string;
      name: string;
      displayName: string;
      price: number;
      currency: string;
      level: number;
      features: {
        machineSelection: string;
        errorCodeAccess: string;
        fullAccess: boolean;
        isFreePlan: boolean;
      };
      demoNote?: string;
    }>;
    isDemo: boolean;
    message: string;
  }> {
    return await httpClient.get(API_CONFIG.ENDPOINTS.SUBSCRIPTION.COMPARE);
  }

  // Yardımcı metodlar
  async canUserSelectMoreMachines(): Promise<boolean> {
    const info = await this.getMachineSelectionInfo();
    return info.machineSelection.canSelectMore;
  }

  async getRemainingMachineSelections(): Promise<number> {
    const info = await this.getMachineSelectionInfo();
    return info.machineSelection.remainingSelections;
  }

  // Subscription durumu kontrol
  async hasActiveSubscription(): Promise<boolean> {
    const current = await this.getCurrentSubscription();
    return current?.isCurrentlyActive ?? false;
  }

  async getSubscriptionLevel(): Promise<number> {
    const current = await this.getCurrentSubscription();
    return current?.plan?.level ?? 0;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;