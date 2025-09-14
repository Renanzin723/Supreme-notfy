// Função para sanitizar payload de notificações
// Remove campos que podem virar "segunda linha" no iOS

export function sanitizePayloadForAllPlatforms(payload: any = {}) {
  const { 
    subtitle, 
    apple_subtitle, 
    from, 
    appName, 
    ...clean 
  } = payload;
  
  // Garante que nada parecido com subtitle passe adiante
  delete clean.subtitle; 
  delete clean.apple_subtitle;
  delete clean.from; 
  delete clean.appName;

  // iOS/APNs via FCM:
  if (clean.apns?.payload?.aps?.alert) {
    delete clean.apns.payload.aps.alert.subtitle;
  }
  
  // Android/FCM:
  if (clean.android?.notification) {
    delete clean.android.notification.subtitle;
  }
  
  // Web Push:
  if (clean.web?.notification) {
    delete clean.web.notification.subtitle;
  }
  
  console.log('🔧 [PAYLOAD SANITIZER] Payload sanitizado:', { 
    original: payload, 
    clean: clean 
  });
  
  return clean;
}

// Função específica para iOS
export function sanitizePayloadForIOS(payload: any = {}) {
  const clean = sanitizePayloadForAllPlatforms(payload);
  
  // Remover especificamente campos do iOS
  if (clean.apns) {
    if (clean.apns.payload?.aps?.alert) {
      delete clean.apns.payload.aps.alert.subtitle;
      delete clean.apns.payload.aps.alert.title;
    }
  }
  
  return clean;
}

// Função para limpar títulos
export function cleanNotificationTitle(title: string): string {
  if (!title) return title;
  
  let clean = title;
  
  // Remover especificamente "de Notify" e variações
  clean = clean.replace(/^de\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+Notify\s*/i, '');
  clean = clean.replace(/^DE\s+NOTIFY\s*/i, '');
  clean = clean.replace(/\s+de\s+Notify\s*/i, ' ');
  clean = clean.replace(/\s+De\s+Notify\s*/i, ' ');
  clean = clean.replace(/\s+DE\s+NOTIFY\s*/i, ' ');
  
  // Remover outros padrões comuns
  clean = clean.replace(/^de\s+Notify\s+App\s*/i, '');
  clean = clean.replace(/^De\s+Notify\s+App\s*/i, '');
  clean = clean.replace(/^de\s+Nubank\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s*/i, '');
  clean = clean.replace(/^From\s+Notify\s*/i, '');
  clean = clean.replace(/^from\s+Notify\s*/i, '');
  
  // Limpar espaços extras
  clean = clean.trim();
  
  if (clean !== title) {
    console.log('🔧 [PAYLOAD SANITIZER] Título limpo:', { original: title, clean: clean });
  }
  
  return clean;
}
