import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { sanitizeNotificationInput } from './notification-sanitizer';

export class CapacitorNotificationService {
  private isNative = Capacitor.isNativePlatform();

  async initialize() {
    if (!this.isNative) {
      console.log('Running in web mode, skipping native notification setup');
      return false;
    }

    try {
      // Request permissions
      await this.requestPermissions();
      
      // Register for push notifications
      await this.registerPushNotifications();
      
      // Setup listeners
      this.setupListeners();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Capacitor notifications:', error);
      return false;
    }
  }

  private async requestPermissions() {
    // Request push notification permissions
    const pushResult = await PushNotifications.requestPermissions();
    console.log('Push notification permission status:', pushResult.receive);

    // Request local notification permissions
    const localResult = await LocalNotifications.requestPermissions();
    console.log('Local notification permission status:', localResult.display);

    return {
      push: pushResult.receive === 'granted',
      local: localResult.display === 'granted'
    };
  }

  private async registerPushNotifications() {
    await PushNotifications.register();
    console.log('Registered for push notifications');
  }

  private setupListeners() {
    // Listen for registration
    PushNotifications.addListener('registration', (token) => {
      console.log('Push registration success, token: ' + token.value);
      // Store token for later use
      localStorage.setItem('fcm_token', token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration: ' + JSON.stringify(error));
    });

    // Listen for push notifications received
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received: ', notification);
      
      // Show local notification when app is in foreground
      this.showLocalNotification({
        title: notification.title || 'Nova Notificação',
        body: notification.body || 'Você tem uma nova mensagem',
        id: Date.now()
      });
    });

    // Listen for push notification actions
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed: ', notification);
      // Handle notification tap
    });

    // Listen for local notification actions
    LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
      console.log('Local notification action performed: ', notification);
    });
  }

  async showLocalNotification(options: {
    title: string;
    body: string;
    id: number;
    data?: any;
  }) {
    if (!this.isNative) {
      console.log('Cannot show local notification in web mode');
      return;
    }

    try {
      // Sanitizar input para remover subtitle
      const cleanOptions = sanitizeNotificationInput(options);
      
      await LocalNotifications.schedule({
        notifications: [
          {
            title: cleanOptions.title,
            body: cleanOptions.body,
            id: cleanOptions.id,
            schedule: { at: new Date(Date.now() + 1000) },
            sound: 'default',
            attachments: undefined,
            actionTypeId: "",
            extra: cleanOptions.data || {}
          }
        ]
      });
      
      console.log('Local notification scheduled successfully (sanitized)');
    } catch (error) {
      console.error('Error scheduling local notification:', error);
    }
  }

  async scheduleNotificationSequence(options: {
    title: string;
    body: string;
    delay: number;
    interval: number;
    quantity: number;
  }) {
    if (!this.isNative) {
      console.log('Cannot schedule notification sequence in web mode');
      return;
    }

    // Sanitizar input para remover subtitle
    const cleanOptions = sanitizeNotificationInput(options);
    
    const notifications = [];
    for (let i = 0; i < cleanOptions.quantity; i++) {
      const scheduleTime = new Date(Date.now() + cleanOptions.delay + (i * cleanOptions.interval));
      notifications.push({
        title: cleanOptions.title,
        body: cleanOptions.body,
        id: Date.now() + i,
        schedule: { at: scheduleTime },
        sound: 'default',
        attachments: undefined,
        actionTypeId: "",
        extra: { sequence: true, index: i + 1 }
      });
    }

    try {
      await LocalNotifications.schedule({ notifications });
      console.log(`Scheduled ${options.quantity} notifications`);
      return { success: true, sequenceId: `seq_${Date.now()}` };
    } catch (error) {
      console.error('Error scheduling notification sequence:', error);
      throw error;
    }
  }

  async cancelAllNotifications() {
    if (!this.isNative) return;
    
    try {
      await LocalNotifications.cancel({
        notifications: await LocalNotifications.getPending().then(result => 
          result.notifications.map(n => ({ id: n.id }))
        )
      });
      console.log('All pending notifications cancelled');
    } catch (error) {
      console.error('Error cancelling notifications:', error);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('fcm_token');
  }

  isNativePlatform(): boolean {
    return this.isNative;
  }
}

export const capacitorNotificationService = new CapacitorNotificationService();