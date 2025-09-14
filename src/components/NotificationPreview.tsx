import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell } from 'lucide-react';

interface NotificationPreviewProps {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  timestamp?: Date;
  actions?: Array<{ action: string; title: string }>;
  badge?: number;
}

const NotificationPreview: React.FC<NotificationPreviewProps> = ({
  title,
  body,
  icon,
  image,
  timestamp = new Date(),
  actions = [],
  badge
}) => {
  return (
    <Card className="w-full max-w-sm mx-auto notification-card notification-enter">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="relative">
            {icon ? (
              <img src={icon} alt="App icon" className="w-8 h-8 rounded" />
            ) : (
              <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div>
            )}
            {badge && badge > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 w-5 h-5 p-0 text-xs flex items-center justify-center badge-bounce"
              >
                {badge > 99 ? '99+' : badge}
              </Badge>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-sm truncate">{title}</h3>
              <span className="text-xs text-muted-foreground ml-2">
                {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground leading-relaxed">
              {body}
            </p>
            
            {image && (
              <div className="mt-3">
                <img 
                  src={image} 
                  alt="Notification attachment" 
                  className="w-full rounded-lg max-h-32 object-cover"
                />
              </div>
            )}
            
            {actions.length > 0 && (
              <div className="flex gap-2 mt-3">
                {actions.map((action, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 text-xs font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-full transition-colors"
                    onClick={() => console.log(`Ação executada: ${action.action}`)}
                  >
                    {action.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationPreview;