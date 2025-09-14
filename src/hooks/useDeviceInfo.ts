import { useState, useEffect } from 'react';

interface DeviceInfo {
  ip: string | null;
  userAgent: string;
  platform: string;
  browser: string;
  device: string;
  screen: {
    width: number;
    height: number;
  };
  timezone: string;
  language: string;
  online: boolean;
}

export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    ip: null,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    browser: getBrowserName(),
    device: getDeviceType(),
    screen: {
      width: window.screen.width,
      height: window.screen.height
    },
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    language: navigator.language,
    online: navigator.onLine
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para obter o nome do navegador
  function getBrowserName(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      return 'Chrome';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
      return 'Opera';
    } else {
      return 'Desconhecido';
    }
  }

  // Função para detectar o tipo de dispositivo
  function getDeviceType(): string {
    const userAgent = navigator.userAgent;
    
    if (/Android/i.test(userAgent)) {
      return 'Android';
    } else if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'iOS';
    } else if (/Windows/i.test(userAgent)) {
      return 'Windows';
    } else if (/Mac/i.test(userAgent)) {
      return 'macOS';
    } else if (/Linux/i.test(userAgent)) {
      return 'Linux';
    } else {
      return 'Desconhecido';
    }
  }

  // Função para obter o IP público
  const fetchPublicIP = async (): Promise<string> => {
    try {
      // Tentar múltiplos serviços para obter o IP
      const services = [
        'https://api.ipify.org?format=json',
        'https://ipapi.co/json/',
        'https://api.myip.com',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            // Timeout de 5 segundos
            signal: AbortSignal.timeout(5000)
          });

          if (!response.ok) continue;

          const data = await response.json();
          
          // Diferentes serviços retornam o IP em campos diferentes
          const ip = data.ip || data.query || data.ipAddress;
          if (ip) {
            return ip;
          }
        } catch (serviceError) {
          console.warn(`Falha ao obter IP do serviço ${service}:`, serviceError);
          continue;
        }
      }

      throw new Error('Não foi possível obter o IP público');
    } catch (error) {
      console.error('Erro ao obter IP público:', error);
      throw error;
    }
  };

  // Função para obter informações detalhadas do IP
  const fetchIPDetails = async (ip: string) => {
    try {
      const response = await fetch(`https://ipapi.co/${ip}/json/`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000)
      });

      if (!response.ok) {
        throw new Error('Falha ao obter detalhes do IP');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao obter detalhes do IP:', error);
      return null;
    }
  };

  useEffect(() => {
    const loadDeviceInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        // Obter IP público
        const ip = await fetchPublicIP();
        
        setDeviceInfo(prev => ({
          ...prev,
          ip
        }));

        // Obter detalhes do IP (opcional)
        try {
          const ipDetails = await fetchIPDetails(ip);
          if (ipDetails) {
            console.log('Detalhes do IP:', ipDetails);
          }
        } catch (detailsError) {
          console.warn('Não foi possível obter detalhes do IP:', detailsError);
        }

      } catch (ipError) {
        console.error('Erro ao obter IP:', ipError);
        setError('Não foi possível obter o IP público');
      } finally {
        setLoading(false);
      }
    };

    loadDeviceInfo();

    // Atualizar status online/offline
    const handleOnlineStatusChange = () => {
      setDeviceInfo(prev => ({
        ...prev,
        online: navigator.onLine
      }));
    };

    window.addEventListener('online', handleOnlineStatusChange);
    window.addEventListener('offline', handleOnlineStatusChange);

    return () => {
      window.removeEventListener('online', handleOnlineStatusChange);
      window.removeEventListener('offline', handleOnlineStatusChange);
    };
  }, []);

  return {
    deviceInfo,
    loading,
    error,
    refresh: () => {
      setLoading(true);
      setError(null);
      // Recarregar informações
      window.location.reload();
    }
  };
};
