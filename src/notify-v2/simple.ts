// Versão simplificada do notify-v2 para evitar problemas
console.log('🔔 [NOTIFY-V2] Carregando versão simplificada...');

// Função de sanitização simples
export function sanitizeNotificationInput(input: any = {}) {
  const { subtitle, subTitle, apple_subtitle, from, appName, ...rest } = input || {};
  
  // Remover campos de subtitle
  delete (rest as any).subtitle;
  delete (rest as any).subTitle;
  delete (rest as any).apple_subtitle;
  delete (rest as any).from;
  delete (rest as any).appName;

  // Limpar título se contém quebra de linha
  if (typeof rest.title === 'string') {
    rest.title = rest.title
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  // Limpar body se contém quebra de linha
  if (typeof rest.body === 'string') {
    rest.body = rest.body
      .split('\n')
      .filter((ln: string, i: number) => i === 0 || !/^\s*(de|via|from)\s+/i.test(ln))
      .join('\n');
  }
  
  console.log('🔧 [NOTIFY-V2] Input sanitizado:', { original: input, clean: rest });
  return rest;
}

// Função de exibição simples
export async function displayLocalNotification(raw: any) {
  try {
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
      
      // Garantir que não passe subtitle nas options
      delete (opts as any).subtitle;
      delete (opts as any).subTitle;
      delete (opts as any).apple_subtitle;
      delete (opts as any).from;
      delete (opts as any).appName;
      
      console.log('🔔 [NOTIFY-V2] Exibindo notificação local:', { title, opts });
      new Notification(title, opts as NotificationOptions);
    }
  } catch (error) {
    console.error('❌ [NOTIFY-V2] Erro ao exibir notificação:', error);
  }
}

// Shim global para compatibilidade
(globalThis as any).__notifyDisplayLegacy = displayLocalNotification;

console.log('🔔 [NOTIFY-V2] Versão simplificada carregada com sucesso');
