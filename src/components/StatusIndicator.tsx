import React from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export type StatusType = 'success' | 'error' | 'warning' | 'pending';

interface StatusIndicatorProps {
  status: StatusType;
  label: string;
  description?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, label, description }) => {
  const getStatusConfig = (status: StatusType) => {
    switch (status) {
      case 'success':
        return {
          icon: CheckCircle,
          variant: 'default' as const,
          className: 'bg-success text-success-foreground'
        };
      case 'error':
        return {
          icon: XCircle,
          variant: 'destructive' as const,
          className: 'bg-error text-error-foreground'
        };
      case 'warning':
        return {
          icon: AlertTriangle,
          variant: 'secondary' as const,
          className: 'bg-warning text-warning-foreground'
        };
      case 'pending':
        return {
          icon: Clock,
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground'
        };
      default:
        return {
          icon: Clock,
          variant: 'secondary' as const,
          className: 'bg-muted text-muted-foreground'
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm font-medium">{label}</span>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {status === 'success' && 'Ativo'}
        {status === 'error' && 'Erro'}
        {status === 'warning' && 'Aviso'}
        {status === 'pending' && 'Pendente'}
      </Badge>
    </div>
  );
};

export default StatusIndicator;