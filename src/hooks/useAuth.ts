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
    const token = getAuthToken();
    if (!token) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false
      });
      return;
    }

    try {
      // Verificar se o token é válido fazendo uma requisição para a API
      const response = await fetch('/api/license/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Token válido, buscar dados do usuário
        const userData = await fetchUserData(token);
        setAuthState({
          user: userData,
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
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ identifier, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setAuthState({
          user: data.user,
          isAuthenticated: true,
          loading: false
        });
        return { success: true, user: data.user };
      } else {
        const error = await response.json();
        return { success: false, error: error.error };
      }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' };
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
