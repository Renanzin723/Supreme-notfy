// Sanitizador completo para notificações locais
// Remove subtitle e segunda linha de qualquer notificação

export function sanitizeNotificationInput(input: any = {}) {
  const { subtitle, subTitle, apple_subtitle, from, appName, ...rest } = input || {};
  
  // Remover campos que podem virar "segunda linha" no iOS
  delete rest.subtitle;
  delete rest.subTitle;
  delete rest.apple_subtitle;
  delete rest.from;
  delete rest.appName;
  
  // Limpar título se contém quebra de linha com "de ", "via " ou "from "
  if (typeof rest.title === 'string') {
    rest.title = rest.title
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  // Limpar body se contém quebra de linha com "de ", "via " ou "from "
  if (typeof rest.body === 'string') {
    rest.body = rest.body
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  console.log('🔧 [NOTIFICATION SANITIZER] Input sanitizado:', { original: input, clean: rest });
  return rest;
}

// Sanitizador específico para backend/servidor
export function sanitizeServerPayload(payload: any = {}) {
  const clean = { ...payload };
  
  // Remover campos de subtitle
  delete clean.subtitle;
  delete clean.subTitle;
  delete clean.apple_subtitle;
  delete clean.from;
  delete clean.appName;

  // iOS/APNs via FCM:
  if (clean.apns?.payload?.aps?.alert) {
    delete clean.apns.payload.aps.alert.subtitle; // iOS
  }
  
  // Android/FCM:
  if (clean.android?.notification) {
    delete clean.android.notification.subtitle; // Android (no-op)
  }
  
  // Web Push:
  if (clean.web?.notification) {
    delete clean.web.notification.subtitle;
  }

  // Limpar título se contém quebra de linha com "de ", "via " ou "from "
  if (typeof clean.title === 'string') {
    clean.title = clean.title
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  console.log('🔧 [SERVER SANITIZER] Payload sanitizado:', { original: payload, clean: clean });
  return clean;
}

// Função para limpar títulos especificamente
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
    console.log('🔧 [TITLE CLEANER] Título limpo:', { original: title, clean: clean });
  }
  
  return clean;
}
