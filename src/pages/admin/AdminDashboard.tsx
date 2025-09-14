import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, CreditCard, TrendingUp, AlertTriangle, Clock, UserCheck, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApiClient } from '@/lib/api-mock';
import ThemeToggle from '@/components/ThemeToggle';

interface MetricsData {
  activeUsers: number;
  activeSubscriptions: number;
  mrr: string;
  newUsers7d: number;
  newUsers30d: number;
  churn30d: number;
  trials: number;
  pastDue: number;
  expiringIn7Days: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const result = await mockApiClient.getMetricsSummary();

      if (result.success) {
        setMetrics(result.data);
      } else {
        setError('Erro ao carregar métricas');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await mockApiClient.logout();
      localStorage.removeItem('supreme-notify-token');
      navigate('/admin/login');
    } catch (err) {
      console.error('Erro ao fazer logout:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchMetrics} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Painel Admin</h1>
              <p className="text-sm text-gray-700 font-medium">Supreme Notify</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={() => navigate('/admin/users')}>
                <Users className="w-4 h-4 mr-2" />
                Usuários
              </Button>
              <Button variant="outline" onClick={() => navigate('/admin/subscriptions')}>
                <CreditCard className="w-4 h-4 mr-2" />
                Assinaturas
              </Button>
              <ThemeToggle />
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
          <p className="text-gray-700 font-medium">Visão geral do sistema</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeUsers || 0}</div>
              <p className="text-xs text-muted-foreground">
                +{metrics?.newUsers7d || 0} esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assinaturas Ativas</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.activeSubscriptions || 0}</div>
              <p className="text-xs text-muted-foreground">
                {metrics?.trials || 0} em trial
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">MRR</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.mrr || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">
                Receita recorrente mensal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn (30d)</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics?.churn30d || 0}</div>
              <p className="text-xs text-muted-foreground">
                Cancelamentos este mês
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Alertas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Expiram em ≤ 7 dias
              </CardTitle>
              <CardDescription>
                Assinaturas que precisam de atenção
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {metrics?.expiringIn7Days || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Assinaturas expirando em breve
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                Past Due
              </CardTitle>
              <CardDescription>
                Assinaturas em atraso
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600 mb-2">
                {metrics?.pastDue || 0}
              </div>
              <p className="text-sm text-muted-foreground">
                Requerem ação imediata
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Ações rápidas */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  onClick={() => navigate('/admin/users')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <Users className="h-6 w-6 mb-2" />
                  Gerenciar Usuários
                </Button>
                <Button 
                  onClick={() => navigate('/admin/subscriptions')}
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <CreditCard className="h-6 w-6 mb-2" />
                  Gerenciar Assinaturas
                </Button>
                <Button 
                  onClick={fetchMetrics}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center"
                >
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Atualizar Métricas
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
