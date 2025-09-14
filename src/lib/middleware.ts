import { verifyToken } from './auth';

export interface AuthContext {
  user: {
    id: string;
    username: string;
    role: string;
  } | null;
  isAuthenticated: boolean;
}

export function getAuthFromToken(token: string): AuthContext {
  const payload = verifyToken(token);
  
  if (!payload) {
    return {
      user: null,
      isAuthenticated: false
    };
  }

  return {
    user: {
      id: payload.sub,
      username: payload.username,
      role: payload.role
    },
    isAuthenticated: true
  };
}

export function requireAuth(auth: AuthContext) {
  if (!auth.isAuthenticated) {
    throw new Error('Authentication required');
  }
  return auth;
}

export function requireAdmin(auth: AuthContext) {
  requireAuth(auth);
  if (!['ADMIN', 'AGENT'].includes(auth.user!.role)) {
    throw new Error('Admin access required');
  }
  return auth;
}

export function requireRole(role: string) {
  return (auth: AuthContext) => {
    requireAuth(auth);
    if (auth.user!.role !== role) {
      throw new Error(`${role} access required`);
    }
    return auth;
  };
}
