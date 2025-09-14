// SOLUÇÃO SEGURA - Intercepta notificações sem quebrar o app
// Remove "De [Nome do Site]" de forma segura

console.log('🚀 [SAFE FIX] Inicializando solução segura para notificações...');

// Função para limpar títulos de notificação
function cleanNotificationTitle(title: string): string {
  if (!title) return title;
  
  let clean = title;
  
  // Remover padrões específicos do iOS PWA
  clean = clean.replace(/^De\s+Notify\s+App\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s*/i, '');
  clean = clean.replace(/^De\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+/i, '');
  clean = clean.replace(/^From\s+/i, '');
  
  // Limpar espaços extras
  clean = clean.trim();
  
  if (clean !== title) {
    console.log('🔧 [SAFE FIX] Título limpo:', { original: title, clean: clean });
  }
  
  return clean;
}

// Interceptar window.Notification de forma segura
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    const OriginalNotification = window.Notification;
    
    const SafeNotification = function(title: string, options?: NotificationOptions) {
      const cleanTitle = cleanNotificationTitle(title);
      return new OriginalNotification(cleanTitle, options);
    };
    
    // Preservar propriedades estáticas
    Object.setPrototypeOf(SafeNotification, OriginalNotification);
    Object.defineProperty(SafeNotification, 'permission', { 
      get: () => OriginalNotification.permission 
    });
    Object.defineProperty(SafeNotification, 'requestPermission', { 
      value: OriginalNotification.requestPermission.bind(OriginalNotification) 
    });
    
    // Substituir globalmente
    (window as any).Notification = SafeNotification;
    
    console.log('✅ [SAFE FIX] Window.Notification interceptado com sucesso');
  } catch (error) {
    console.error('❌ [SAFE FIX] Erro ao interceptar Notification:', error);
  }
}

// Interceptar Service Worker de forma segura
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.showNotification) {
        const originalShowNotification = registration.showNotification;
        
        registration.showNotification = (title: string, options?: NotificationOptions) => {
          const cleanTitle = cleanNotificationTitle(title);
          return originalShowNotification.call(registration, cleanTitle, options);
        };
        
        console.log('✅ [SAFE FIX] Service Worker interceptado com sucesso');
      }
    }).catch((error) => {
      console.error('❌ [SAFE FIX] Erro no Service Worker:', error);
    });
  } catch (error) {
    console.error('❌ [SAFE FIX] Erro ao interceptar Service Worker:', error);
  });
}

console.log('✅ [SAFE FIX] Solução segura aplicada com sucesso');

// Exportar função para uso em outros arquivos
export const cleanNotificationTitle = cleanNotificationTitle;
