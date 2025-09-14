// Solução PERMANENTE para PWA no iOS - Remove "De [Nome do Site]" das notificações
// Esta solução funciona especificamente para Progressive Web Apps no iOS

console.log('🚀 [iOS PWA Fix] Inicializando solução permanente para PWA no iOS...');

// Detectar se é iOS
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
              (window.navigator as any).standalone === true;

console.log('📱 [iOS PWA Fix] Detecção:', { isIOS, isPWA });

if (isIOS && isPWA) {
  console.log('✅ [iOS PWA Fix] PWA iOS detectado - aplicando correção permanente');
  
  // Função para criar notificação limpa
  function createCleanNotification(title: string, options?: NotificationOptions): Notification {
    // Remover qualquer texto "De" que possa estar no título
    let cleanTitle = title;
    
    // Remover padrões comuns que o iOS adiciona
    cleanTitle = cleanTitle.replace(/^De\s+/i, ''); // Remove "De " do início
    cleanTitle = cleanTitle.replace(/\s+De\s+/i, ' '); // Remove " De " do meio
    cleanTitle = cleanTitle.replace(/\s+de\s+/i, ' '); // Remove " de " do meio
    cleanTitle = cleanTitle.trim();
    
    console.log('🔧 [iOS PWA Fix] Título limpo:', { original: title, clean: cleanTitle });
    
    // Criar notificação com título limpo
    return new Notification(cleanTitle, options);
  }
  
  // Interceptar window.Notification
  const OriginalNotification = window.Notification;
  
  const CleanNotification = function(title: string, options?: NotificationOptions) {
    return createCleanNotification(title, options);
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
  
  console.log('✅ [iOS PWA Fix] Window.Notification interceptado e limpo');
  
  // Interceptar Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.showNotification) {
        const originalShowNotification = registration.showNotification;
        
        registration.showNotification = (title: string, options?: NotificationOptions) => {
          // Limpar título
          let cleanTitle = title;
          cleanTitle = cleanTitle.replace(/^De\s+/i, '');
          cleanTitle = cleanTitle.replace(/\s+De\s+/i, ' ');
          cleanTitle = cleanTitle.replace(/\s+de\s+/i, ' ');
          cleanTitle = cleanTitle.trim();
          
          console.log('🔧 [iOS PWA Fix] SW Título limpo:', { original: title, clean: cleanTitle });
          
          return originalShowNotification.call(registration, cleanTitle, options);
        };
        
        console.log('✅ [iOS PWA Fix] Service Worker interceptado e limpo');
      }
    });
  }
  
  // Interceptar push events
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'PUSH_NOTIFICATION') {
        console.log('🔧 [iOS PWA Fix] Push event interceptado:', event.data);
        
        // Limpar dados da notificação
        if (event.data.payload) {
          let cleanTitle = event.data.payload.title || '';
          cleanTitle = cleanTitle.replace(/^De\s+/i, '');
          cleanTitle = cleanTitle.replace(/\s+De\s+/i, ' ');
          cleanTitle = cleanTitle.replace(/\s+de\s+/i, ' ');
          cleanTitle = cleanTitle.trim();
          
          event.data.payload.title = cleanTitle;
          console.log('🔧 [iOS PWA Fix] Push payload limpo:', event.data.payload);
        }
      }
    });
  }
  
  console.log('✅ [iOS PWA Fix] Solução permanente aplicada com sucesso');
  
} else {
  console.log('ℹ️ [iOS PWA Fix] Não é PWA iOS - correção não aplicada');
}

// Exportar função para uso em outros arquivos
export const cleanNotificationTitle = (title: string): string => {
  let clean = title;
  clean = clean.replace(/^De\s+/i, '');
  clean = clean.replace(/\s+De\s+/i, ' ');
  clean = clean.replace(/\s+de\s+/i, ' ');
  return clean.trim();
};
