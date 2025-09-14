import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Registrar Service Worker para notificações em background
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    })
    .then(registration => {
      console.log('✅ Service Worker registrado para notificações em background');
      console.log('📱 Scope:', registration.scope);
      
      // Verificar se há atualizações
      registration.addEventListener('updatefound', () => {
        console.log('🔄 Nova versão do Service Worker encontrada');
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('🆕 Nova versão instalada, recarregando...');
              window.location.reload();
            }
          });
        }
      });
    })
    .catch(error => {
      console.error('❌ Erro ao registrar Service Worker:', error);
    });
  });
} else {
  console.warn('⚠️ Service Worker não suportado neste navegador');
}

createRoot(document.getElementById("root")!).render(<App />);
