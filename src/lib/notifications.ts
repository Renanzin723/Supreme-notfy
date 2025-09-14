// Notification utilities and service worker registration
import { capacitorNotificationService } from './capacitor-notifications';
import { Capacitor } from '@capacitor/core';
import { cleanNotificationTitle, sanitizeNotificationInput } from './notification-sanitizer';

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  data?: any;
  actions?: NotificationAction[];
  requireInteraction?: boolean;
  silent?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class NotificationService {
  private registration: ServiceWorkerRegistration | null = null;

  async init(): Promise<boolean> {
    // Initialize Capacitor notifications first (for native platforms)
    if (Capacitor.isNativePlatform()) {
      console.log('Initializing native notifications with Capacitor');
      const capacitorInitialized = await capacitorNotificationService.initialize();
      if (capacitorInitialized) {
        console.log('Capacitor notifications initialized successfully');
        return true;
      }
    }

    // Fallback to web notifications
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Workers não são suportados neste navegador');
      return false;
    }

    if (!('Notification' in window)) {
      console.warn('Notificações não são suportadas neste navegador');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado com sucesso:', this.registration);

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready;
      
      return true;
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notificações não são suportadas');
    }

    const permission = await Notification.requestPermission();
    console.log('Permissão de notificação:', permission);
    
    return permission;
  }

  async showNotification(payload: NotificationPayload): Promise<void> {
    if (Notification.permission !== 'granted') {
      throw new Error('Permissão de notificação não concedida');
    }

    // Sanitizar payload para remover campos que podem virar "segunda linha" no iOS
    const cleanPayload = sanitizeNotificationInput(payload);

    if (this.registration) {
      // Use service worker for better control (supports actions)
      const notificationOptions: any = {
        body: cleanPayload.body,
        icon: cleanPayload.icon || '/placeholder.svg',
        badge: cleanPayload.badge || '/placeholder.svg',
        tag: cleanPayload.tag,
        data: cleanPayload.data,
        requireInteraction: cleanPayload.requireInteraction,
        silent: cleanPayload.silent,
      };

      // Add actions if provided (ServiceWorker supports this)
      if (cleanPayload.actions && cleanPayload.actions.length > 0) {
        notificationOptions.actions = cleanPayload.actions;
      }

      // Limpar título usando função importada
      const cleanTitle = cleanNotificationTitle(cleanPayload.title);
      
      await this.registration.showNotification(cleanTitle, notificationOptions);
    } else {
      // Fallback to basic notification (no actions support)
      // Limpar título usando função importada
      const cleanTitle = cleanNotificationTitle(cleanPayload.title);
      
      new Notification(cleanTitle, {
        body: cleanPayload.body,
        icon: cleanPayload.icon || '/placeholder.svg',
        tag: cleanPayload.tag,
        data: cleanPayload.data,
        requireInteraction: cleanPayload.requireInteraction,
        silent: cleanPayload.silent,
      });
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    return await this.registration.pushManager.getSubscription();
  }

  async subscribe(vapidKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      throw new Error('Service Worker não registrado');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidKey)
      });

      console.log('Push subscription:', subscription);
      return subscription;
    } catch (error) {
      console.error('Erro ao criar subscription:', error);
      return null;
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Simulate backend API calls
  async registerDevice(token: string, platform: string = 'web'): Promise<{ success: boolean; deviceId: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const deviceId = `device_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Device registered:', { deviceId, token, platform });
    
    return { success: true, deviceId };
  }

  async sendPushNotification(deviceId: string, payload: NotificationPayload): Promise<{ success: boolean; messageId: string }> {
    // Sanitizar payload antes de enviar
    const cleanPayload = sanitizeNotificationInput(payload);
    
    // Use Capacitor for native platforms
    if (Capacitor.isNativePlatform()) {
      await capacitorNotificationService.showLocalNotification({
        title: cleanPayload.title,
        body: cleanPayload.body,
        id: Date.now(),
        data: cleanPayload.data
      });
      
      const messageId = `msg_${Math.random().toString(36).substr(2, 9)}`;
      return { success: true, messageId };
    }

    // Simulate API call delay for web
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const messageId = `msg_${Math.random().toString(36).substr(2, 9)}`;
    console.log('Push notification sent (sanitized):', { deviceId, payload: cleanPayload, messageId });
    
    // Simulate showing the notification after a short delay
    setTimeout(() => {
      this.showNotification(cleanPayload);
    }, 2000);
    
    return { success: true, messageId };
  }

  async startSequence(
    deviceId: string, 
    payload: NotificationPayload, 
    config: { delay: number; interval: number; quantity: number }
  ): Promise<{ success: boolean; sequenceId: string }> {
    const sequenceId = `seq_${Math.random().toString(36).substr(2, 9)}`;
    
    // Sanitizar payload antes de iniciar sequência
    const cleanPayload = sanitizeNotificationInput(payload);
    
    console.log('Starting sequence (sanitized):', { deviceId, payload: cleanPayload, config, sequenceId });
    
    // Use Capacitor for native platforms
    if (Capacitor.isNativePlatform()) {
      return await capacitorNotificationService.scheduleNotificationSequence({
        title: cleanPayload.title,
        body: cleanPayload.body,
        delay: config.delay,
        interval: config.interval,
        quantity: config.quantity
      });
    }

    // Simulate sequence execution for web
    let count = 0;
    const execute = () => {
      if (count < config.quantity) {
        const sequencedPayload = {
          ...cleanPayload,
          title: cleanPayload.title,
          data: { ...cleanPayload.data, sequenceId, step: count + 1 }
        };
        
        this.showNotification(sequencedPayload);
        count++;
        
        if (count < config.quantity) {
          setTimeout(execute, config.interval);
        }
      }
    };
    
    setTimeout(execute, config.delay);
    
    return { success: true, sequenceId };
  }
}

export const notificationService = new NotificationService();