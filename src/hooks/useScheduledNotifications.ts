import { useEffect, useRef } from 'react';

interface ScheduledNotification {
  id: string;
  title: string;
  body: string;
  delay: number;
  icon?: string;
  data?: any;
}

export const useScheduledNotifications = () => {
  const serviceWorkerRef = useRef<ServiceWorker | null>(null);
  const scheduledNotificationsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  useEffect(() => {
    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registrado:', registration);
          serviceWorkerRef.current = registration.active;
        })
        .catch(error => {
          console.error('Erro ao registrar Service Worker:', error);
        });
    }

    // Solicitar permissão para notificações
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Permissão de notificação:', permission);
      });
    }

    return () => {
      // Limpar notificações agendadas ao desmontar
      scheduledNotificationsRef.current.forEach(timeout => {
        clearTimeout(timeout);
      });
      scheduledNotificationsRef.current.clear();
    };
  }, []);

  const scheduleNotification = (notification: ScheduledNotification) => {
    if (!serviceWorkerRef.current) {
      console.error('❌ Service Worker não disponível');
      return false;
    }

    console.log(`📅 Agendando notificação: ${notification.title} em ${notification.delay}ms`);

    // Enviar diretamente para Service Worker (ele que vai gerenciar o timeout)
    serviceWorkerRef.current.postMessage({
      type: 'SCHEDULE_NOTIFICATION',
      id: notification.id,
      title: notification.title,
      body: notification.body,
      delay: notification.delay,
      icon: notification.icon,
      data: notification.data
    });
    
    console.log(`✅ Notificação enviada para Service Worker: ${notification.id}`);
    return true;
  };

  const cancelNotification = (id: string) => {
    if (!serviceWorkerRef.current) {
      console.error('❌ Service Worker não disponível');
      return false;
    }

    console.log(`❌ Cancelando notificação: ${id}`);
    
    // Cancelar no Service Worker
    serviceWorkerRef.current.postMessage({
      type: 'CANCEL_NOTIFICATION',
      id: id
    });
    
    return true;
  };

  const cancelAllNotifications = () => {
    if (!serviceWorkerRef.current) {
      console.error('❌ Service Worker não disponível');
      return;
    }

    console.log('❌ Cancelando todas as notificações');
    
    // Cancelar todas no Service Worker
    serviceWorkerRef.current.postMessage({
      type: 'CANCEL_ALL_NOTIFICATIONS'
    });
  };

  return {
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
    isServiceWorkerReady: !!serviceWorkerRef.current
  };
};
