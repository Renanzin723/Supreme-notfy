import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, CreditCard, Users, Calendar, DollarSign, Loader2, RefreshCw, X, Trash2, Clock, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApiClient } from '@/lib/supabase-api';
import { Subscription } from '@/lib/supabase';

interface SubscriptionDisplay extends Subscription {
  userName: string;
  planName: string;
}

const AdminSubscriptionsSimple: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [renewDialog, setRenewDialog] = useState<{ open: boolean; subscription: SubscriptionDisplay | null }>({ open: false, subscription: null });
  const [renewMonths, setRenewMonths] = useState(1);
  const [changePlanDialog, setChangePlanDialog] = useState<{ open: boolean; subscription: SubscriptionDisplay | null }>({ open: false, subscription: null });
  const [plans, setPlans] = useState<any[]>([]);
  const [selectedNewPlan, setSelectedNewPlan] = useState<string>('');

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
      await fetchSubscriptions();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      console.log('🔍 [fetchSubscriptions] Buscando assinaturas e planos...');
      
      const [subscriptionsResult, plansResult] = await Promise.all([
        supabaseApiClient.getSubscriptions(),
        supabaseApiClient.getPlans()
      ]);

      if (subscriptionsResult.success) {
        console.log('✅ [fetchSubscriptions] Assinaturas carregadas:', subscriptionsResult.data?.length || 0);
        setSubscriptions(subscriptionsResult.data);
      } else {
        console.error('❌ [fetchSubscriptions] Erro ao buscar assinaturas:', subscriptionsResult.error);
      }

      if (plansResult.success) {
        console.log('✅ [fetchSubscriptions] Planos carregados:', plansResult.data?.length || 0);
        setPlans(plansResult.data);
      } else {
        console.error('❌ [fetchSubscriptions] Erro ao buscar planos:', plansResult.error);
      }
    } catch (error) {
      console.error('💥 [fetchSubscriptions] Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshSubscriptions = async () => {
    try {
      console.log('🔄 [refreshSubscriptions] Recarregando lista de assinaturas...');
      const result = await supabaseApiClient.getSubscriptions();
      if (result.success) {
        setSubscriptions(result.data);
        console.log('✅ [refreshSubscriptions] Lista atualizada com sucesso!');
      }
    } catch (error) {
      console.error('💥 [refreshSubscriptions] Erro ao recarregar:', error);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) {
      return;
    }

    setProcessing(subscriptionId);
    try {
      console.log('🔍 [handleCancelSubscription] Cancelando assinatura:', subscriptionId);
      
      const result = await supabaseApiClient.cancelSubscription(subscriptionId);
      
      if (result.success) {
        alert('Assinatura cancelada com sucesso!');
        await refreshSubscriptions();
      } else {
        console.error('❌ [handleCancelSubscription] Erro no cancelamento:', result.error);
        alert('Erro ao cancelar assinatura: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleCancelSubscription] Erro geral:', error);
      alert('Erro ao cancelar assinatura');
    } finally {
      setProcessing(null);
    }
  };

  const handleRenewSubscription = async () => {
    if (!renewDialog.subscription) return;

    setProcessing(renewDialog.subscription.id);
    try {
      console.log('🔍 [handleRenewSubscription] Renovando assinatura:', renewDialog.subscription.id, 'por', renewMonths, 'meses');
      
      const result = await supabaseApiClient.renewSubscription(renewDialog.subscription.id, renewMonths);
      
      if (result.success) {
        alert(`Assinatura renovada por ${renewMonths} mês(es) com sucesso!`);
        setRenewDialog({ open: false, subscription: null });
        await refreshSubscriptions();
      } else {
        console.error('❌ [handleRenewSubscription] Erro na renovação:', result.error);
        alert('Erro ao renovar assinatura: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleRenewSubscription] Erro geral:', error);
      alert('Erro ao renovar assinatura');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta assinatura? Esta ação não pode ser desfeita.')) {
      return;
    }

    setProcessing(subscriptionId);
    try {
      console.log('🔍 [handleDeleteSubscription] Excluindo assinatura:', subscriptionId);
      
      const result = await supabaseApiClient.deleteSubscription(subscriptionId);
      
      if (result.success) {
        alert('Assinatura excluída com sucesso!');
        await refreshSubscriptions();
      } else {
        console.error('❌ [handleDeleteSubscription] Erro na exclusão:', result.error);
        alert('Erro ao excluir assinatura: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleDeleteSubscription] Erro geral:', error);
      alert('Erro ao excluir assinatura');
    } finally {
      setProcessing(null);
    }
  };

  const handleChangePlan = async () => {
    if (!changePlanDialog.subscription || !selectedNewPlan) {
      alert('Por favor, selecione um novo plano!');
      return;
    }

    if (selectedNewPlan === changePlanDialog.subscription.plan_id) {
      alert('O novo plano deve ser diferente do plano atual!');
      return;
    }

    setProcessing(changePlanDialog.subscription.id);
    try {
      console.log('🔍 [handleChangePlan] Trocando plano da assinatura:', changePlanDialog.subscription.id, 'para:', selectedNewPlan);
      
      const result = await supabaseApiClient.changeSubscriptionPlan(changePlanDialog.subscription.id, selectedNewPlan);
      
      if (result.success) {
        alert('Plano da assinatura alterado com sucesso!');
        setChangePlanDialog({ open: false, subscription: null });
        setSelectedNewPlan('');
        await refreshSubscriptions();
      } else {
        console.error('❌ [handleChangePlan] Erro na troca de plano:', result.error);
        alert('Erro ao trocar plano: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleChangePlan] Erro geral:', error);
      alert('Erro ao trocar plano da assinatura');
    } finally {
      setProcessing(null);
    }
  };

  const getDaysUntilExpiration = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getExpirationStatus = (endDate: string) => {
    const days = getDaysUntilExpiration(endDate);
    if (days < 0) return { status: 'expired', color: 'text-red-600', bg: 'bg-red-100' };
    if (days <= 7) return { status: 'expiring', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (days <= 30) return { status: 'warning', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { status: 'ok', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-100 text-green-800">Ativa</Badge>;
      case 'CANCELED':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'CANCELLED':
        return <Badge className="bg-red-100 text-red-800">Cancelada</Badge>;
      case 'EXPIRED':
        return <Badge className="bg-gray-100 text-gray-800">Expirada</Badge>;
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'TRIALING':
        return <Badge className="bg-blue-100 text-blue-800">Teste</Badge>;
      case 'PAST_DUE':
        return <Badge className="bg-orange-100 text-orange-800">Vencida</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-gray-100 text-gray-800">Suspensa</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };


  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-green-500 rounded-full animate-spin" style={{animationDirection: 'reverse', animationDuration: '1.5s'}}></div>
          </div>
          <span className="text-blue-600 font-medium">Carregando assinaturas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
          backgroundSize: '60px 60px'
        }}></div>
      </div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-blue-500/5 via-transparent to-green-500/5"></div>
      
      <div className="relative z-10 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header Futurista */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-8 sm:mb-12">
            <Button 
              onClick={() => navigate('/admin')} 
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg transition-all duration-300"
              size="sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-blue-700">
                GERENCIAR ASSINATURAS
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-600 text-sm font-medium">Sistema de Assinaturas Ativo</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 text-sm">Controle Financeiro</span>
              </div>
            </div>
          </div>

          {/* Estatísticas Futuristas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-12">
            <Card className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Total de Assinaturas</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">{subscriptions.length}</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-green-200 backdrop-blur-sm hover:border-green-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Assinaturas Ativas</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {subscriptions.filter(s => s.status === 'ACTIVE').length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full" style={{width: '85%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Receita Total</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  R$ {subscriptions.reduce((sum, s) => sum + s.amount, 0).toFixed(2)}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '75%'}}></div>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Lista de Assinaturas */}
          <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold text-gray-900">Lista de Assinaturas</CardTitle>
                <Button
                  onClick={refreshSubscriptions}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Atualizar Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {subscriptions.map((subscription) => {
                  const daysUntilExpiration = getDaysUntilExpiration(subscription.current_period_end);
                  const expirationStatus = getExpirationStatus(subscription.current_period_end);
                  
                  return (
                    <div key={subscription.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors gap-4">
                      <div className="flex items-center space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <CreditCard className="h-5 w-5 text-blue-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                            <h3 className="font-semibold text-blue-800 truncate">
                              {subscription.userName || 'Usuário não encontrado'}
                            </h3>
                            {getStatusBadge(subscription.status)}
                          </div>
                          <p className="text-sm text-blue-600 flex items-center mb-1">
                            <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">ID: {subscription.user_id}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center mb-2">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{subscription.planName || 'Plano não encontrado'} - R$ {subscription.amount.toFixed(2)}</span>
                          </p>
                          {/* Destaque de Expiração */}
                          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${expirationStatus.bg} ${expirationStatus.color}`}>
                            <Clock className="h-3 w-3 mr-1" />
                            {daysUntilExpiration < 0 
                              ? `Expirada há ${Math.abs(daysUntilExpiration)} dias`
                              : daysUntilExpiration === 0
                              ? 'Expira hoje'
                              : `Expira em ${daysUntilExpiration} dias`
                            }
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                        {subscription.status === 'ACTIVE' && (
                          <>
                            <Button
                              onClick={() => setRenewDialog({ open: true, subscription })}
                              size="sm"
                              className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                              disabled={processing === subscription.id}
                              title="Renovar Assinatura"
                            >
                              {processing === subscription.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                            </Button>
                            <Button
                              onClick={() => setChangePlanDialog({ open: true, subscription })}
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                              disabled={processing === subscription.id}
                              title="Trocar Plano"
                            >
                              {processing === subscription.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CreditCard className="h-3 w-3" />}
                            </Button>
                            <Button
                              onClick={() => handleCancelSubscription(subscription.id)}
                              size="sm"
                              className="bg-yellow-500 hover:bg-yellow-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                              disabled={processing === subscription.id}
                              title="Cancelar Assinatura"
                            >
                              {processing === subscription.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                            </Button>
                          </>
                        )}
                        <Button
                          onClick={() => handleDeleteSubscription(subscription.id)}
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                          disabled={processing === subscription.id}
                          title="Excluir Assinatura"
                        >
                          {processing === subscription.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Modal de Renovação */}
          <Dialog open={renewDialog.open} onOpenChange={(open) => setRenewDialog({ open, subscription: null })}>
            <DialogContent className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                  <RefreshCw className="h-6 w-6" />
                  Renovar Assinatura
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {renewDialog.subscription && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      {renewDialog.subscription.userName}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Plano: {renewDialog.subscription.planName} - R$ {renewDialog.subscription.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expira em: {new Date(renewDialog.subscription.current_period_end).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Período de Renovação</label>
                  <Select value={renewMonths.toString()} onValueChange={(value) => setRenewMonths(parseInt(value))}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                      <SelectValue placeholder="Selecionar período" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-lg">
                      <SelectItem value="1" className="hover:bg-blue-50 focus:bg-blue-50">1 mês</SelectItem>
                      <SelectItem value="3" className="hover:bg-blue-50 focus:bg-blue-50">3 meses</SelectItem>
                      <SelectItem value="6" className="hover:bg-blue-50 focus:bg-blue-50">6 meses</SelectItem>
                      <SelectItem value="12" className="hover:bg-blue-50 focus:bg-blue-50">12 meses</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleRenewSubscription}
                    disabled={processing === renewDialog.subscription?.id}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-0 shadow-lg shadow-green-500/25 transition-all duration-300"
                  >
                    {processing === renewDialog.subscription?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Renovando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Renovar Assinatura
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setRenewDialog({ open: false, subscription: null })}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Modal de Trocar Plano */}
          <Dialog open={changePlanDialog.open} onOpenChange={(open) => setChangePlanDialog({ open, subscription: null })}>
            <DialogContent className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                  <CreditCard className="h-6 w-6" />
                  Trocar Plano
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                {changePlanDialog.subscription && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 mb-2">
                      {changePlanDialog.subscription.userName}
                    </h3>
                    <p className="text-sm text-blue-600">
                      Plano Atual: {changePlanDialog.subscription.planName} - R$ {changePlanDialog.subscription.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expira em: {new Date(changePlanDialog.subscription.current_period_end).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                )}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Novo Plano</label>
                  <Select value={selectedNewPlan} onValueChange={setSelectedNewPlan}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                      <SelectValue placeholder="Selecionar novo plano" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-lg">
                      {plans.filter(plan => plan.id !== changePlanDialog.subscription?.plan_id).map((plan) => (
                        <SelectItem key={plan.id} value={plan.id} className="hover:bg-blue-50 focus:bg-blue-50">
                          {plan.name} - R$ {plan.price.toFixed(2)} ({plan.billing_period})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>⚠️ Atenção:</strong> A data de vencimento será recalculada baseada no novo plano. 
                    O período restante da assinatura atual será considerado.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleChangePlan}
                    disabled={processing === changePlanDialog.subscription?.id || !selectedNewPlan}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {processing === changePlanDialog.subscription?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Trocando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Trocar Plano
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setChangePlanDialog({ open: false, subscription: null });
                      setSelectedNewPlan('');
                    }}
                    variant="outline"
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default AdminSubscriptionsSimple;