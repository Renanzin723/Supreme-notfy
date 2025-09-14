// Shims de compatibilidade para chamadas antigas
import { sanitizeNotificationInput } from './sanitize';

// Shim global para compatibilidade (será definido após importar displayLocalNotification)
let displayLocalNotification: any = null;

// Wrapper para new Notification()
export function createNotification(title: string, options?: NotificationOptions) {
  const payload = { title, ...options };
  if (displayLocalNotification) {
    return displayLocalNotification(payload);
  }
  // Fallback direto
  new Notification(title, options);
}

// Wrapper para registration.showNotification()
export function showNotification(registration: ServiceWorkerRegistration, title: string, options?: NotificationOptions) {
  const payload = { title, ...options };
  if (displayLocalNotification) {
    return displayLocalNotification(payload);
  }
  // Fallback direto
  return registration.showNotification(title, options);
}

// Wrapper para notifee.displayNotification (se existir)
export function displayNotifeeNotification(payload: any) {
  const clean = sanitizeNotificationInput(payload);
  // Aqui você pode integrar com notifee se necessário
  // notifee.displayNotification(clean);
  console.log('🔔 [NOTIFY-V2] Notifee notification (sanitized):', clean);
}

// Wrapper para LocalNotifications.schedule (se existir)
export function scheduleLocalNotification(payload: any) {
  const clean = sanitizeNotificationInput(payload);
  // Aqui você pode integrar com LocalNotifications se necessário
  // LocalNotifications.schedule(clean);
  console.log('🔔 [NOTIFY-V2] Local notification (sanitized):', clean);
}

// Função para inicializar o shim (chamada após importar displayLocalNotification)
export function initCompatibilityShims(displayFn: any) {
  displayLocalNotification = displayFn;
  (globalThis as any).__notifyDisplayLegacy = displayFn;
}
