// Configuração do notify-v2
export const NOTIFY_V2_CONFIG = {
  // Feature flag para notify-v2 (true por padrão)
  ENABLED: (import.meta.env?.NOTIFY_V2_ENABLED ?? 'true') === 'true',
  
  // Versão do Service Worker
  SW_VERSION: 'v10',
  
  // Logs habilitados
  LOGS_ENABLED: true
};

// Função para verificar se notify-v2 está habilitado
export function isNotifyV2Enabled(): boolean {
  return NOTIFY_V2_CONFIG.ENABLED;
}

// Função para log condicional
export function logNotifyV2(message: string, data?: any) {
  if (NOTIFY_V2_CONFIG.LOGS_ENABLED) {
    console.log(`🔔 [NOTIFY-V2] ${message}`, data || '');
  }
}
