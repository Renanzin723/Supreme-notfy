import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

export const ProtectedRoute = ({ children, requireAuth = true, adminOnly = false }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      try {
        // Verificar token no localStorage
        const tokenData = localStorage.getItem('supreme-notify-token');
        
        if (!tokenData && requireAuth) {
          navigate('/login');
          return;
        }

        if (tokenData) {
          const parsedData = JSON.parse(tokenData);
          const user = parsedData.user;

          if (adminOnly && user?.role !== 'ADMIN' && user?.role !== 'AGENT') {
            navigate('/login');
            return;
          }
          
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        if (requireAuth) {
          navigate('/login');
          return;
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate, requireAuth, adminOnly]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null; // Será redirecionado para login
  }

  return <>{children}</>;
};
