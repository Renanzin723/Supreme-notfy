import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';

const SupabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'connected' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      setError('');

      // Testar conexão básica
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(5);

      if (error) {
        setConnectionStatus('error');
        setError(`Erro: ${error.message}`);
        return;
      }

      setConnectionStatus('connected');
      setUsers(data || []);
    } catch (err) {
      setConnectionStatus('error');
      setError(`Erro de conexão: ${err}`);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'testing':
        return <Badge className="bg-yellow-100 text-yellow-800">Testando...</Badge>;
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Erro</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-background to-green-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-blue-700">🧪 Teste de Conexão Supabase</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="font-medium">Status da Conexão:</span>
                {getStatusBadge()}
              </div>

              {connectionStatus === 'error' && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 font-medium">Erro de Conexão:</p>
                  <p className="text-red-600 text-sm mt-1">{error}</p>
                </div>
              )}

              {connectionStatus === 'connected' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 font-medium">✅ Conexão bem-sucedida!</p>
                  <p className="text-green-600 text-sm mt-1">
                    Encontrados {users.length} usuários na tabela.
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={testConnection} variant="outline">
                  Testar Novamente
                </Button>
                <Button onClick={() => window.location.href = '/admin/login'}>
                  Ir para Login Admin
                </Button>
              </div>

              {users.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Usuários encontrados:</h3>
                  <div className="space-y-2">
                    {users.map((user) => (
                      <div key={user.id} className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <Badge variant="outline" className="mt-1">
                          {user.role}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SupabaseTest;
