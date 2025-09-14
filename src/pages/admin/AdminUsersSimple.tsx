import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Users, Mail, Calendar, Shield, Loader2, Edit, Trash2, Ban, Key, UserCheck, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApiClient } from '@/lib/supabase-api';
import { User } from '@/lib/supabase';

const AdminUsersSimple: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'AGENT',
    status: 'APPROVED' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  });
  const [processing, setProcessing] = useState<string | null>(null);

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
      await fetchUsers();
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const fetchUsers = async () => {
    try {
      console.log('🔍 [fetchUsers] Buscando usuários...');
      const result = await supabaseApiClient.getUsers();
      if (result.success) {
        console.log('✅ [fetchUsers] Usuários carregados:', result.data?.length || 0);
        setUsers(result.data);
      } else {
        console.error('❌ [fetchUsers] Erro ao buscar usuários:', result.error);
      }
    } catch (error) {
      console.error('💥 [fetchUsers] Erro geral:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshUsers = async () => {
    try {
      console.log('🔄 [refreshUsers] Recarregando lista de usuários...');
      const result = await supabaseApiClient.getUsers();
      if (result.success) {
        setUsers(result.data);
        console.log('✅ [refreshUsers] Lista atualizada com sucesso!');
        console.log('📊 [refreshUsers] Usuários carregados:', result.data?.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          status: u.status,
          is_active: u.is_active,
          role: u.role
        })));
      }
    } catch (error) {
      console.error('💥 [refreshUsers] Erro ao recarregar:', error);
    }
  };


  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>;
      case 'AGENT':
        return <Badge className="bg-blue-100 text-blue-800">Agent</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">User</Badge>;
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditForm({
      email: user.email,
      password: '',
      role: user.role,
      status: user.status
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    
    setProcessing(editingUser.id);
    try {
      const updateData: any = {
        email: editForm.email,
        role: editForm.role,
        status: editForm.status,
        is_active: editForm.status === 'APPROVED' // Atualizar is_active baseado no status
      };

      // Se uma nova senha foi fornecida, adicionar ao updateData
      if (editForm.password && editForm.password.trim() !== '') {
        updateData.password_hash = editForm.password; // Usar password_hash conforme o banco
      }

      console.log('🔍 [handleUpdateUser] Atualizando usuário:', editingUser.id, 'com dados:', updateData);

      const result = await supabaseApiClient.updateUser(editingUser.id, updateData);
      
      if (result.success) {
        setEditingUser(null);
        alert('Usuário atualizado com sucesso!');
        // Recarregar lista para garantir sincronização
        await refreshUsers();
      } else {
        console.error('❌ [handleUpdateUser] Erro na atualização:', result.error);
        alert('Erro ao atualizar usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleUpdateUser] Erro geral:', error);
      alert('Erro ao atualizar usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      return;
    }

    setProcessing(userId);
    try {
      console.log('🔍 [handleDeleteUser] Excluindo usuário:', userId);
      
      const result = await supabaseApiClient.deleteUser(userId);
      
      if (result.success) {
        alert('Usuário excluído com sucesso!');
        // Recarregar lista para garantir sincronização
        await refreshUsers();
      } else {
        console.error('❌ [handleDeleteUser] Erro na exclusão:', result.error);
        alert('Erro ao excluir usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleDeleteUser] Erro geral:', error);
      alert('Erro ao excluir usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handleBanUser = async (userId: string) => {
    if (!confirm('Tem certeza que deseja banir este usuário?')) {
      return;
    }

    setProcessing(userId);
    try {
      console.log('🔍 [handleBanUser] Banindo usuário:', userId);
      
      const result = await supabaseApiClient.updateUser(userId, { 
        status: 'SUSPENDED',
        is_active: false 
      });
      
      if (result.success) {
        alert('Usuário banido com sucesso!');
        // Recarregar lista para garantir sincronização
        await refreshUsers();
      } else {
        console.error('❌ [handleBanUser] Erro no banimento:', result.error);
        alert('Erro ao banir usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleBanUser] Erro geral:', error);
      alert('Erro ao banir usuário');
    } finally {
      setProcessing(null);
    }
  };

  const handleUnbanUser = async (userId: string) => {
    setProcessing(userId);
    try {
      console.log('🔍 [handleUnbanUser] Desbanindo usuário:', userId);
      
      const result = await supabaseApiClient.updateUser(userId, { 
        status: 'APPROVED',
        is_active: true 
      });
      
      if (result.success) {
        alert('Usuário desbanido com sucesso!');
        // Recarregar lista para garantir sincronização
        await refreshUsers();
      } else {
        console.error('❌ [handleUnbanUser] Erro no desbanimento:', result.error);
        alert('Erro ao desbanir usuário: ' + result.error);
      }
    } catch (error) {
      console.error('💥 [handleUnbanUser] Erro geral:', error);
      alert('Erro ao desbanir usuário');
    } finally {
      setProcessing(null);
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
          <span className="text-blue-600 font-medium">Carregando usuários...</span>
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
                GERENCIAR USUÁRIOS
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-blue-600 text-sm font-medium">Sistema de Usuários Ativo</span>
                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                <span className="text-gray-600 text-sm">Controle Total</span>
              </div>
            </div>
          </div>

          {/* Estatísticas Futuristas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Total de Usuários</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">{users.length}</div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '90%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-green-200 backdrop-blur-sm hover:border-green-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-600">Usuários Ativos</CardTitle>
                <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {users.filter(u => u.is_active).length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-1 rounded-full" style={{width: '85%'}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 border-blue-200 backdrop-blur-sm hover:border-blue-400 transition-all duration-300 group shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-600">Administradores</CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-800 mb-1">
                  {users.filter(u => u.role === 'ADMIN').length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-1 rounded-full" style={{width: '70%'}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Usuários */}
          <Card className="bg-white/80 border-blue-200 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <CardTitle className="text-xl font-bold text-gray-900">Lista de Usuários</CardTitle>
                <Button
                  onClick={refreshUsers}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg transition-all duration-300 w-full sm:w-auto"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Atualizar Lista
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors gap-4">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center flex-shrink-0">
                        <Users className="h-5 w-5 text-blue-700" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-blue-800 truncate">{user.name}</h3>
                        <p className="text-sm text-blue-600 flex items-center">
                          <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </p>
                        <p className="text-sm text-gray-500 flex items-center">
                          <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                          Criado em {new Date(user.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-start sm:items-center lg:items-end xl:items-center gap-3">
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        {getRoleBadge(user.role)}
                        <Badge variant={user.is_active ? "default" : "secondary"}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEditUser(user)}
                          size="sm"
                          className="bg-blue-500 hover:bg-blue-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                          disabled={processing === user.id}
                          title="Editar Usuário"
                        >
                          {processing === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Edit className="h-3 w-3" />}
                        </Button>
                        <Button
                          onClick={() => user.is_active ? handleBanUser(user.id) : handleUnbanUser(user.id)}
                          size="sm"
                          className={`${user.is_active ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"} text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8`}
                          disabled={processing === user.id}
                          title={user.is_active ? "Banir Usuário" : "Desbanir Usuário"}
                        >
                          {processing === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : user.is_active ? <Ban className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        </Button>
                        <Button
                          onClick={() => handleDeleteUser(user.id)}
                          size="sm"
                          className="bg-red-500 hover:bg-red-600 text-white border-0 shadow-lg transition-all duration-300 min-w-[40px] h-8"
                          disabled={processing === user.id}
                          title="Excluir Usuário"
                        >
                          {processing === user.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Modal de Edição de Usuário */}
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="bg-white/90 backdrop-blur-sm border-blue-200 shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-blue-700 flex items-center gap-2">
                  <Edit className="h-6 w-6" />
                  Editar Usuário
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-blue-200 focus:border-blue-400 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-password">Nova Senha (opcional)</Label>
                  <Input
                    id="edit-password"
                    type="password"
                    value={editForm.password}
                    onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Deixe em branco para manter a senha atual"
                    className="bg-white border-blue-200 focus:border-blue-400 shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Função</Label>
                  <Select value={editForm.role} onValueChange={(value) => setEditForm(prev => ({ ...prev, role: value as 'USER' | 'ADMIN' | 'AGENT' }))}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                      <SelectValue placeholder="Selecionar função" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-lg">
                      <SelectItem value="USER" className="hover:bg-blue-50 focus:bg-blue-50">Usuário</SelectItem>
                      <SelectItem value="AGENT" className="hover:bg-blue-50 focus:bg-blue-50">Agente</SelectItem>
                      <SelectItem value="ADMIN" className="hover:bg-blue-50 focus:bg-blue-50">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select value={editForm.status} onValueChange={(value) => setEditForm(prev => ({ ...prev, status: value as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' }))}>
                    <SelectTrigger className="bg-white border-blue-200 focus:border-blue-400 shadow-sm">
                      <SelectValue placeholder="Selecionar status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-blue-200 shadow-lg">
                      <SelectItem value="PENDING" className="hover:bg-blue-50 focus:bg-blue-50">Pendente</SelectItem>
                      <SelectItem value="APPROVED" className="hover:bg-blue-50 focus:bg-blue-50">Aprovado</SelectItem>
                      <SelectItem value="REJECTED" className="hover:bg-blue-50 focus:bg-blue-50">Rejeitado</SelectItem>
                      <SelectItem value="SUSPENDED" className="hover:bg-blue-50 focus:bg-blue-50">Suspenso</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={handleUpdateUser}
                    disabled={processing === editingUser?.id}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    {processing === editingUser?.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Atualizando...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4 mr-2" />
                        Atualizar Usuário
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => setEditingUser(null)}
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

export default AdminUsersSimple;