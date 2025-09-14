import { sanitizeNotificationInput } from './sanitize';
import { isNotifyV2Enabled, logNotifyV2 } from './config';

export async function displayLocalNotification(raw: any) {
  if (!isNotifyV2Enabled()) {
    // fallback para implementação antiga, se existir
    // @ts-ignore
    return (globalThis as any).__notifyDisplayLegacy?.(raw);
  }
  
  const payload = sanitizeNotificationInput(raw);
  
  // Browser Notification API
  if ('Notification' in globalThis) {
    if (Notification.permission !== 'granted') {
      try { 
        await Notification.requestPermission(); 
      } catch (error) {
        console.error('❌ [NOTIFY-V2] Erro ao solicitar permissão:', error);
      }
    }
    
    const { title = 'Notificação', ...opts } = payload;
    
    // garantir que não passe subtitle nas options
    delete (opts as any).subtitle;
    delete (opts as any).subTitle;
    delete (opts as any).apple_subtitle;
    delete (opts as any).from;
    delete (opts as any).appName;
    
    logNotifyV2('Exibindo notificação local:', { title, opts });
    new Notification(title, opts as NotificationOptions);
  }
  
  // Se houver bibliotecas (Notifee/Capacitor), plugue aqui também (sanitizado)
  // ex.: notifee.displayNotification(payload limpo)
}

export function sanitizeServerPayload(payload: any = {}) {
  const clean = sanitizeNotificationInput(payload);
  
  // iOS/APNs via FCM
  if (clean.apns?.payload?.aps?.alert) {
    delete clean.apns.payload.aps.alert.subtitle;
  }
  
  // Android (no-op)
  if (clean.android?.notification) {
    delete clean.android.notification.subtitle;
  }
  
  // Web Push
  if (clean.web?.notification) {
    delete clean.web.notification.subtitle;
  }
  
  logNotifyV2('Payload do servidor sanitizado:', { original: payload, clean: clean });
  return clean;
}

// Exportar também a função de sanitização para uso direto
export { sanitizeNotificationInput } from './sanitize';
