import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Search, ArrowLeft, Calendar, CreditCard, X, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockApiClient } from '@/lib/api-mock';

interface Subscription {
  id: string;
  userId: string;
  user: {
    id: string;
    username: string;
    name: string;
    email: string;
  };
  status: string;
  plan: string;
  startedAt: string;
  currentPeriodEnd: string;
  remainingDays: number;
  canceledAt: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
}

const AdminSubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');

  const [newSubscription, setNewSubscription] = useState({
    userId: '',
    plan: 'manual',
    startedAt: new Date().toISOString().split('T')[0],
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'ACTIVE',
    cancelAtPeriodEnd: false
  });

  const [users, setUsers] = useState<Array<{id: string, username: string, name: string}>>([]);

  useEffect(() => {
    checkAuthAndFetchData();
  }, [searchTerm, statusFilter, planFilter, page]);

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
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const result = await mockApiClient.getSubscriptions({
        page: page.toString(),
        pageSize: '10',
        ...(statusFilter && { status: statusFilter }),
        ...(planFilter && { plan: planFilter })
      });

      if (result.success) {
        setSubscriptions(result.data.subscriptions);
        setTotalPages(result.data.pagination.totalPages);
      } else {
        setError('Erro ao carregar assinaturas');
      }
    } catch (err) {
      setError('Erro de conexão');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await mockApiClient.getUsers({ pageSize: '100' });
      if (result.success) {
        setUsers(result.data.users);
      }
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError('');

    try {
      const result = await mockApiClient.createSubscription(newSubscription);

      if (result.success) {
        setShowCreateDialog(false);
        setNewSubscription({
          userId: '',
          plan: 'manual',
          startedAt: new Date().toISOString().split('T')[0],
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'ACTIVE',
          cancelAtPeriodEnd: false
        });
        fetchSubscriptions();
      } else {
        setCreateError(result.error || 'Erro ao criar assinatura');
      }
    } catch (err) {
      setCreateError('Erro de conexão');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja cancelar esta assinatura?')) return;

    try {
      const result = await mockApiClient.cancelSubscription(subscriptionId, true);

      if (result.success) {
        alert('Assinatura cancelada com sucesso!');
        fetchSubscriptions();
      } else {
        alert('Erro ao cancelar assinatura');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    if (!confirm('Tem certeza que deseja reativar esta assinatura?')) return;

    try {
      const result = await mockApiClient.reactivateSubscription(subscriptionId);

      if (result.success) {
        alert('Assinatura reativada com sucesso!');
        fetchSubscriptions();
      } else {
        alert('Erro ao reativar assinatura');
      }
    } catch (err) {
      alert('Erro de conexão');
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'default';
      case 'TRIALING': return 'secondary';
      case 'PAST_DUE': return 'destructive';
      case 'CANCELED': return 'outline';
      case 'EXPIRED': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Ativa';
      case 'TRIALING': return 'Trial';
      case 'PAST_DUE': return 'Em Atraso';
      case 'CANCELED': return 'Cancelada';
      case 'EXPIRED': return 'Expirada';
      default: return status;
    }
  };

  if (loading && subscriptions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => navigate('/admin')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Gerenciar Assinaturas</h1>
                <p className="text-sm text-gray-700 font-medium">Administrar assinaturas do sistema</p>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Assinatura
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Assinatura</DialogTitle>
                  <DialogDescription>
                    Crie uma nova assinatura para um usuário
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateSubscription} className="space-y-4">
                  {createError && (
                    <Alert variant="destructive">
                      <AlertDescription>{createError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="userId">Usuário *</Label>
                    <Select value={newSubscription.userId} onValueChange={(value) => setNewSubscription(prev => ({ ...prev, userId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um usuário" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name || user.username} (@{user.username})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="plan">Plano *</Label>
                    <Input
                      id="plan"
                      value={newSubscription.plan}
                      onChange={(e) => setNewSubscription(prev => ({ ...prev, plan: e.target.value }))}
                      placeholder="Digite o nome do plano"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startedAt">Data de Início *</Label>
                      <Input
                        id="startedAt"
                        type="date"
                        value={newSubscription.startedAt}
                        onChange={(e) => setNewSubscription(prev => ({ ...prev, startedAt: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentPeriodEnd">Data de Vencimento *</Label>
                      <Input
                        id="currentPeriodEnd"
                        type="date"
                        value={newSubscription.currentPeriodEnd}
                        onChange={(e) => setNewSubscription(prev => ({ ...prev, currentPeriodEnd: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={newSubscription.status} onValueChange={(value) => setNewSubscription(prev => ({ ...prev, status: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Ativa</SelectItem>
                        <SelectItem value="TRIALING">Trial</SelectItem>
                        <SelectItem value="PAST_DUE">Em Atraso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={createLoading}>
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Criando...
                        </>
                      ) : (
                        'Criar'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-gray-800 font-semibold">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar por usuário..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="status" className="text-gray-800 font-semibold">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todos os status</SelectItem>
                    <SelectItem value="ACTIVE">Ativa</SelectItem>
                    <SelectItem value="TRIALING">Trial</SelectItem>
                    <SelectItem value="PAST_DUE">Em Atraso</SelectItem>
                    <SelectItem value="CANCELED">Cancelada</SelectItem>
                    <SelectItem value="EXPIRED">Expirada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="plan" className="text-gray-800 font-semibold">Plano</Label>
                <Input
                  id="plan"
                  placeholder="Filtrar por plano"
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de assinaturas */}
        <Card>
          <CardHeader>
            <CardTitle>Assinaturas ({subscriptions.length})</CardTitle>
            <CardDescription>
              Lista de todas as assinaturas do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{subscription.user.name || subscription.user.username}</h3>
                        <Badge variant={getStatusBadgeVariant(subscription.status)}>
                          {getStatusText(subscription.status)}
                        </Badge>
                        <Badge variant="outline">
                          {subscription.plan}
                        </Badge>
                        {subscription.remainingDays <= 7 && subscription.status === 'ACTIVE' && (
                          <Badge variant="destructive">
                            Expira em {subscription.remainingDays} dias
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>@{subscription.user.username}</p>
                        <p>Início: {new Date(subscription.startedAt).toLocaleDateString('pt-BR')}</p>
                        <p>Vencimento: {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</p>
                        <p>Dias restantes: {subscription.remainingDays}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {subscription.status === 'ACTIVE' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancelSubscription(subscription.id)}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                      )}
                      {(subscription.status === 'CANCELED' || subscription.status === 'EXPIRED') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateSubscription(subscription.id)}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Reativar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}

                {subscriptions.length === 0 && !loading && (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma assinatura encontrada
                  </div>
                )}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-3 text-sm text-muted-foreground">
                    Página {page} de {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                  >
                    Próxima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSubscriptions;
