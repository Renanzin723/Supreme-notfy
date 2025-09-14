import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, UserPlus, Mail, User, Lock, Shield, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabaseApiClient } from '@/lib/supabase-api';
import ThemeToggle from '@/components/ThemeToggle';

const AdminCreateUser: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN' | 'AGENT',
    status: 'PENDING' as 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    // Verificar autenticação
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
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      navigate('/admin/login');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await supabaseApiClient.createUser(formData);
      if (result.success) {
        alert('Usuário criado com sucesso!');
        navigate('/admin');
      } else {
        alert('Erro ao criar usuário: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
      
      <div className="relative z-10 p-6">
        <div className="max-w-4xl mx-auto">
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
                CRIAR NOVO USUÁRIO
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 text-sm font-semibold">Sistema de Cadastro Ativo</span>
                <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                <span className="text-gray-800 text-sm font-medium">Gerenciamento de Usuários</span>
              </div>
            </div>
          </div>

          {/* Formulário Futurista */}
          <Card className="bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-gray-700 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl">
                  <UserPlus className="h-6 w-6 text-blue-700" />
                </div>
                <span className="text-gray-900 font-bold">
                  Dados do Usuário
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-gray-800 font-semibold">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      placeholder="Nome do usuário" 
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-800 font-semibold">Nome de Usuário</Label>
                    <Input 
                      id="username" 
                      value={formData.username} 
                      onChange={handleChange} 
                      placeholder="username" 
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-800 font-semibold">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={formData.email} 
                      onChange={handleChange} 
                      placeholder="email@exemplo.com" 
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-800 font-semibold">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={formData.password} 
                      onChange={handleChange} 
                      placeholder="********" 
                      className="border-blue-200 focus:border-blue-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-800 font-semibold">Função</Label>
                    <Select value={formData.role} onValueChange={(value) => handleSelectChange('role', value)}>
                      <SelectTrigger id="role" className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Selecionar função" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">Usuário</SelectItem>
                        <SelectItem value="AGENT">Agente</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-gray-800 font-semibold">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                      <SelectTrigger id="status" className="border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder="Selecionar status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="APPROVED">Aprovado</SelectItem>
                        <SelectItem value="REJECTED">Rejeitado</SelectItem>
                        <SelectItem value="SUSPENDED">Suspenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 shadow-lg shadow-blue-500/25 transition-all duration-300"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Criando...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Criar Usuário
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/admin')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminCreateUser;