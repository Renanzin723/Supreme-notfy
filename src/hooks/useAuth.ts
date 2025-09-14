import { useState, useEffect } from 'react';
import { getAuthToken, removeAuthToken } from '@/lib/cookies';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
  mustChangePassword: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const tokenData = localStorage.getItem('supreme-notify-token');
    
    if (!tokenData) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
      return;
    }

    try {
      const parsedData = JSON.parse(tokenData);
      const user = parsedData.user;
      
      if (user) {
        setAuthState({
          user: user,
          isAuthenticated: true,
          loading: false
        });
      } else {
        // Token inválido
        removeAuthToken();
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false
        });
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      removeAuthToken();
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  };

  const fetchUserData = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  const login = async (identifier: string, password: string) => {
    // Simular login para demonstração (em produção, isso seria feito com uma API real)
    if (identifier && password) {
      const mockUser = {
        id: '1',
        username: identifier,
        email: `${identifier}@example.com`,
        name: identifier,
        role: 'USER'
      };
      
      const tokenData = {
        token: 'mock-token-' + Date.now(),
        user: mockUser
      };
      
      localStorage.setItem('supreme-notify-token', JSON.stringify(tokenData));
      
      setAuthState({
        user: mockUser,
        isAuthenticated: true,
        loading: false
      });
      
      return { success: true, user: mockUser };
    } else {
      return { success: false, error: 'Credenciais inválidas' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      removeAuthToken();
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth
  };
}
