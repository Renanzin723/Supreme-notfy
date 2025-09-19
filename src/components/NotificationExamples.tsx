import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CreditCard, TrendingUp, AlertTriangle, Users, Smartphone } from 'lucide-react';

interface NotificationExamplesProps {
  onSelectExample: (example: any) => void;
}

const NotificationExamples: React.FC<NotificationExamplesProps> = ({ onSelectExample }) => {
  const examples = [
    {
      id: 'nubank-payment',
      title: 'Pagamento Aprovado',
      body: 'Seu pagamento de R$ 150,00 foi aprovado com sucesso!',
      icon: '/icons/nubank/icon-180.png',
      category: 'Pagamento',
      color: 'bg-purple-500'
    },
    {
      id: 'nubank-transfer',
      title: 'Transferência Recebida',
      body: 'Você recebeu R$ 500,00 via Maria Santos',
      icon: '/icons/nubank/icon-180.png',
      category: 'Transferência',
      color: 'bg-green-500'
    },
    {
      id: 'nubank-investment',
      title: 'Investimento Atualizado',
      body: 'Seu investimento em Renda Fixa rendeu R$ 25,30 hoje',
      icon: '/icons/nubank/icon-180.png',
      category: 'Investimento',
      color: 'bg-blue-500'
    },
    {
      id: 'nubank-alert',
      title: 'Alerta de Segurança',
      body: 'Tentativa de login suspeita detectada. Verifique sua conta.',
      icon: '/icons/nubank/icon-180.png',
      category: 'Segurança',
      color: 'bg-red-500'
    },
    {
      id: 'nubank-promotion',
      title: 'Promoção Especial',
      body: 'Cashback de 5% em todas as compras hoje! Aproveite!',
      icon: '/icons/nubank/icon-180.png',
      category: 'Promoção',
      color: 'bg-yellow-500'
    },
    {
      id: 'nubank-reminder',
      title: 'Lembrete de Pagamento',
      body: 'Não esqueça de pagar sua fatura até amanhã',
      icon: '/icons/nubank/icon-180.png',
      category: 'Lembrete',
      color: 'bg-orange-500'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Exemplos de Notificações
        </CardTitle>
        <CardDescription>
          Clique em um exemplo para preencher automaticamente os campos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {examples.map((example) => (
            <div
              key={example.id}
              className={`p-4 rounded-lg border-2 border-dashed hover:border-solid transition-all cursor-pointer ${example.color} bg-opacity-10 hover:bg-opacity-20`}
              onClick={() => onSelectExample(example)}
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded overflow-hidden">
                  <img src={example.icon} alt="Icon" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-600">{example.category}</span>
                  </div>
                  <h4 className="font-semibold text-sm mb-1 line-clamp-1">{example.title}</h4>
                  <p className="text-xs text-gray-500 line-clamp-2">{example.body}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-3 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectExample(example);
                }}
              >
                Usar Este Exemplo
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationExamples;
