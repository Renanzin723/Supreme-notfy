// SOLUÇÃO DEFINITIVA - Remove "de Notify" das notificações iOS
// Intercepta e limpa especificamente o padrão "de Notify"

console.log('🚀 [ULTIMATE FIX] Inicializando solução definitiva para "de Notify"...');

// Função para limpar títulos de notificação
function cleanNotificationTitle(title: string): string {
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
    console.log('🔧 [ULTIMATE FIX] Título limpo:', { original: title, clean: clean });
  }
  
  return clean;
}

// Interceptar window.Notification de forma definitiva
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    const OriginalNotification = window.Notification;
    
    const UltimateNotification = function(title: string, options?: NotificationOptions) {
      const cleanTitle = cleanNotificationTitle(title);
      
      console.log('🔧 [ULTIMATE FIX] Notification interceptada:', { 
        original: title, 
        clean: cleanTitle 
      });
      
      return new OriginalNotification(cleanTitle, options);
    };
    
    // Preservar propriedades estáticas
    Object.setPrototypeOf(UltimateNotification, OriginalNotification);
    Object.defineProperty(UltimateNotification, 'permission', { 
      get: () => OriginalNotification.permission 
    });
    Object.defineProperty(UltimateNotification, 'requestPermission', { 
      value: OriginalNotification.requestPermission.bind(OriginalNotification) 
    });
    
    // Substituir globalmente
    (window as any).Notification = UltimateNotification;
    
    console.log('✅ [ULTIMATE FIX] Window.Notification interceptado definitivamente');
  } catch (error) {
    console.error('❌ [ULTIMATE FIX] Erro ao interceptar Notification:', error);
  }
}

// Interceptar Service Worker de forma definitiva
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.showNotification) {
        const originalShowNotification = registration.showNotification;
        
        registration.showNotification = (title: string, options?: NotificationOptions) => {
          const cleanTitle = cleanNotificationTitle(title);
          
          console.log('🔧 [ULTIMATE FIX] SW Notification interceptada:', { 
            original: title, 
            clean: cleanTitle 
          });
          
          return originalShowNotification.call(registration, cleanTitle, options);
        };
        
        console.log('✅ [ULTIMATE FIX] Service Worker interceptado definitivamente');
      }
    }).catch((error) => {
      console.error('❌ [ULTIMATE FIX] Erro no Service Worker:', error);
    });
  } catch (error) {
    console.error('❌ [ULTIMATE FIX] Erro ao interceptar Service Worker:', error);
  }
}

// Interceptar push events de forma definitiva
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
        console.log('🔧 [ULTIMATE FIX] Push event interceptado:', event.data);
        
        if (event.data.payload && event.data.payload.title) {
          event.data.payload.title = cleanNotificationTitle(event.data.payload.title);
          console.log('🔧 [ULTIMATE FIX] Push payload limpo:', event.data.payload);
        }
      }
    });
  } catch (error) {
    console.error('❌ [ULTIMATE FIX] Erro ao interceptar push events:', error);
  }
}

console.log('✅ [ULTIMATE FIX] Solução definitiva aplicada com sucesso');

// Exportar função para uso em outros arquivos
export const cleanNotificationTitle = cleanNotificationTitle;
