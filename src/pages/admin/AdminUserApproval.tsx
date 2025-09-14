import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, CheckCircle, XCircle, Clock, Mail, Calendar, Shield, Loader2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApiClient } from '@/lib/supabase-api';
import { User, Plan } from '@/lib/supabase';
import ThemeToggle from '@/components/ThemeToggle';

const AdminUserApproval: React.FC = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [usersWithoutSubscription, setUsersWithoutSubscription] = useState<User[]>([]);
  const [selectedPlans, setSelectedPlans] = useState<{[userId: string]: string}>({});

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
      await fetchData();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    try {
      console.log('🔍 [fetchData] Buscando dados para aprovação...');
      
      const [usersResult, plansResult, usersWithoutSubResult] = await Promise.all([
        supabaseApiClient.getUsers(),
        supabaseApiClient.getPlans(),
        supabaseApiClient.getUsersWithoutSubscription()
      ]);

      if (usersResult.success) {
        const pendingUsers = usersResult.data.filter((user: User) => 
          user.status === 'PENDING' && user.role !== 'ADMIN'
        );
        console.log('📊 [fetchData] Usuários pendentes encontrados (não-admin):', pendingUsers.length);
        console.log('📊 [fetchData] Roles dos usuários pendentes:', pendingUsers.map(u => u.role));
        setPendingUsers(pendingUsers);
      }

      if (plansResult.success) {
        console.log('📊 [fetchData] Planos encontrados:', plansResult.data.length);
        setPlans(plansResult.data);
      }

      if (usersWithoutSubResult.success) {
        console.log('📊 [fetchData] Usuários sem assinatura encontrados:', usersWithoutSubResult.data.length);
        // Filtrar novamente para garantir que não há admins (dupla verificação)
        const nonAdminUsers = usersWithoutSubResult.data.filter((user: User) => user.role !== 'ADMIN');
        console.log('📊 [fetchData] Usuários sem assinatura (não-admin):', nonAdminUsers.length);
        setUsersWithoutSubscription(nonAdminUsers);
      }
    } catch (error) {
      console.error('💥 [fetchData] Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    const planId = selectedPlans[userId];
    
    if (!planId) {
      alert('Por favor, selecione um plano antes de aprovar o usuário!');
      return;
    }

    setProcessing(userId);
    try {
      console.log('🔍 [handleApproveUser] Aprovando usuário:', userId, 'com plano:', planId);
      
      // Primeiro, aprovar o usuário
      const userResult = await supabaseApiClient.updateUser(userId, { 
        status: 'APPROVED',
        is_active: true
      });
      
      if (!userResult.success) {
        console.error('❌ [handleApproveUser] Erro ao aprovar usuário:', userResult.error);
        alert('Erro ao aprovar usuário: ' + userResult.error);
        return;
      }

      console.log('✅ [handleApproveUser] Usuário aprovado, criando assinatura...');

      // Depois, criar a assinatura
      const subscriptionResult = await supabaseApiClient.createSubscription(userId, planId, 'ADMIN_APPROVAL');
      
      if (subscriptionResult.success) {
        console.log('✅ [handleApproveUser] Assinatura criada com sucesso!');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        // Limpar plano selecionado
        setSelectedPlans(prev => {
          const newPlans = { ...prev };
          delete newPlans[userId];
          return newPlans;
        });
        alert('Usuário aprovado e assinatura criada com sucesso!');
      } else {
        console.error('❌ [handleApproveUser] Erro ao criar assinatura:', subscriptionResult.error);
        // Reverter aprovação do usuário se falhar ao criar assinatura
        await supabaseApiClient.updateUser(userId, { 
          status: 'PENDING',
          is_active: false
        });
        alert('Erro ao criar assinatura: ' + subscriptionResult.error + '\nUsuário mantido como pendente.');
      }
    } catch (error) {
      console.error('💥 [handleApproveUser] Erro geral:', error);
      alert('Erro ao aprovar usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handlePlanSelection = (userId: string, planId: string) => {
    console.log('🔍 [handlePlanSelection] Usuário:', userId, 'Plano selecionado:', planId);
    setSelectedPlans(prev => ({
      ...prev,
      [userId]: planId
    }));
  };

  const handleRejectUser = async (userId: string) => {
    setProcessing(userId);
    try {
      console.log('🔍 [handleRejectUser] Rejeitando usuário:', userId);
      
      const result = await supabaseApiClient.updateUser(userId, { status: 'REJECTED' });
      
      if (result.success) {
        console.log('✅ [handleRejectUser] Usuário rejeitado com sucesso!');
        setPendingUsers(prev => prev.filter(user => user.id !== userId));
        // Limpar plano selecionado
        setSelectedPlans(prev => {
          const newPlans = { ...prev };
          delete newPlans[userId];
          return newPlans;
        });
        alert('Usuário rejeitado com sucesso!');
      } else {
        console.error('❌ [handleRejectUser] Erro ao rejeitar usuário:', result.error);
        alert('Erro ao rejeitar usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleRejectUser] Erro geral:', error);
      alert('Erro ao rejeitar usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handleMoveToPendingForSubscription = async (userId: string) => {
    setProcessing(userId);
    try {
      console.log('🔍 [handleMoveToPendingForSubscription] Movendo usuário para pendente:', userId);
      
      const result = await supabaseApiClient.moveUserToPendingForSubscription(userId);
      
      if (result.success) {
        console.log('✅ [handleMoveToPendingForSubscription] Usuário movido para pendente com sucesso!');
        setUsersWithoutSubscription(prev => prev.filter(user => user.id !== userId));
        setPendingUsers(prev => [...prev, result.data]);
        alert('Usuário movido para pendente para seleção de assinatura!');
      } else {
        console.error('❌ [handleMoveToPendingForSubscription] Erro ao mover usuário:', result.error);
        alert('Erro ao mover usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleMoveToPendingForSubscription] Erro geral:', error);
      alert('Erro ao mover usuário');
    } finally {
      setProcessing(null);
    }
  };


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      case 'SUSPENDED':
        return <Badge className="bg-gray-100 text-gray-800">Suspenso</Badge>;
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
          <span className="text-blue-700 font-semibold">Carregando usuários pendentes...</span>
        </div>
      </div>
    );
  }

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
      
      <div className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header Futurista */}
          <div className="flex items-center gap-6 mb-12">
            <div className="flex items-center gap-4">
              <Button 
                onClick={() => navigate('/admin')} 
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg transition-all duration-300"
                size="sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              <ThemeToggle />
            </div>
            <div className="space-y-2">
              <h1 className="text-4xl font-black text-gray-900">
                SUPREME NOTIFY - APROVAÇÃO
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 text-sm font-semibold">Sistema de Aprovação Ativo</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-800 text-sm font-medium">Controle de Acesso</span>
              </div>
            </div>
          </div>

          {/* Estatísticas Futuristas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/80 dark:bg-gray-800/80 border-yellow-200 dark:border-gray-700 backdrop-blur-sm hover:border-yellow-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-yellow-700">Usuários Pendentes</CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                  <Clock className="h-4 w-4 text-yellow-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{pendingUsers.length}</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-1 rounded-full" style={{width: '60%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm hover:border-blue-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-blue-700">Planos Disponíveis</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Shield className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{plans.length}</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-400 to-blue-600 h-1 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-gray-800/80 border-green-200 dark:border-gray-700 backdrop-blur-sm hover:border-green-400 dark:hover:border-gray-600 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-green-700">Aguardando Aprovação</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Users className="h-4 w-4 text-green-700" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900 mb-1">{pendingUsers.length}</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-400 to-green-600 h-1 rounded-full" style={{width: '75%'}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usuários Sem Assinatura */}
          {usersWithoutSubscription.length > 0 && (
            <Card className="bg-white/80 border-orange-200 backdrop-blur-sm shadow-lg mb-8">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-orange-700 flex items-center gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  Usuários Ativos Sem Assinatura ({usersWithoutSubscription.length})
                </CardTitle>
                <p className="text-sm text-orange-600">
                  Estes usuários estão ativos mas não possuem assinatura. Mova-os para pendente para selecionar um plano.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {usersWithoutSubscription.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 border border-orange-200 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-5 w-5 text-orange-700" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-orange-800">{user.name}</h3>
                          <p className="text-sm text-orange-600 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-orange-100 text-orange-800">Sem Assinatura</Badge>
                        <Button
                          onClick={() => handleMoveToPendingForSubscription(user.id)}
                          size="sm"
                          className="bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-lg transition-all duration-300"
                          disabled={processing === user.id}
                        >
                          {processing === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Users className="h-3 w-3" />}
                          Mover para Pendente
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Usuários Pendentes */}
          {pendingUsers.length === 0 ? (
            <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg">
              <CardContent className="text-center py-12">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-700 mb-2">Nenhum usuário pendente</h3>
                <p className="text-gray-600">Todos os usuários foram processados!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {pendingUsers.map((user) => (
                <Card key={user.id} className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-lg text-blue-800 mb-1 truncate">{user.name}</h3>
                          <p className="text-sm text-blue-600 flex items-center mb-1">
                            <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </p>
                          <p className="text-sm text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                            Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4 lg:items-end xl:items-center">
                        <div className="min-w-0 flex-1 lg:min-w-[200px] xl:min-w-[250px]">
                          <p className="text-sm font-medium text-blue-700 mb-2">Selecionar Plano:</p>
                          <Select
                            value={selectedPlans[user.id] || ''}
                            onValueChange={(value) => handlePlanSelection(user.id, value)}
                            disabled={processing === user.id || plans.length === 0}
                          >
                            <SelectTrigger className="w-full bg-white border-blue-300 text-blue-800 shadow-sm">
                              <SelectValue placeholder="Escolher plano" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-blue-200 shadow-lg">
                              {plans.map((plan) => (
                                <SelectItem key={plan.id} value={plan.id} className="text-blue-800 hover:bg-blue-50 focus:bg-blue-50">
                                  {plan.name} (R$ {plan.price.toFixed(2)})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedPlans[user.id] && (
                            <p className="text-xs text-green-600 mt-1">
                              ✓ Plano selecionado
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-2 min-w-[120px]">
                          <Button
                            onClick={() => handleApproveUser(user.id)}
                            disabled={processing === user.id || plans.length === 0 || !selectedPlans[user.id]}
                            className="bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                            size="sm"
                          >
                            {processing === user.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                            Aprovar
                          </Button>
                          <Button
                            onClick={() => handleRejectUser(user.id)}
                            disabled={processing === user.id}
                            className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg transition-all duration-300 w-full sm:w-auto"
                            size="sm"
                          >
                            {processing === user.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                            Rejeitar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUserApproval;