import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, XCircle, Copy } from 'lucide-react';

interface DeviceStatusCardProps {
  permission: 'granted' | 'denied' | 'default';
  token: string | null;
  isOnline: boolean;
  onRequestPermission: () => void;
  onCopyToken: () => void;
}

const DeviceStatusCard = memo<DeviceStatusCardProps>(({
  permission,
  token,
  isOnline,
  onRequestPermission,
  onCopyToken
}) => {
  return (
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
          <Badge variant={permission === 'granted' ? 'default' : 'destructive'}>
            {permission === 'granted' ? (
              <CheckCircle className="w-3 h-3 mr-1" />
            ) : (
              <XCircle className="w-3 h-3 mr-1" />
            )}
            {permission === 'granted' ? 'Permitida' : 'Negada'}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status da conexão</span>
          <Badge variant={isOnline ? 'default' : 'destructive'}>
            {isOnline ? 'Online' : 'Offline'}
          </Badge>
        </div>

        {token && (
          <div className="space-y-2">
            <span className="text-sm text-muted-foreground">Token FCM</span>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-xs truncate">
                {token}
              </code>
              <Button size="sm" variant="outline" onClick={onCopyToken}>
                <Copy className="w-3 h-3 mr-1" />
                Copiar
              </Button>
            </div>
          </div>
        )}

        {permission !== 'granted' && (
          <Button onClick={onRequestPermission} className="w-full">
            Solicitar Permissão
          </Button>
        )}
      </CardContent>
    </Card>
  );
});

DeviceStatusCard.displayName = 'DeviceStatusCard';

export default DeviceStatusCard;
