// SOLUÇÃO DEFINITIVA - Intercepta TODAS as notificações do projeto
// Remove "De [Nome do Site]" de qualquer notificação criada

console.log('🚀 [DEFINITIVE FIX] Inicializando solução definitiva para notificações...');

// Função para limpar títulos de notificação
function cleanNotificationTitle(title: string): string {
  if (!title) return title;
  
  let clean = title;
  
  // Remover todos os padrões possíveis de "De [Nome]"
  clean = clean.replace(/^De\s+/i, ''); // Remove "De " do início
  clean = clean.replace(/\s+De\s+/i, ' '); // Remove " De " do meio
  clean = clean.replace(/\s+de\s+/i, ' '); // Remove " de " do meio
  clean = clean.replace(/^From\s+/i, ''); // Remove "From " do início
  clean = clean.replace(/\s+From\s+/i, ' '); // Remove " From " do meio
  
  // Remover padrões específicos do iOS PWA
  clean = clean.replace(/^De\s+Notify\s+App\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s+Notify\s*/i, '');
  clean = clean.replace(/^De\s+Nubank\s*/i, '');
  clean = clean.replace(/^De\s+Notify\s*/i, '');
  
  // Limpar espaços extras
  clean = clean.trim();
  
  console.log('🔧 [DEFINITIVE FIX] Título limpo:', { original: title, clean: clean });
  return clean;
}

// Interceptar window.Notification globalmente
if (typeof window !== 'undefined' && 'Notification' in window) {
  const OriginalNotification = window.Notification;
  
  const CleanNotification = function(title: string, options?: NotificationOptions) {
    const cleanTitle = cleanNotificationTitle(title);
    
    console.log('🔧 [DEFINITIVE FIX] Notification interceptada:', { 
      original: title, 
      clean: cleanTitle 
    });
    
    return new OriginalNotification(cleanTitle, options);
  };
  
  // Preservar propriedades estáticas
  Object.setPrototypeOf(CleanNotification, OriginalNotification);
  Object.defineProperty(CleanNotification, 'permission', { 
    get: () => OriginalNotification.permission 
  });
  Object.defineProperty(CleanNotification, 'requestPermission', { 
    value: OriginalNotification.requestPermission.bind(OriginalNotification) 
  });
  
  // Substituir globalmente
  (window as any).Notification = CleanNotification;
  
  console.log('✅ [DEFINITIVE FIX] Window.Notification interceptado globalmente');
}

// Interceptar Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.ready.then((registration) => {
    if (registration.showNotification) {
      const originalShowNotification = registration.showNotification;
      
      registration.showNotification = (title: string, options?: NotificationOptions) => {
        const cleanTitle = cleanNotificationTitle(title);
        
        console.log('🔧 [DEFINITIVE FIX] SW Notification interceptada:', { 
          original: title, 
          clean: cleanTitle 
        });
        
        return originalShowNotification.call(registration, cleanTitle, options);
      };
      
      console.log('✅ [DEFINITIVE FIX] Service Worker interceptado');
    }
  });
}

// Interceptar push events
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
      console.log('🔧 [DEFINITIVE FIX] Push event interceptado:', event.data);
      
      if (event.data.payload && event.data.payload.title) {
        event.data.payload.title = cleanNotificationTitle(event.data.payload.title);
        console.log('🔧 [DEFINITIVE FIX] Push payload limpo:', event.data.payload);
      }
    }
  });
}

// Interceptar push events no Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
      console.log('🔧 [DEFINITIVE FIX] SW Show notification interceptado:', event.data);
      
      if (event.data.title) {
        event.data.title = cleanNotificationTitle(event.data.title);
        console.log('🔧 [DEFINITIVE FIX] SW notification title limpo:', event.data.title);
      }
    }
  });
}

// Interceptação de console.log removida para evitar loops infinitos

console.log('✅ [DEFINITIVE FIX] Solução definitiva aplicada com sucesso');

// Exportar função para uso em outros arquivos
export const cleanNotificationTitle = cleanNotificationTitle;
