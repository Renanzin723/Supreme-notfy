import { useState, useEffect } from 'react';
import { supabaseApiClient } from '@/lib/supabase-api';

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscription: any;
  isAdmin: boolean;
  loading: boolean;
  error: string | null;
}

export function useSubscriptionCheck(userId: string | null) {
  const [status, setStatus] = useState<SubscriptionStatus>({
    hasActiveSubscription: false,
    subscription: null,
    isAdmin: false,
    loading: true,
    error: null
  });

  useEffect(() => {
    if (!userId) {
      setStatus(prev => ({ ...prev, loading: false }));
      return;
    }

    const checkSubscription = async () => {
      try {
        setStatus(prev => ({ ...prev, loading: true, error: null }));
        
        const result = await supabaseApiClient.checkUserSubscription(userId);
        
        if (result.success) {
          setStatus({
            hasActiveSubscription: result.data.hasActiveSubscription,
            subscription: result.data.subscription,
            isAdmin: result.data.isAdmin,
            loading: false,
            error: null
          });
        } else {
          setStatus(prev => ({
            ...prev,
            loading: false,
            error: result.error || 'Erro ao verificar assinatura'
          }));
        }
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          loading: false,
          error: 'Erro ao verificar assinatura'
        }));
      }
    };

    checkSubscription();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkSubscription, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [userId]);

  return status;
}
