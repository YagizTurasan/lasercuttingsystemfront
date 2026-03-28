// src/services/dashboard.service.ts
import { httpClient } from '../lib/http-client';
import { API_CONFIG } from '../lib/config';
import { UserSubscriptionDto } from '../types/api';

export interface DashboardStats {
  selectedMachinesCount: number;
  totalErrorCodes: number;
  freeErrorCodes: number;
  subscriptionStatus: string;
  userInfo: {
    hasActiveSubscription: boolean;
    subscriptionLevel: string;
    canSelectMachines: boolean;
  };
}

export class DashboardService {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      // 1. Önce mevcut abonelik bilgisini alalım
      let currentSubscription: UserSubscriptionDto | null = null;
      try {
        currentSubscription = await httpClient.get<UserSubscriptionDto>(
          API_CONFIG.ENDPOINTS.SUBSCRIPTION.CURRENTSUBSCRIPTION
        );
        console.log('Current subscription:', currentSubscription);
      } catch (error) {
        console.warn('No active subscription found:', error);
      }

      // 2. Free error codes
      let freeErrorCodes: any[] = [];
      try {
        freeErrorCodes = await httpClient.get(API_CONFIG.ENDPOINTS.ERROR_CODES.FREE);
      } catch (error) {
        console.error('Free error codes error:', error);
      }

      // 3. Selected machines
      let selectedMachines: any[] = [];
      try {
        selectedMachines = await httpClient.get(API_CONFIG.ENDPOINTS.MACHINES.SELECTED);
      } catch (error) {
        console.error('Selected machines error:', error);
      }

      // 4. Access info (fallback için)
      let accessInfo: any = null;
      try {
        accessInfo = await httpClient.get(API_CONFIG.ENDPOINTS.ERROR_CODES.ACCESSINFO);
      } catch (error) {
        console.error('Access info error:', error);
      }

      // Güvenli veri erişimi
      const selectedCount = Array.isArray(selectedMachines) ? selectedMachines.length : 0;
      const freeCount = Array.isArray(freeErrorCodes) ? freeErrorCodes.length : 0;

      // Abonelik durumu - öncelik sırası: currentSubscription > accessInfo
      let subscriptionStatus = 'Free';
      let subscriptionLevel = '0';
      let hasActiveSubscription = false;

      if (currentSubscription && currentSubscription.plan) {
        // Mevcut abonelik varsa
        subscriptionStatus = currentSubscription.plan.displayName;
        subscriptionLevel = currentSubscription.plan.level.toString();
        hasActiveSubscription = currentSubscription.isCurrentlyActive || false;
        
        console.log('Using current subscription data:', {
          status: subscriptionStatus,
          level: subscriptionLevel,
          active: hasActiveSubscription
        });
      } else if (accessInfo) {
        // Fallback olarak accessInfo kullan
        subscriptionStatus = accessInfo.subscription?.plan || 'Free';
        subscriptionLevel = (accessInfo.subscription?.level || '0').toString();
        hasActiveSubscription = accessInfo.subscription?.isEnterprise || false;
        
        console.log('Using access info data:', {
          status: subscriptionStatus,
          level: subscriptionLevel,
          active: hasActiveSubscription
        });
      }

      // Total accessible codes hesaplama
      const totalAccessible = accessInfo?.access?.totalAccessibleCodes || freeCount;

      const result = {
        selectedMachinesCount: selectedCount,
        totalErrorCodes: totalAccessible,
        freeErrorCodes: freeCount,
        subscriptionStatus,
        userInfo: {
          hasActiveSubscription,
          subscriptionLevel,
          canSelectMachines: hasActiveSubscription || selectedCount > 0
        }
      };

      console.log('Dashboard stats result:', result);
      return result;

    } catch (error) {
      console.error('Dashboard stats error:', error);
      // Fallback values
      return {
        selectedMachinesCount: 0,
        totalErrorCodes: 0,
        freeErrorCodes: 0,
        subscriptionStatus: 'Free',
        userInfo: {
          hasActiveSubscription: false,
          subscriptionLevel: '0',
          canSelectMachines: false
        }
      };
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;