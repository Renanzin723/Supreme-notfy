import React, { memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Image, Volume2, Vibrate } from 'lucide-react';

interface NotificationPreviewProps {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  actions?: Array<{ action: string; title: string }>;
  sound?: string;
  vibrationPattern?: string;
  channel?: string;
  badge?: number;
  tag?: string;
}

const NotificationPreview = memo<NotificationPreviewProps>(({
  title,
  body,
  icon,
  image,
  actions = [],
  sound = 'default',
  vibrationPattern = 'default',
  channel = 'default',
  badge = 0,
  tag
}) => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Prévia da Notificação
        </CardTitle>
        <CardDescription>
          Como sua notificação aparecerá no dispositivo
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview da notificação */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border">
          <div className="flex items-start gap-3">
            {/* Ícone */}
            <div className="flex-shrink-0">
              {icon ? (
                <img 
                  src={icon} 
                  alt="App icon" 
                  className="w-8 h-8 rounded"
                />
              ) : (
                <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Conteúdo */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-sm truncate">{title}</h4>
                {badge > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {badge}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
                {body}
              </p>
              
              {/* Imagem */}
              {image && (
                <div className="mt-2">
                  <img 
                    src={image} 
                    alt="Notification image" 
                    className="w-full h-20 object-cover rounded"
                  />
                </div>
              )}

              {/* Ações */}
              {actions.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {actions.slice(0, 2).map((action, index) => (
                    <button
                      key={index}
                      className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                    >
                      {action.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Volume2 className="w-4 h-4" />
            <span>Som: {sound}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Vibrate className="w-4 h-4" />
            <span>Vibração: {vibrationPattern}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Bell className="w-4 h-4" />
            <span>Canal: {channel}</span>
          </div>

          {tag && (
            <div className="flex items-center gap-2 text-sm">
              <span>Tag: {tag}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

NotificationPreview.displayName = 'NotificationPreview';

export default NotificationPreview;
