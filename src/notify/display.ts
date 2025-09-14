import { sanitizeNotificationPayload } from './sanitize';

export async function displayLocalNotification(raw: any) {
  const p = sanitizeNotificationPayload(raw);
  const { title = 'Notificação', subtitle, ...opts } = p;

  // garantir subtitle invisível também no Browser API
  // @ts-ignore
  (opts as any).subtitle = '\u200B';
  delete (opts as any).subTitle;
  delete (opts as any).apple_subtitle;

  if ('Notification' in globalThis) {
    if (Notification.permission !== 'granted') {
      try { 
        await Notification.requestPermission(); 
      } catch (error) {
        console.error('❌ [NOTIFY DISPLAY] Erro ao solicitar permissão:', error);
      }
    }
    
    new Notification(title, opts as NotificationOptions);
  }
}
