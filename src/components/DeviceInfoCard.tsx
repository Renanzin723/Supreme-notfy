import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Globe, 
  Smartphone, 
  Wifi, 
  WifiOff, 
  RefreshCw,
  MapPin,
  Clock,
  Languages
} from 'lucide-react';
import { useDeviceInfo } from '@/hooks/useDeviceInfo';
import LoadingSpinner from './ui/loading-spinner';

const DeviceInfoCard: React.FC = () => {
  const { deviceInfo, loading, error, refresh } = useDeviceInfo();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Toast de sucesso seria implementado aqui
      console.log(`${label} copiado para a área de transferência`);
    }).catch(() => {
      console.error('Falha ao copiar para a área de transferência');
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Informações do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <LoadingSpinner size="md" />
            <span className="ml-2 text-sm text-muted-foreground">
              Carregando informações...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="w-5 h-5" />
            Informações do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-4">
            <p className="text-sm text-muted-foreground mb-2">{error}</p>
            <Button onClick={refresh} size="sm" variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Monitor className="w-5 h-5" />
          Informações do Dispositivo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* IP Address */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">IP Público</span>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-sm bg-muted px-2 py-1 rounded">
              {deviceInfo.ip || 'Não disponível'}
            </code>
            {deviceInfo.ip && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard(deviceInfo.ip!, 'IP')}
                className="h-6 w-6 p-0"
              >
                📋
              </Button>
            )}
          </div>
        </div>

        {/* Device Type */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Dispositivo</span>
          </div>
          <Badge variant="secondary">{deviceInfo.device}</Badge>
        </div>

        {/* Browser */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Navegador</span>
          </div>
          <Badge variant="outline">{deviceInfo.browser}</Badge>
        </div>

        {/* Platform */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Sistema</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.platform}</span>
        </div>

        {/* Screen Resolution */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Resolução</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {deviceInfo.screen.width} × {deviceInfo.screen.height}
          </span>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Languages className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Idioma</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.language}</span>
        </div>

        {/* Timezone */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Fuso Horário</span>
          </div>
          <span className="text-sm text-muted-foreground">{deviceInfo.timezone}</span>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {deviceInfo.online ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
            <span className="text-sm font-medium">Conexão</span>
          </div>
          <Badge variant={deviceInfo.online ? 'default' : 'destructive'}>
            {deviceInfo.online ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {/* User Agent (collapsible) */}
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium hover:text-primary">
            <Monitor className="w-4 h-4" />
            User Agent
            <span className="ml-auto text-xs text-muted-foreground group-open:rotate-180 transition-transform">
              ▼
            </span>
          </summary>
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <code className="text-xs break-all">
              {deviceInfo.userAgent}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(deviceInfo.userAgent, 'User Agent')}
              className="mt-2 h-6 text-xs"
            >
              📋 Copiar User Agent
            </Button>
          </div>
        </details>

        {/* Security Warning */}
        <div className="pt-2 border-t">
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <div className="flex-shrink-0 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  ⚠️ Aviso de Segurança
                </p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                  Seu acesso é único, não compartilhe com outros dispositivos
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="pt-2">
          <Button onClick={refresh} size="sm" variant="outline" className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar Informações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DeviceInfoCard;
