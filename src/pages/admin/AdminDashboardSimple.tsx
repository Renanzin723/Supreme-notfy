import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApiClient } from '@/lib/supabase-api';
import ThemeToggle from '@/components/ThemeToggle';

const AdminDashboardSimple: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usersWithoutSubscription, setUsersWithoutSubscription] = useState<any[]>([]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, []);

  const checkAuthAndFetchData = async () => {
    // Verificar autenticação primeiro
    const tokenData = localStorage.getItem('supreme-notify-token');
    if (!tokenData) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedData = JSON.parse(tokenData);
      const user = parsedData.user;
      
      // Verificar se é admin ou agent
      if (user?.role !== 'ADMIN' && user?.role !== 'AGENT') {
        navigate('/admin/login');
        return;
      }

      // Se autenticação OK, buscar dados
      await fetchMetrics();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchMetrics = async () => {
    try {
      console.log('🔍 [fetchMetrics] Buscando métricas do dashboard...');
      
      const [metricsResult, usersWithoutSubResult] = await Promise.all([
        supabaseApiClient.getMetricsSummary(),
        supabaseApiClient.getUsersWithoutSubscription()
      ]);

      if (metricsResult.success) {
        console.log('✅ [fetchMetrics] Métricas carregadas:', metricsResult.data);
        setMetrics(metricsResult.data);
      }

      if (usersWithoutSubResult.success) {
        console.log('📊 [fetchMetrics] Usuários sem assinatura encontrados:', usersWithoutSubResult.data.length);
        // Filtrar novamente para garantir que não há admins (dupla verificação)
        const nonAdminUsers = usersWithoutSubResult.data.filter((user: any) => user.role !== 'ADMIN');
        console.log('📊 [fetchMetrics] Usuários sem assinatura (não-admin):', nonAdminUsers.length);
        setUsersWithoutSubscription(nonAdminUsers);
        // Adicionar alerta se houver usuários sem assinatura
        if (nonAdminUsers.length > 0) {
          console.warn('⚠️ [fetchMetrics] ALERTA: Usuários ativos sem assinatura detectados!');
        }
      }
    } catch (error) {
      console.error('💥 [fetchMetrics] Erro ao buscar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabaseApiClient.logout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      navigate('/admin/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-transparent to-green-500/5"></div>
      
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Futurista */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12 gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-600 via-blue-500 to-green-600 bg-clip-text text-transparent">
                SUPREME NOTIFY
              </h1>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-2">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-blue-700 text-sm font-medium">Sistema Online</span>
                </div>
                <div className="hidden sm:block w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-800 text-sm font-medium">Supreme Notify v2.0</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <ThemeToggle />
              <Button 
                onClick={handleLogout} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40 w-full sm:w-auto"
              >
                <span className="mr-2">🚀</span>
                Logout
              </Button>
            </div>
          </div>

          {/* Alerta de Usuários Sem Assinatura */}
          {usersWithoutSubscription.length > 0 && (
            <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800 backdrop-blur-sm shadow-lg mb-8">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-orange-100 rounded-full">
                    <AlertTriangle className="h-8 w-8 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-orange-800 mb-1">
                      ⚠️ Usuários Ativos Sem Assinatura
                    </h3>
                    <p className="text-orange-700 mb-3">
                      {usersWithoutSubscription.length} usuário(s) ativo(s) não possuem assinatura ativa. 
                      Acesse a aba de aprovação para selecionar planos.
                    </p>
                    <Button
                      onClick={() => navigate('/admin/approval')}
                      className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg transition-all duration-300"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Ir para Aprovação
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métricas Futuristas */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
              </div>
              <span className="ml-4 text-blue-700 font-semibold">Carregando métricas...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
              <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-700">Usuários Ativos</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Users className="h-4 w-4 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics?.activeUsers || 0}</div>
                  <p className="text-xs text-gray-700 font-medium">
                    {metrics?.newUsers7d || 0} novos esta semana
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '75%'}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-700">Assinaturas Ativas</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <CreditCard className="h-4 w-4 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics?.activeSubscriptions || 0}</div>
                  <p className="text-xs text-gray-700 font-medium">
                    {metrics?.trials || 0} em teste
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-gray-700 backdrop-blur-sm hover:border-green-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-green-700">Receita Mensal</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <TrendingUp className="h-4 w-4 text-green-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics?.mrr || 'R$ 0,00'}</div>
                  <p className="text-xs text-gray-700 font-medium">
                    MRR atual
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-semibold text-blue-700">Alertas</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <AlertTriangle className="h-4 w-4 text-blue-700" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{metrics?.pastDue || 0}</div>
                  <p className="text-xs text-gray-700 font-medium">
                    {metrics?.expiringIn7Days || 0} expirando em 7 dias
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '30%'}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Ações Rápidas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/approval')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Aprovar Usuários</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Aprovar novos usuários e selecionar planos
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">🚀</span>
                  Aprovar Usuários
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/create-user')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <span className="text-2xl">👤</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Criar Usuário</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Cadastrar novo usuário no sistema
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">✨</span>
                  Criar Usuário
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-gray-700 backdrop-blur-sm hover:border-green-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/users')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-all">
                    <span className="text-2xl">👥</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-green-700 transition-colors">Gerenciar Usuários</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Visualizar e gerenciar usuários do sistema
                </p>
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">🔧</span>
                  Acessar Usuários
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/subscriptions')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <span className="text-2xl">💳</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Assinaturas</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Gerenciar planos e assinaturas
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">📊</span>
                  Acessar Assinaturas
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-gray-700 backdrop-blur-sm hover:border-purple-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/webhooks')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-all">
                    <span className="text-2xl">🔗</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">Webhooks</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Integrações e pagamentos automáticos
                </p>
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-purple-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">⚡</span>
                  Configurar Webhooks
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-orange-200 dark:border-gray-700 backdrop-blur-sm hover:border-orange-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg h-full flex flex-col" onClick={() => navigate('/admin/checkout')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-all">
                    <span className="text-2xl">💳</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">Links de Checkout</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col flex-1">
                <p className="text-sm text-gray-700 mb-4 flex-1 font-medium">
                  Configurar links de pagamento para cada plano
                </p>
                <Button className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white border-0 shadow-lg shadow-orange-500/25 transition-all duration-300 mt-auto">
                  <span className="mr-2">🔧</span>
                  Gerenciar Checkout
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Ações Secundárias */}
          <div className="flex justify-center">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group cursor-pointer shadow-lg w-full max-w-sm sm:max-w-md" onClick={() => navigate('/brand')}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-all">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <CardTitle className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">Voltar ao App</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 mb-4 font-medium">
                  Retornar à seleção de marcas
                </p>
                <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300">
                  <span className="mr-2">🎯</span>
                  Ir para Marcas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminDashboardSimple;
