import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, ExternalLink, CreditCard, Database } from 'lucide-react';
import { checkoutApiClient, CheckoutLink } from '@/lib/checkout-api';
import ThemeToggle from '@/components/ThemeToggle';

const AdminCheckoutLinks: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [checkoutLinks, setCheckoutLinks] = useState<CheckoutLink[]>([]);
  const [linksData, setLinksData] = useState({
    daily: '',
    weekly: '',
    monthly: '',
    lifetime: ''
  });

  // Verificar autenticação
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const tokenData = localStorage.getItem('supreme-notify-token');
    if (!tokenData) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedData = JSON.parse(tokenData);
      const user = parsedData.user;
      
      if (user?.role !== 'ADMIN' && user?.role !== 'AGENT') {
        navigate('/admin/login');
        return;
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  // Carregar links de checkout
  useEffect(() => {
    loadCheckoutLinks();
  }, []);

  const loadCheckoutLinks = async () => {
    try {
      const result = await checkoutApiClient.getCheckoutLinks();
      if (result.success && result.data) {
        setCheckoutLinks(result.data);
        
        // Mapear para o formato antigo para compatibilidade
        const linksMap = {
          daily: result.data.find(l => l.plan_id === 'daily')?.checkout_url || '',
          weekly: result.data.find(l => l.plan_id === 'weekly')?.checkout_url || '',
          monthly: result.data.find(l => l.plan_id === 'monthly')?.checkout_url || '',
          lifetime: result.data.find(l => l.plan_id === 'lifetime')?.checkout_url || ''
        };
        setLinksData(linksMap);
      } else {
        console.error('Erro ao carregar links:', result.error);
        // Fallback para localStorage se o banco falhar
        const links = localStorage.getItem('checkout-links');
        if (links) {
          setLinksData(JSON.parse(links));
        }
      }
    } catch (error) {
      console.error('Erro ao carregar links de checkout:', error);
      // Fallback para localStorage
      const links = localStorage.getItem('checkout-links');
      if (links) {
        setLinksData(JSON.parse(links));
      }
    }
  };

  const handleInputChange = (plan: string, value: string) => {
    setLinksData(prev => ({
      ...prev,
      [plan]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Salvar no banco de dados
      const savePromises = Object.entries(linksData).map(([planId, url]) => 
        checkoutApiClient.updateCheckoutLink(planId, url)
      );

      const results = await Promise.all(savePromises);
      
      // Verificar se algum falhou
      const failedResults = results.filter(r => !r.success);
      if (failedResults.length > 0) {
        throw new Error(`Erro ao salvar alguns links: ${failedResults.map(r => r.error).join(', ')}`);
      }

      // Backup no localStorage também
      localStorage.setItem('checkout-links', JSON.stringify(linksData));
      
      setSuccess('Links de checkout salvos com sucesso no banco de dados!');
      
      // Recarregar dados
      await loadCheckoutLinks();
      
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Erro ao salvar links:', err);
      setError(`Erro ao salvar links de checkout: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      
      // Fallback: salvar apenas no localStorage
      try {
        localStorage.setItem('checkout-links', JSON.stringify(linksData));
        setError(`Erro no banco, mas salvou no navegador: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      } catch (localErr) {
        setError('Erro ao salvar links de checkout');
      }
    } finally {
      setLoading(false);
    }
  };

  const testLink = (url: string) => {
    if (url) {
      window.open(url, '_blank');
    }
  };

  const plans = [
    { id: 'daily', name: 'Plano Diário', price: 'R$ 9,90', description: 'Acesso por 1 dia' },
    { id: 'weekly', name: 'Plano Semanal', price: 'R$ 15,90', description: 'Acesso por 7 dias' },
    { id: 'monthly', name: 'Plano Mensal', price: 'R$ 34,90', description: 'Acesso por 30 dias' },
    { id: 'lifetime', name: 'Plano Vitalício', price: 'R$ 47,90', description: 'Acesso permanente' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gerenciar Links de Checkout</h1>
            <p className="text-gray-600 mt-2">
              Configure os links de checkout para cada plano de assinatura
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Alertas */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Grid de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {plans.map((plan) => (
            <Card key={plan.id} className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  {plan.price} - {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`${plan.id}-link`} className="text-gray-800 dark:text-gray-200 font-semibold">
                    Link de Checkout
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id={`${plan.id}-link`}
                      type="url"
                      placeholder="https://checkout.exemplo.com/plano-diario"
                      value={linksData[plan.id as keyof typeof linksData]}
                      onChange={(e) => handleInputChange(plan.id, e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => testLink(checkoutLinks[plan.id as keyof typeof checkoutLinks])}
                      disabled={!checkoutLinks[plan.id as keyof typeof checkoutLinks]}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Status do Link */}
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    checkoutLinks[plan.id as keyof typeof checkoutLinks] 
                      ? 'bg-green-500' 
                      : 'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {checkoutLinks[plan.id as keyof typeof checkoutLinks] 
                      ? 'Link configurado' 
                      : 'Link não configurado'
                    }
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-center">
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="px-8 py-3"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Links de Checkout
              </>
            )}
          </Button>
        </div>

        {/* Informações Adicionais */}
        <Card className="mt-8 dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-100">
              Informações Importantes
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-600 dark:text-gray-400 space-y-2">
            <p>• Configure os links de checkout para cada plano de assinatura</p>
            <p>• Os links devem apontar para páginas de pagamento válidas</p>
            <p>• Use o botão de teste para verificar se os links estão funcionando</p>
            <p>• Os links são salvos localmente e aplicados imediatamente</p>
            <p>• Certifique-se de que os links estão configurados antes de ativar o sistema</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCheckoutLinks;
