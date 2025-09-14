// Mock das APIs para desenvolvimento
// Em produção, estas seriam substituídas por chamadas reais para o backend

// Função simples para gerar token mock (sem dependências do Node.js)
function generateMockToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadEncoded = btoa(JSON.stringify(payload));
  const signature = btoa('mock-signature');
  return `${header}.${payloadEncoded}.${signature}`;
}

// Mock do banco de dados em memória para desenvolvimento
let mockUsers: any[] = [
  {
    id: 'admin-1',
    username: 'renan7rlk',
    email: 'admin@supremenotify.com',
    name: 'Administrador',
    passwordHash: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8Qz8Qz8', // Bet220412$
    role: 'ADMIN',
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user-1',
    username: 'usuario',
    email: 'usuario@teste.com',
    name: 'Usuário Teste',
    passwordHash: 'senha123',
    role: 'USER',
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'user-2',
    username: 'cliente',
    email: 'cliente@teste.com',
    name: 'Cliente Teste',
    passwordHash: '123456',
    role: 'USER',
    mustChangePassword: false,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

let mockSubscriptions: any[] = [
  {
    id: 'sub-1',
    userId: 'admin-1',
    status: 'ACTIVE',
    plan: 'admin',
    startedAt: new Date(),
    currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    canceledAt: null,
    cancelAtPeriodEnd: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export class MockApiClient {
  async login(identifier: string, password: string) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = mockUsers.find(u => 
      u.username === identifier || u.email === identifier
    );

    if (!user) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    // Verificar senha (em produção, usaria bcrypt.compare)
    let isValidPassword = false;
    
    if (user.username === 'renan7rlk') {
      // Admin - aceitar ambas as senhas
      isValidPassword = password === 'Bet220412$' || password === 'senha123';
    } else if (user.username === 'usuario') {
      // Usuário teste
      isValidPassword = password === 'senha123';
    } else if (user.username === 'cliente') {
      // Cliente teste
      isValidPassword = password === '123456';
    } else {
      // Outros usuários - senha padrão
      isValidPassword = password === 'senha123';
    }
    
    if (!isValidPassword) {
      return { success: false, error: 'Credenciais inválidas' };
    }

    const token = generateMockToken({
      sub: user.id,
      role: user.role,
      username: user.username
    });

    // Simular cookie (sem HttpOnly para permitir acesso no frontend)
    document.cookie = `supreme-notify-token=${token}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          name: user.name,
          role: user.role,
          mustChangePassword: user.mustChangePassword
        }
      }
    };
  }

  async logout() {
    document.cookie = 'supreme-notify-token=; Path=/; Max-Age=0; SameSite=Lax';
    return { success: true };
  }

  async getMe() {
    const token = this.getTokenFromCookie();
    if (!token) {
      return { success: false, error: 'Token não fornecido' };
    }

    // Simular verificação de token
    const user = mockUsers.find(u => u.id === 'admin-1'); // Simplificado
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    return {
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        mustChangePassword: user.mustChangePassword
      }
    };
  }

  async getLicenseStatus() {
    const token = this.getTokenFromCookie();
    if (!token) {
      return { success: false, error: 'Token não fornecido' };
    }

    const user = mockUsers.find(u => u.id === 'admin-1');
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const subscription = mockSubscriptions.find(s => s.userId === user.id);
    const now = new Date();
    
    const active = subscription && 
      subscription.status === 'ACTIVE' && 
      subscription.currentPeriodEnd >= now;

    const remainingDays = subscription 
      ? Math.max(0, Math.ceil((subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      success: true,
      data: {
        active,
        plan: subscription?.plan || null,
        currentPeriodEnd: subscription?.currentPeriodEnd || null,
        remainingDays,
        status: subscription?.status || null
      }
    };
  }

  async getUsers(params: Record<string, string> = {}) {
    const { q, role, page = '1', pageSize = '10' } = params;
    
    let filteredUsers = [...mockUsers];
    
    if (q) {
      filteredUsers = filteredUsers.filter(user => 
        user.username.includes(q) || 
        user.email?.includes(q) || 
        user.name?.includes(q)
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;

    const users = filteredUsers.slice(startIndex, endIndex).map(user => ({
      ...user,
      activeSubscriptions: mockSubscriptions.filter(s => s.userId === user.id && s.status === 'ACTIVE').length
    }));

    return {
      success: true,
      data: {
        users,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total: filteredUsers.length,
          totalPages: Math.ceil(filteredUsers.length / pageSizeNum)
        }
      }
    };
  }

  async createUser(userData: any) {
    const { username, email, name, password } = userData;

    if (!username) {
      return { success: false, error: 'Username é obrigatório' };
    }

    const existingUser = mockUsers.find(u => u.username === username);
    if (existingUser) {
      return { success: false, error: 'Username já existe' };
    }

    if (email) {
      const existingEmail = mockUsers.find(u => u.email === email);
      if (existingEmail) {
        return { success: false, error: 'Email já existe' };
      }
    }

    const newUser = {
      id: `user-${Date.now()}`,
      username,
      email,
      name,
      passwordHash: password || 'senha123', // Simplificado
      role: 'USER',
      mustChangePassword: !password,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockUsers.push(newUser);

    return {
      success: true,
      data: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        mustChangePassword: newUser.mustChangePassword
      }
    };
  }

  async getSubscriptions(params: Record<string, string> = {}) {
    const { status, plan, page = '1', pageSize = '10' } = params;
    
    let filteredSubscriptions = [...mockSubscriptions];
    
    if (status) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.status === status);
    }
    
    if (plan) {
      filteredSubscriptions = filteredSubscriptions.filter(sub => sub.plan.includes(plan));
    }

    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);
    const startIndex = (pageNum - 1) * pageSizeNum;
    const endIndex = startIndex + pageSizeNum;

    const subscriptions = filteredSubscriptions.slice(startIndex, endIndex).map(sub => {
      const user = mockUsers.find(u => u.id === sub.userId);
      const now = new Date();
      const remainingDays = Math.max(0, Math.ceil((sub.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
      
      return {
        ...sub,
        user: user ? {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email
        } : null,
        remainingDays
      };
    });

    return {
      success: true,
      data: {
        subscriptions,
        pagination: {
          page: pageNum,
          pageSize: pageSizeNum,
          total: filteredSubscriptions.length,
          totalPages: Math.ceil(filteredSubscriptions.length / pageSizeNum)
        }
      }
    };
  }

  async createSubscription(subscriptionData: any) {
    const { userId, plan, startedAt, currentPeriodEnd, status = 'ACTIVE', cancelAtPeriodEnd = false } = subscriptionData;

    if (!userId || !plan || !startedAt || !currentPeriodEnd) {
      return { success: false, error: 'userId, plan, startedAt e currentPeriodEnd são obrigatórios' };
    }

    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    const newSubscription = {
      id: `sub-${Date.now()}`,
      userId,
      plan,
      status,
      startedAt: new Date(startedAt),
      currentPeriodEnd: new Date(currentPeriodEnd),
      canceledAt: null,
      cancelAtPeriodEnd,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    mockSubscriptions.push(newSubscription);

    return {
      success: true,
      data: {
        ...newSubscription,
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          email: user.email
        }
      }
    };
  }

  async getMetricsSummary() {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const activeUsers = mockUsers.filter(u => u.isActive).length;
    const activeSubscriptions = mockSubscriptions.filter(s => s.status === 'ACTIVE' && s.currentPeriodEnd >= now).length;
    const newUsers7d = mockUsers.filter(u => u.createdAt >= sevenDaysAgo).length;
    const newUsers30d = mockUsers.filter(u => u.createdAt >= thirtyDaysAgo).length;
    const churn30d = mockSubscriptions.filter(s => s.status === 'CANCELED' && s.canceledAt >= thirtyDaysAgo).length;
    const trials = mockSubscriptions.filter(s => s.status === 'TRIALING').length;
    const pastDue = mockSubscriptions.filter(s => s.status === 'PAST_DUE').length;
    const expiringIn7Days = mockSubscriptions.filter(s => 
      s.status === 'ACTIVE' && 
      s.currentPeriodEnd >= now && 
      s.currentPeriodEnd <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    ).length;

    return {
      success: true,
      data: {
        activeUsers,
        activeSubscriptions,
        mrr: 'N/A',
        newUsers7d,
        newUsers30d,
        churn30d,
        trials,
        pastDue,
        expiringIn7Days
      }
    };
  }

  private getTokenFromCookie(): string | null {
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('supreme-notify-token=')
    );
    return tokenCookie ? tokenCookie.split('=')[1] : null;
  }
}

export const mockApiClient = new MockApiClient();
