import React, { useState, useEffect } from 'react';
import { Bell, Settings, Send, Play, Square, Smartphone, CheckCircle, XCircle, Volume2, Vibrate } from 'lucide-react';
import supremeNotifyLogo from '@/assets/supreme-notify-logo.png';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { notificationService, type NotificationPayload } from '@/lib/notifications';
import { useScheduledNotifications } from '@/hooks/useScheduledNotifications';
import NotificationPreview from '@/components/NotificationPreview';
import NotificationExamples from '@/components/NotificationExamples';
import ThemeToggle from '@/components/ThemeToggle';
import DeviceInfoCard from '@/components/DeviceInfoCard';

interface NotificationConfig {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  sound: string;
  vibrationPattern: string;
  channel: string;
  actions: Array<{ action: string; title: string }>;
  deepLink?: string;
  badge: number;
  tag?: string;
  threadId?: string;
}

interface DeviceStatus {
  permission: 'granted' | 'denied' | 'default';
  token: string | null;
  isOnline: boolean;
}

const NotificationDashboard: React.FC = () => {
  const { toast } = useToast();
  const { scheduleNotification, cancelNotification, cancelAllNotifications, isServiceWorkerReady } = useScheduledNotifications();
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    permission: 'default',
    token: null,
    isOnline: navigator.onLine
  });

  const [config, setConfig] = useState<NotificationConfig>({
    title: '',
    body: '',
    icon: '/supreme-notify-logo.png',
    sound: 'default',
    vibrationPattern: '200,100,200',
    channel: 'default',
    actions: [{ action: 'view', title: 'Ver' }, { action: 'dismiss', title: 'Dispensar' }],
    badge: 1,
  });

  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [sequenceConfig, setSequenceConfig] = useState({
    delay: 5000,
    interval: 30000,
    quantity: 3
  });

  useEffect(() => {
    checkNotificationPermission();
    initializeNotificationService();
    
    const handleOnline = () => setDeviceStatus(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setDeviceStatus(prev => ({ ...prev, isOnline: false }));
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const initializeNotificationService = async () => {
    try {
      const initialized = await notificationService.init();
      if (initialized) {
        console.log('Notification service initialized successfully');
        
        // Check if we're on a native platform
        if ((window as any).Capacitor?.isNativePlatform?.()) {
          toast({
            title: "App Nativo Detectado",
            description: "Notificações em segundo plano habilitadas!",
          });
        }
      }
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
    }
  };

  const checkNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = Notification.permission;
      setDeviceStatus(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        // Simulate token generation
        const mockToken = 'fcm_' + Math.random().toString(36).substr(2, 9);
        setDeviceStatus(prev => ({ ...prev, token: mockToken }));
      }
    }
  };

  const requestPermission = async () => {
    try {
      const permission = await notificationService.requestPermission();
      setDeviceStatus(prev => ({ ...prev, permission }));
      
      if (permission === 'granted') {
        const mockToken = 'fcm_' + Math.random().toString(36).substr(2, 9);
        setDeviceStatus(prev => ({ ...prev, token: mockToken }));
        
        toast({
          title: "Permissão concedida",
          description: "Notificações foram habilitadas com sucesso!",
        });
      } else {
        toast({
          title: "Permissão negada",
          description: "As notificações foram bloqueadas.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao solicitar permissão:', error);
      toast({
        title: "Erro",
        description: "Erro ao solicitar permissão de notificação.",
        variant: "destructive",
      });
    }
  };

  const showLocalPreview = async () => {
    if (deviceStatus.permission === 'granted' && config.title && config.body) {
      try {
        const payload: NotificationPayload = {
          title: config.title,
          body: config.body,
          icon: config.icon,
          tag: config.tag,
          actions: config.actions,
          data: { source: 'preview' },
        };
        
        await notificationService.showNotification(payload);
        
        toast({
          title: "Prévia enviada",
          description: "Notificação local exibida com sucesso!",
        });
      } catch (error) {
        console.error('Erro na prévia:', error);
        toast({
          title: "Erro na prévia",
          description: "Erro ao exibir notificação local.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Dados incompletos",
        description: "Verifique as permissões e preencha título e mensagem.",
        variant: "destructive",
      });
    }
  };

  const sendPushNotification = async () => {
    if (!deviceStatus.token || !config.title || !config.body) {
      toast({
        title: "Dados incompletos",
        description: "Preencha título, mensagem e verifique o token.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: NotificationPayload = {
        title: config.title,
        body: config.body,
        icon: config.icon,
        tag: config.tag,
        actions: config.actions,
        data: { 
          source: 'push',
          deepLink: config.deepLink 
        },
      };

      const result = await notificationService.sendPushNotification(deviceStatus.token, payload);
      
      toast({
        title: "Push enviado",
        description: `Notificação enviada! ID: ${result.messageId}`,
      });
    } catch (error) {
      console.error('Erro ao enviar push:', error);
      toast({
        title: "Erro no envio",
        description: "Falha ao enviar notificação push.",
        variant: "destructive",
      });
    }
  };

  const testScheduledNotification = () => {
    if (!config.title || !config.body) {
      toast({
        title: "Dados incompletos",
        description: "Preencha título e mensagem para agendar notificação.",
        variant: "destructive",
      });
      return;
    }

    if (!isServiceWorkerReady) {
      toast({
        title: "Service Worker não disponível",
        description: "Aguarde o Service Worker carregar para agendar notificações.",
        variant: "destructive",
      });
      return;
    }

    // Agendar notificação para 10 segundos
    const success = scheduleNotification({
      id: `test-${Date.now()}`,
      title: config.title,
      body: config.body,
      delay: 10000, // 10 segundos
      icon: config.icon || '/favicon.ico',
      data: { source: 'scheduled-test' }
    });

    if (success) {
      toast({
        title: "Notificação agendada",
        description: "Notificação será exibida em 10 segundos, mesmo com app minimizado ou tela bloqueada!",
      });
    } else {
      toast({
        title: "Erro ao agendar",
        description: "Falha ao agendar notificação programada.",
        variant: "destructive",
      });
    }
  };

  const testLockedScreenNotification = () => {
    if (!config.title || !config.body) {
      toast({
        title: "Dados incompletos",
        description: "Preencha título e mensagem para agendar notificação.",
        variant: "destructive",
      });
      return;
    }

    if (!isServiceWorkerReady) {
      toast({
        title: "Service Worker não disponível",
        description: "Aguarde o Service Worker carregar para agendar notificações.",
        variant: "destructive",
      });
      return;
    }

    // Agendar notificação para 15 segundos
    const success = scheduleNotification({
      id: `locked-test-${Date.now()}`,
      title: config.title,
      body: config.body,
      delay: 15000, // 15 segundos
      icon: config.icon || '/favicon.ico',
      data: { source: 'locked-screen-test' }
    });

    if (success) {
      toast({
        title: "Teste de tela bloqueada",
        description: "Bloqueie a tela e aguarde 15 segundos. A notificação deve aparecer mesmo com tela bloqueada!",
      });
    } else {
      toast({
        title: "Erro ao agendar",
        description: "Falha ao agendar notificação programada.",
        variant: "destructive",
      });
    }
  };

  const startSequence = async () => {
    if (!deviceStatus.token || !config.title || !config.body) {
      toast({
        title: "Dados incompletos",
        description: "Preencha os dados antes de iniciar a sequência.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSequenceActive(true);
      
      const payload: NotificationPayload = {
        title: config.title,
        body: config.body,
        icon: config.icon,
        tag: config.tag,
        actions: config.actions,
        data: { 
          source: 'sequence',
          deepLink: config.deepLink 
        },
      };

      const result = await notificationService.startSequence(
        deviceStatus.token,
        payload,
        sequenceConfig
      );
      
      toast({
        title: "Sequência iniciada",
        description: `${sequenceConfig.quantity} notificações programadas. ID: ${result.sequenceId}`,
      });
      
      // Auto-stop sequence after completion
      setTimeout(() => {
        setIsSequenceActive(false);
        toast({
          title: "Sequência concluída",
          description: "Todas as notificações foram enviadas",
        });
      }, sequenceConfig.delay + (sequenceConfig.interval * sequenceConfig.quantity));
      
    } catch (error) {
      console.error('Erro na sequência:', error);
      setIsSequenceActive(false);
      toast({
        title: "Erro na sequência",
        description: "Falha ao iniciar sequência de notificações.",
        variant: "destructive",
      });
    }
  };

  const stopSequence = () => {
    setIsSequenceActive(false);
    toast({
      title: "Sequência interrompida",
      description: "O envio programado foi cancelado",
      variant: "destructive",
    });
  };

  const copyToken = () => {
    if (deviceStatus.token) {
      navigator.clipboard.writeText(deviceStatus.token);
      toast({
        title: "Token copiado",
        description: "Token FCM copiado para a área de transferência",
      });
    }
  };

  const handleExampleSelect = (examplePayload: any) => {
    setConfig(prev => ({
      ...prev,
      ...examplePayload,
    }));
    
    toast({
      title: "Exemplo carregado",
      description: "Configuração atualizada com o exemplo selecionado",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 relative">
          {/* Theme Toggle Button */}
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl mb-4 shadow-2xl overflow-hidden relative">
            {/* Efeito de brilho */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent rounded-3xl"></div>
            
            {/* Logo de alta qualidade */}
            <div className="relative w-14 h-14">
              {/* Sino principal */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-10 h-10">
                {/* Corpo do sino com gradiente premium */}
                <div className="w-full h-full bg-gradient-to-b from-amber-400 via-yellow-500 to-amber-600 rounded-full shadow-lg relative overflow-hidden">
                  {/* Brilho interno */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gradient-to-b from-white/30 to-transparent rounded-full"></div>
                  
                  {/* Detalhes do sino */}
                  <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-amber-700 rounded-full shadow-sm"></div>
                  <div className="absolute top-2.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-800 rounded-full"></div>
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-800 rounded-full"></div>
                  <div className="absolute top-5.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-amber-800 rounded-full"></div>
                  
                  {/* Linha decorativa */}
                  <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-amber-700/50 rounded-full"></div>
                </div>
                
                {/* Badalo do sino */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-3 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-md"></div>
                
                {/* Alça do sino */}
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-b from-amber-500 to-amber-700 rounded-full"></div>
              </div>
              
              {/* Ondas sonoras premium */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2">
                <div className="w-3 h-3 border-2 border-white/80 rounded-full animate-ping"></div>
                <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white/60 rounded-full animate-ping" style={{animationDelay: '0.3s'}}></div>
                <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white/40 rounded-full animate-ping" style={{animationDelay: '0.6s'}}></div>
                <div className="absolute top-0 left-0 w-3 h-3 border-2 border-white/20 rounded-full animate-ping" style={{animationDelay: '0.9s'}}></div>
              </div>
              
              {/* Partículas de som */}
              <div className="absolute top-1 right-1 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
              <div className="absolute top-3 right-0 w-0.5 h-0.5 bg-white/40 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
              <div className="absolute top-5 right-1 w-0.5 h-0.5 bg-white/30 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            {/* Efeito de partículas */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-2 left-2 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
              <div className="absolute top-4 right-3 w-0.5 h-0.5 bg-white/15 rounded-full animate-ping" style={{animationDelay: '0.7s'}}></div>
              <div className="absolute bottom-3 left-3 w-0.5 h-0.5 bg-white/10 rounded-full animate-ping" style={{animationDelay: '1.2s'}}></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-dark bg-clip-text text-transparent">
            Supreme Notify
          </h1>
          <p className="text-muted-foreground">Gerencie e teste notificações push</p>
        </div>

        {/* Layout Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1 - Status e Configuração */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status Card */}
            <Card className="notification-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Status do Device
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Permissão de notificação</span>
              <Badge variant={deviceStatus.permission === 'granted' ? 'default' : 'destructive'}>
                {deviceStatus.permission === 'granted' ? (
                  <CheckCircle className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {deviceStatus.permission === 'granted' ? 'Permitida' : 'Negada'}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status da conexão</span>
              <Badge variant={deviceStatus.isOnline ? 'default' : 'destructive'}>
                {deviceStatus.isOnline ? 'Online' : 'Offline'}
              </Badge>
            </div>

            {deviceStatus.token && (
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Token FCM</span>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-xs truncate">
                    {deviceStatus.token}
                  </code>
                  <Button size="sm" variant="outline" onClick={copyToken}>
                    Copiar
                  </Button>
                </div>
              </div>
            )}

            {deviceStatus.permission !== 'granted' && (
              <Button onClick={requestPermission} className="w-full">
                Solicitar Permissão
              </Button>
            )}
          </CardContent>
            </Card>

            {/* Device Info */}
            <DeviceInfoCard />

            {/* Notification Config */}
            <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Configuração da Notificação
            </CardTitle>
            <CardDescription>
              Configure os detalhes da notificação a ser enviada
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={config.title}
                  onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Pedido aprovado!"
                />
              </div>
              
              <div>
                <Label htmlFor="body">Mensagem *</Label>
                <Textarea
                  id="body"
                  value={config.body}
                  onChange={(e) => setConfig(prev => ({ ...prev, body: e.target.value }))}
                  placeholder="Ex: Seu pedido #1234 foi aprovado e está sendo preparado"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="sound">Som</Label>
                  <Select value={config.sound} onValueChange={(value) => setConfig(prev => ({ ...prev, sound: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                      <SelectItem value="none">Silencioso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="channel">Canal</Label>
                  <Select value={config.channel} onValueChange={(value) => setConfig(prev => ({ ...prev, channel: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Padrão</SelectItem>
                      <SelectItem value="urgent">Urgente</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="icon">Ícone da Notificação</Label>
                <Input
                  id="icon"
                  value={config.icon || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, icon: e.target.value }))}
                  placeholder="Ex: /supreme-notify-logo.png"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  URL do ícone (ex: /supreme-notify-logo.png, /icons/nubank/icon-180.png)
                </p>
              </div>

              <div>
                <Label htmlFor="deeplink">Deep Link (opcional)</Label>
                <Input
                  id="deeplink"
                  value={config.deepLink || ''}
                  onChange={(e) => setConfig(prev => ({ ...prev, deepLink: e.target.value }))}
                  placeholder="Ex: app://pedido/123"
                />
              </div>
            </div>
          </CardContent>
            </Card>
          </div>

          {/* Coluna 2 - Preview e Ações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Preview */}
            {config.title && config.body && (
              <Card>
            <CardHeader>
              <CardTitle>Prévia Visual</CardTitle>
              <CardDescription>
                Como sua notificação aparecerá
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreview
                title={config.title}
                body={config.body}
                icon={config.icon}
                image={config.image}
                actions={config.actions}
                badge={config.badge}
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              onClick={showLocalPreview} 
              className="w-full"
              variant="outline"
              disabled={!config.title || !config.body}
            >
              <Bell className="w-4 h-4 mr-2" />
              Prévia Local
            </Button>
            
            <Button 
              onClick={sendPushNotification}
              className="w-full"
              disabled={!deviceStatus.token || !config.title || !config.body}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Push
            </Button>
            
            <Button 
              onClick={testScheduledNotification}
              className="w-full"
              disabled={!config.title || !config.body || !isServiceWorkerReady}
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Testar Agendada (10s)
            </Button>
            
            <Button 
              onClick={testLockedScreenNotification}
              className="w-full"
              disabled={!config.title || !config.body || !isServiceWorkerReady}
              variant="outline"
            >
              <Bell className="w-4 h-4 mr-2" />
              Testar Tela Bloqueada (15s)
            </Button>
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Sequência Programada</h4>
              
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <Label>Delay (ms)</Label>
                  <Input
                    type="number"
                    value={sequenceConfig.delay}
                    onChange={(e) => setSequenceConfig(prev => ({ ...prev, delay: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Intervalo (ms)</Label>
                  <Input
                    type="number"
                    value={sequenceConfig.interval}
                    onChange={(e) => setSequenceConfig(prev => ({ ...prev, interval: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label>Quantidade</Label>
                  <Input
                    type="number"
                    value={sequenceConfig.quantity}
                    onChange={(e) => setSequenceConfig(prev => ({ ...prev, quantity: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={startSequence}
                  disabled={isSequenceActive || !deviceStatus.token}
                  className="flex-1"
                  variant="secondary"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Iniciar
                </Button>
                <Button
                  onClick={stopSequence}
                  disabled={!isSequenceActive}
                  className="flex-1"
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Parar
                </Button>
              </div>
            </div>
          </CardContent>
            </Card>

            {/* Examples */}
            <NotificationExamples onSelectExample={handleExampleSelect} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationDashboard;