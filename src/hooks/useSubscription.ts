import { useState, useEffect, useCallback } from 'react';
import { subscriptionService, MachineSelectionInfo, SubscriptionSummary } from '../services/subscription.service';
import { 
  SubscriptionPlanDto, 
  UserSubscriptionDto, 
  PaymentHistoryDto,
  SubscribeRequest 
} from '../types/api';

interface UseSubscriptionReturn {
  currentSubscription: UserSubscriptionDto | null;
  subscriptionLoading: boolean;
  subscriptionError: string | null;
  availablePlans: SubscriptionPlanDto[];
  plansLoading: boolean;
  plansError: string | null;
  paymentHistory: PaymentHistoryDto[];
  paymentsLoading: boolean;
  paymentsError: string | null;
  machineSelectionInfo: MachineSelectionInfo | null;
  subscriptionSummary: SubscriptionSummary | null;
  subscribe: (request: SubscribeRequest) => Promise<void>;
  cancelSubscription: () => Promise<void>;
  renewSubscription: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  refreshPlans: () => Promise<void>;
  refreshPayments: () => Promise<void>;
  refreshSummary: () => Promise<void>;
  isSubscribing: boolean;
  isCancelling: boolean;
  isRenewing: boolean;
  hasActiveSubscription: boolean;
  subscriptionLevel: number;
  canSelectMachines: boolean;
  remainingMachineSelections: number;
  isDemo: boolean;
}

export function useSubscription(): UseSubscriptionReturn {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscriptionDto | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  
  const [availablePlans, setAvailablePlans] = useState<SubscriptionPlanDto[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);
  
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryDto[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState<string | null>(null);
  
  const [machineSelectionInfo, setMachineSelectionInfo] = useState<MachineSelectionInfo | null>(null);
  const [subscriptionSummary, setSubscriptionSummary] = useState<SubscriptionSummary | null>(null);
  
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRenewing, setIsRenewing] = useState(false);

  const refreshSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
      
      const selectionInfo = await subscriptionService.getMachineSelectionInfo();
      setMachineSelectionInfo(selectionInfo);
      
    } catch (error: any) {
      setSubscriptionError(error.message || 'Abonelik bilgileri yüklenemedi');
      console.error('Refresh subscription error:', error);
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  const refreshPlans = useCallback(async () => {
    try {
      setPlansLoading(true);
      setPlansError(null);
      
      const plans = await subscriptionService.getAvailablePlans();
      setAvailablePlans(plans);
    } catch (error: any) {
      setPlansError(error.message || 'Planlar yüklenemedi');
      console.error('Refresh plans error:', error);
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const refreshPayments = useCallback(async () => {
    try {
      setPaymentsLoading(true);
      setPaymentsError(null);
      
      const payments = await subscriptionService.getPaymentHistory();
      setPaymentHistory(payments);
    } catch (error: any) {
      setPaymentsError(error.message || 'Ödeme geçmişi yüklenemedi');
      console.error('Refresh payments error:', error);
    } finally {
      setPaymentsLoading(false);
    }
  }, []);

  const refreshSummary = useCallback(async () => {
    try {
      const summary = await subscriptionService.getSubscriptionSummary();
      setSubscriptionSummary(summary);
    } catch (error: any) {
      console.error('Refresh summary error:', error);
    }
  }, []);

  const subscribe = useCallback(async (request: SubscribeRequest) => {
    try {
      setIsSubscribing(true);
      
      const result = await subscriptionService.subscribe(request);
      
      if (!result.success) {
        throw new Error(result.message || 'Abonelik oluşturulamadı');
      }
      
      await Promise.all([
        refreshSubscription(),
        refreshSummary()
      ]);
      
    } catch (error: any) {
      throw error;
    } finally {
      setIsSubscribing(false);
    }
  }, [refreshSubscription, refreshSummary]);

  const cancelSubscription = useCallback(async () => {
    try {
      setIsCancelling(true);
      
      await subscriptionService.cancelSubscription();
      
      await Promise.all([
        refreshSubscription(),
        refreshSummary()
      ]);
      
    } catch (error: any) {
      throw error;
    } finally {
      setIsCancelling(false);
    }
  }, [refreshSubscription, refreshSummary]);

  const renewSubscription = useCallback(async () => {
    try {
      setIsRenewing(true);
      
      await subscriptionService.renewSubscription();
      
      await Promise.all([
        refreshSubscription(),
        refreshSummary()
      ]);
      
    } catch (error: any) {
      throw error;
    } finally {
      setIsRenewing(false);
    }
  }, [refreshSubscription, refreshSummary]);

  useEffect(() => {
    Promise.all([
      refreshSubscription(),
      refreshPlans(),
      refreshSummary()
    ]);
  }, [refreshSubscription, refreshPlans, refreshSummary]);

  const hasActiveSubscription = currentSubscription?.isCurrentlyActive ?? false;
  const subscriptionLevel = currentSubscription?.plan?.level ?? 0;
  const canSelectMachines = machineSelectionInfo?.machineSelection.canSelectMore ?? false;
  const remainingMachineSelections = machineSelectionInfo?.machineSelection.remainingSelections ?? 0;
  const isDemo = machineSelectionInfo?.isDemo ?? true;

  return {
    currentSubscription,
    subscriptionLoading,
    subscriptionError,
    availablePlans,
    plansLoading,
    plansError,
    paymentHistory,
    paymentsLoading,
    paymentsError,
    machineSelectionInfo,
    subscriptionSummary,
    subscribe,
    cancelSubscription,
    renewSubscription,
    refreshSubscription,
    refreshPlans,
    refreshPayments,
    refreshSummary,
    isSubscribing,
    isCancelling,
    isRenewing,
    hasActiveSubscription,
    subscriptionLevel,
    canSelectMachines,
    remainingMachineSelections,
    isDemo,
  };
}