import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CreditCard, Mail, Phone } from 'lucide-react';
import BankLogo from '@/components/BankLogo';
import { useTheme } from '@/hooks/useTheme';

interface SubscriptionExpiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscriptionInfo?: {
    planName?: string;
    expiredAt?: string;
    daysExpired?: number;
  };
}


const SubscriptionExpiredModal: React.FC<SubscriptionExpiredModalProps> = ({
  isOpen,
  onClose,
  subscriptionInfo
}) => {
  const { isDark } = useTheme();
  const [currentBank, setCurrentBank] = React.useState('nubank');
  
  // Lista de bancos disponíveis
  const banks = ['nubank', 'santander', 'itau', 'inter', 'c6', 'utmify'];
  
  // Alternar logo a cada 3 segundos
  React.useEffect(() => {
    if (!isOpen) return;
    
    const interval = setInterval(() => {
      setCurrentBank(prev => {
        const currentIndex = banks.indexOf(prev);
        return banks[(currentIndex + 1) % banks.length];
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200'} flex items-center justify-center z-50 p-4`}>
      <Card className={`w-full max-w-md ${isDark ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-sm shadow-2xl border-0`}>
        <CardHeader className="text-center pb-4">
          <div className={`mx-auto w-20 h-20 ${isDark ? 'bg-gray-700' : 'bg-white'} rounded-2xl flex items-center justify-center mb-4 shadow-lg border-2 ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
            <BankLogo bank={currentBank} size={64} />
          </div>
          <CardTitle className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Assinatura Expirada
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className={`text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <p className="mb-2 font-medium">
              Sua assinatura {subscriptionInfo?.planName && `(${subscriptionInfo.planName})`} expirou.
            </p>
            {subscriptionInfo?.daysExpired && (
              <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Expirada há {subscriptionInfo.daysExpired} dias
              </p>
            )}
          </div>

          <div className={`bg-gradient-to-br ${isDark ? 'from-orange-900/20 to-red-900/20 border-orange-800' : 'from-orange-50 to-red-50 border-orange-200'} border rounded-lg p-4 shadow-sm`}>
            <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Para renovar sua assinatura:
            </h3>
            <ul className={`space-y-2 text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-orange-500 to-red-500 rounded flex items-center justify-center mr-2">
                  <CreditCard className="h-3 w-3 text-white" />
                </div>
                Acesse a área de pagamento
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-500 rounded flex items-center justify-center mr-2">
                  <Mail className="h-3 w-3 text-white" />
                </div>
                Entre em contato por email
              </li>
              <li className="flex items-center">
                <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded flex items-center justify-center mr-2">
                  <Phone className="h-3 w-3 text-white" />
                </div>
                Ligue para o suporte
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transition-all duration-300"
            >
              Entendi
            </Button>
            <Button
              onClick={() => {
                // Redirecionar para página de renovação
                window.location.href = '/subscription';
              }}
              variant="outline"
              className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300"
            >
              Renovar Assinatura
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionExpiredModal;
