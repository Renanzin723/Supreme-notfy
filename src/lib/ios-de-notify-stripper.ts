// SOLUÇÃO ESPECÍFICA - Remove "de Notify" que aparece entre título e mensagem
// Intercepta especificamente o padrão que o iOS adiciona

console.log('🚀 [DE NOTIFY STRIPPER] Inicializando remoção específica de "de Notify"...');

// Função para remover "de Notify" de qualquer lugar
function stripDeNotify(text: string): string {
  if (!text) return text;
  
  let clean = text;
  
  // Remover "de Notify" especificamente (o que aparece na imagem)
  clean = clean.replace(/de\s+Notify/gi, '');
  clean = clean.replace(/De\s+Notify/gi, '');
  clean = clean.replace(/DE\s+NOTIFY/gi, '');
  
  // Remover variações
  clean = clean.replace(/de\s+Notify\s+App/gi, '');
  clean = clean.replace(/De\s+Notify\s+App/gi, '');
  clean = clean.replace(/de\s+Nubank/gi, '');
  clean = clean.replace(/De\s+Nubank/gi, '');
  
  // Limpar espaços extras
  clean = clean.trim();
  
  if (clean !== text) {
    console.log('🔧 [DE NOTIFY STRIPPER] Texto limpo:', { original: text, clean: clean });
  }
  
  return clean;
}

// Interceptar window.Notification especificamente para "de Notify"
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    const OriginalNotification = window.Notification;
    
    const DeNotifyStripper = function(title: string, options?: NotificationOptions) {
      const cleanTitle = stripDeNotify(title);
      
      // Também limpar o body se existir
      let cleanOptions = options;
      if (options && options.body) {
        cleanOptions = {
          ...options,
          body: stripDeNotify(options.body)
        };
      }
      
      console.log('🔧 [DE NOTIFY STRIPPER] Notification interceptada:', { 
        original: title, 
        clean: cleanTitle,
        originalBody: options?.body,
        cleanBody: cleanOptions?.body
      });
      
      return new OriginalNotification(cleanTitle, cleanOptions);
    };
    
    // Preservar propriedades estáticas
    Object.setPrototypeOf(DeNotifyStripper, OriginalNotification);
    Object.defineProperty(DeNotifyStripper, 'permission', { 
      get: () => OriginalNotification.permission 
    });
    Object.defineProperty(DeNotifyStripper, 'requestPermission', { 
      value: OriginalNotification.requestPermission.bind(OriginalNotification) 
    });
    
    // Substituir globalmente
    (window as any).Notification = DeNotifyStripper;
    
    console.log('✅ [DE NOTIFY STRIPPER] Window.Notification interceptado para "de Notify"');
  } catch (error) {
    console.error('❌ [DE NOTIFY STRIPPER] Erro ao interceptar Notification:', error);
  }
}

// Interceptar Service Worker especificamente para "de Notify"
if ('serviceWorker' in navigator) {
  try {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.showNotification) {
        const originalShowNotification = registration.showNotification;
        
        registration.showNotification = (title: string, options?: NotificationOptions) => {
          const cleanTitle = stripDeNotify(title);
          
          // Também limpar o body se existir
          let cleanOptions = options;
          if (options && options.body) {
            cleanOptions = {
              ...options,
              body: stripDeNotify(options.body)
            };
          }
          
          console.log('🔧 [DE NOTIFY STRIPPER] SW Notification interceptada:', { 
            original: title, 
            clean: cleanTitle,
            originalBody: options?.body,
            cleanBody: cleanOptions?.body
          });
          
          return originalShowNotification.call(registration, cleanTitle, cleanOptions);
        };
        
        console.log('✅ [DE NOTIFY STRIPPER] Service Worker interceptado para "de Notify"');
      }
    }).catch((error) => {
      console.error('❌ [DE NOTIFY STRIPPER] Erro no Service Worker:', error);
    });
  } catch (error) {
    console.error('❌ [DE NOTIFY STRIPPER] Erro ao interceptar Service Worker:', error);
  }
}

console.log('✅ [DE NOTIFY STRIPPER] Remoção específica de "de Notify" aplicada');

// Exportar função para uso em outros arquivos
export { stripDeNotify };
