import { sanitizeNotificationPayload } from './sanitize';

export function sanitizeServerPayload(payload: any = {}) {
  const clean = sanitizeNotificationPayload(payload);

  // APNs direto ou via FCM
  clean.apns = clean.apns || { payload: { aps: { alert: {} } } };
  clean.apns.payload = clean.apns.payload || { aps: { alert: {} } };
  clean.apns.payload.aps = clean.apns.payload.aps || { alert: {} };
  clean.apns.payload.aps.alert = clean.apns.payload.aps.alert || {};
  clean.apns.payload.aps.alert.subtitle = '\u200B'; // 🔒

  // Android: ignorará esse campo
  if (clean.android?.notification) {
    delete clean.android.notification.subtitle;
  }

  console.log('🔧 [NOTIFY BACKEND] Payload do servidor sanitizado com subtitle invisível:', { original: payload, clean: clean });
  return clean;
}
