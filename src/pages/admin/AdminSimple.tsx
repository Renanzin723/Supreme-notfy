import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '@/components/ThemeToggle';

const AdminSimple: React.FC = () => {
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>
        <Card className="mb-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-900 font-bold">🎉 Supreme Notify - Painel Admin</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4 font-medium">
              Se você está vendo esta página, o acesso ao painel admin está funcionando corretamente!
            </p>
            <div className="space-y-2">
              <Button onClick={() => navigate('/admin')} className="w-full">
                Ir para Dashboard Completo
              </Button>
              <Button onClick={() => navigate('/brand')} variant="outline" className="w-full">
                Voltar para Seleção de Marcas
              </Button>
              <Button onClick={() => navigate('/login')} variant="outline" className="w-full">
                Fazer Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminSimple;
