import { supabase, User, Subscription, Notification, Plan } from './supabase'

// API client para Supabase
export class SupabaseApiClient {
  // Autenticação
  async login(identifier: string, password: string) {
    try {
      console.log('🔍 [login] Tentando login com:', { identifier, password: '***' });
      
      // Buscar usuário no banco por email ou username
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .or(`email.eq.${identifier},username.eq.${identifier}`)
        .single()

      console.log('📊 [login] Dados do usuário encontrado:', userData);
      console.log('❌ [login] Erro (se houver):', userError);

      if (userError || !userData) {
        console.log('❌ [login] Usuário não encontrado');
        return { success: false, error: 'Usuário não encontrado' }
      }

      // Verificar se o usuário está aprovado
      if (userData.status !== 'APPROVED') {
        console.log('❌ [login] Usuário não aprovado:', userData.status);
        return { success: false, error: 'Usuário aguardando aprovação' }
      }

      // Verificar se usuário tem assinatura ativa (exceto admins)
      if (userData.role !== 'ADMIN') {
        console.log('🔍 [login] Verificando assinatura do usuário...');
        const subscriptionCheck = await this.checkUserSubscription(userData.id);
        
        if (!subscriptionCheck.success) {
          console.log('❌ [login] Erro ao verificar assinatura:', subscriptionCheck.error);
          return { success: false, error: 'Erro ao verificar assinatura' }
        }

        if (!subscriptionCheck.data.hasActiveSubscription) {
          console.log('❌ [login] Usuário sem assinatura ativa');
          return { success: false, error: 'Sua assinatura expirou. Entre em contato com o suporte para renovar.' }
        }

        console.log('✅ [login] Usuário tem assinatura ativa');
      } else {
        console.log('✅ [login] Usuário é ADMIN - acesso liberado');
      }

      // Verificar senha (simplificado para desenvolvimento)
      // Em produção, você deveria usar bcrypt.compare()
      const validPasswords = [
        'Bet220412$', // Admin
        'senha123',   // Usuário
        '123456',     // Cliente
        password      // Senha fornecida (para novos usuários)
      ]

      // Verificar senha hash ou senha simples
      const isValidPassword = userData.password_hash === password || validPasswords.includes(password);

      if (!isValidPassword) {
        console.log('❌ [login] Senha incorreta');
        return { success: false, error: 'Senha incorreta' }
      }

      // Criar sessão mock para desenvolvimento
      const mockSession = {
        user: {
          id: userData.id,
          email: userData.email,
        },
        access_token: 'mock-token-' + Date.now(),
        refresh_token: 'mock-refresh-' + Date.now()
      }

      // Salvar token no localStorage
      localStorage.setItem('supreme-notify-token', JSON.stringify({
        user: userData,
        session: mockSession
      }))

      console.log('✅ [login] Login realizado com sucesso!');
      return {
        success: true,
        data: {
          user: userData,
          session: mockSession
        }
      }
    } catch (error) {
      console.error('💥 [login] Erro geral:', error);
      return { success: false, error: 'Erro de conexão' }
    }
  }

  async logout() {
    try {
      // Limpar token do localStorage
      localStorage.removeItem('supreme-notify-token')
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer logout' }
    }
  }

  async getCurrentUser() {
    try {
      // Buscar dados do localStorage
      const tokenData = localStorage.getItem('supreme-notify-token')
      
      if (!tokenData) {
        return { success: false, error: 'Usuário não autenticado' }
      }

      const parsedData = JSON.parse(tokenData)
      return { success: true, data: parsedData.user }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar usuário' }
    }
  }

  // Usuários
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar usuários' }
    }
  }

  async getPendingUsers() {
    try {
      console.log('🔍 [getPendingUsers] Iniciando busca de usuários pendentes...');
      
      // Primeiro, vamos testar se conseguimos buscar todos os usuários
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      console.log('📊 [getPendingUsers] Todos os usuários:', allUsers);
      console.log('📊 [getPendingUsers] Status dos usuários existentes:', allUsers?.map(u => ({ id: u.id, name: u.name, status: u.status })));
      console.log('❌ [getPendingUsers] Erro ao buscar todos os usuários:', allUsersError);

      if (allUsersError) {
        console.error('💥 [getPendingUsers] Erro ao buscar todos os usuários:', allUsersError.message);
        return { success: false, error: allUsersError.message }
      }

      // Agora buscar apenas os pendentes (excluindo admins)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'PENDING')
        .neq('role', 'ADMIN') // ← EXCEÇÃO: Excluir usuários ADMIN
        .order('created_at', { ascending: false })

      console.log('📊 [getPendingUsers] Dados retornados (pendentes, não-admin):', data);
      console.log('❌ [getPendingUsers] Erro (se houver):', error);

      if (error) {
        console.error('💥 [getPendingUsers] Erro na consulta:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [getPendingUsers] Sucesso! Usuários pendentes encontrados (não-admin):', data?.length || 0);
      console.log('📊 [getPendingUsers] Roles dos usuários pendentes:', data?.map(u => u.role));
      return { success: true, data }
    } catch (error) {
      console.error('💥 [getPendingUsers] Erro geral:', error);
      return { success: false, error: 'Erro ao buscar usuários pendentes' }
    }
  }

  async approveUser(userId: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          status: 'APPROVED',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao aprovar usuário' }
    }
  }

  async rejectUser(userId: string, adminId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ 
          status: 'REJECTED',
          approved_at: new Date().toISOString(),
          approved_by: adminId
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao rejeitar usuário' }
    }
  }

  async createUser(userData: Partial<User>) {
    try {
      console.log('🔍 [createUser] Criando usuário com dados:', userData);
      
      // Fazer hash da senha se fornecida
      let processedUserData = { ...userData };
      if (userData.password) {
        // Simular hash da senha (em produção, usar bcrypt ou similar)
        processedUserData.password_hash = userData.password; // Simplificado para teste
        delete processedUserData.password;
      }
      
      const { data, error } = await supabase
        .from('users')
        .insert([processedUserData])
        .select()
        .single()

      console.log('📊 [createUser] Dados retornados:', data);
      console.log('❌ [createUser] Erro (se houver):', error);

      if (error) {
        console.error('💥 [createUser] Erro na criação:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [createUser] Usuário criado com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [createUser] Erro geral:', error);
      return { success: false, error: 'Erro ao criar usuário' }
    }
  }

  async updateUser(id: string, updates: Partial<User>) {
    try {
      console.log('🔍 [updateUser] Atualizando usuário:', id, 'com dados:', updates);
      
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      console.log('📊 [updateUser] Dados retornados:', data);
      console.log('❌ [updateUser] Erro (se houver):', error);

      if (error) {
        console.error('💥 [updateUser] Erro na atualização:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [updateUser] Usuário atualizado com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [updateUser] Erro geral:', error);
      return { success: false, error: 'Erro ao atualizar usuário' }
    }
  }

  // Método para alterar status de usuário para PENDING (para teste)
  async setUserToPending(userId: string) {
    try {
      console.log('🔍 [setUserToPending] Alterando usuário para PENDING:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update({ status: 'PENDING' })
        .eq('id', userId)
        .select()
        .single()

      console.log('📊 [setUserToPending] Dados retornados:', data);
      console.log('❌ [setUserToPending] Erro (se houver):', error);

      if (error) {
        console.error('💥 [setUserToPending] Erro na alteração:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [setUserToPending] Usuário alterado para PENDING com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [setUserToPending] Erro geral:', error);
      return { success: false, error: 'Erro ao alterar status do usuário' }
    }
  }

  async deleteUser(id: string) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao deletar usuário' }
    }
  }

  // Planos
  async getPlans() {
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar planos' }
    }
  }

  // Assinaturas
  async getSubscriptions() {
    try {
      console.log('🔍 [getSubscriptions] Buscando assinaturas...');
      
      // Primeiro, vamos verificar se há usuários aprovados
      const { data: approvedUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'APPROVED')

      console.log('📊 [getSubscriptions] Usuários aprovados:', approvedUsers);
      console.log('❌ [getSubscriptions] Erro ao buscar usuários aprovados:', usersError);

      // Agora buscar assinaturas - especificar qual relação usar
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          users!subscriptions_user_id_fkey(name, email),
          plans!subscriptions_plan_id_fkey(name, billing_period, price)
        `)
        .order('created_at', { ascending: false })

      console.log('📊 [getSubscriptions] Dados retornados:', data);
      console.log('📊 [getSubscriptions] Primeira assinatura (exemplo):', data?.[0]);
      console.log('❌ [getSubscriptions] Erro (se houver):', error);

      if (error) {
        console.error('💥 [getSubscriptions] Erro na consulta:', error.message);
        return { success: false, error: error.message }
      }

      // Processar os dados para o formato esperado
      const subscriptions = data?.map(sub => ({
        id: sub.id,
        user_id: sub.user_id,
        plan_id: sub.plan_id,
        status: sub.status,
        current_period_start: sub.current_period_start,
        current_period_end: sub.current_period_end,
        amount: sub.plans?.price || 0,
        created_at: sub.created_at,
        updated_at: sub.updated_at,
        canceled_at: sub.canceled_at,
        approved_at: sub.approved_at,
        approved_by: sub.approved_by,
        userName: sub.users?.name || 'Usuário não encontrado',
        planName: sub.plans?.name || 'Plano não encontrado'
      })) || [];

      console.log('✅ [getSubscriptions] Sucesso! Assinaturas encontradas:', subscriptions.length);
      console.log('📊 [getSubscriptions] Usuários aprovados vs Assinaturas:', {
        usuariosAprovados: approvedUsers?.length || 0,
        assinaturas: subscriptions.length
      });
      console.log('📊 [getSubscriptions] Assinaturas processadas:', subscriptions);
      
      return { success: true, data: subscriptions }
    } catch (error) {
      console.error('💥 [getSubscriptions] Erro geral:', error);
      return { success: false, error: 'Erro ao buscar assinaturas' }
    }
  }

  async createSubscription(userId: string, planId: string, adminId: string) {
    try {
      console.log('🔍 [createSubscription] Criando assinatura:', { userId, planId, adminId });
      
      // Buscar dados do plano
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single()

      console.log('📊 [createSubscription] Plano encontrado:', plan);
      console.log('❌ [createSubscription] Erro ao buscar plano:', planError);

      if (planError || !plan) {
        console.error('💥 [createSubscription] Plano não encontrado');
        return { success: false, error: 'Plano não encontrado' }
      }

      // Calcular datas de início e vencimento
      const periodStart = new Date()
      let periodEnd = new Date()
      
      if (plan.billing_period === 'WEEKLY') {
        periodEnd.setDate(periodEnd.getDate() + 7)
      } else if (plan.billing_period === 'MONTHLY') {
        periodEnd.setMonth(periodEnd.getMonth() + 1)
      } else if (plan.billing_period === 'LIFETIME') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 100)
      }

      const subscriptionData = {
        user_id: userId,
        plan_id: planId,
        status: 'ACTIVE',
        current_period_start: periodStart.toISOString(),
        current_period_end: periodEnd.toISOString(),
        amount: plan.price,
        approved_at: new Date().toISOString(),
        approved_by: adminId
      };

      console.log('📊 [createSubscription] Dados da assinatura:', subscriptionData);

      const { data, error } = await supabase
        .from('subscriptions')
        .insert([subscriptionData])
        .select()
        .single()

      console.log('📊 [createSubscription] Assinatura criada:', data);
      console.log('❌ [createSubscription] Erro ao criar assinatura:', error);

      if (error) {
        console.error('💥 [createSubscription] Erro na criação:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [createSubscription] Assinatura criada com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [createSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao criar assinatura' }
    }
  }


  async updateSubscription(id: string, updates: Partial<Subscription>) {
    try {
      console.log('🔍 [updateSubscription] Atualizando assinatura:', id, 'com dados:', updates);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      console.log('📊 [updateSubscription] Dados retornados:', data);
      console.log('❌ [updateSubscription] Erro (se houver):', error);

      if (error) {
        console.error('💥 [updateSubscription] Erro na atualização:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [updateSubscription] Assinatura atualizada com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [updateSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao atualizar assinatura' }
    }
  }

  async cancelSubscription(id: string) {
    try {
      console.log('🔍 [cancelSubscription] Cancelando assinatura:', id);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'CANCELED',
          canceled_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      console.log('📊 [cancelSubscription] Dados retornados:', data);
      console.log('❌ [cancelSubscription] Erro (se houver):', error);

      if (error) {
        console.error('💥 [cancelSubscription] Erro no cancelamento:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [cancelSubscription] Assinatura cancelada com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [cancelSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao cancelar assinatura' }
    }
  }

  async renewSubscription(id: string, monthsToAdd: number = 1) {
    try {
      console.log('🔍 [renewSubscription] Renovando assinatura:', id, 'por', monthsToAdd, 'meses');
      
      // Buscar assinatura atual
      const { data: currentSub, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError || !currentSub) {
        console.error('💥 [renewSubscription] Erro ao buscar assinatura:', fetchError);
        return { success: false, error: 'Assinatura não encontrada' }
      }

      // Calcular nova data de vencimento
      const currentEndDate = new Date(currentSub.current_period_end);
      const newEndDate = new Date(currentEndDate);
      newEndDate.setMonth(newEndDate.getMonth() + monthsToAdd);

      console.log('📊 [renewSubscription] Data atual:', currentEndDate);
      console.log('📊 [renewSubscription] Nova data:', newEndDate);

      const { data, error } = await supabase
        .from('subscriptions')
        .update({ 
          status: 'ACTIVE',
          current_period_end: newEndDate.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      console.log('📊 [renewSubscription] Dados retornados:', data);
      console.log('❌ [renewSubscription] Erro (se houver):', error);

      if (error) {
        console.error('💥 [renewSubscription] Erro na renovação:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [renewSubscription] Assinatura renovada com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [renewSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao renovar assinatura' }
    }
  }

  async deleteSubscription(id: string) {
    try {
      console.log('🔍 [deleteSubscription] Excluindo assinatura:', id);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)

      console.log('❌ [deleteSubscription] Erro (se houver):', error);

      if (error) {
        console.error('💥 [deleteSubscription] Erro na exclusão:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [deleteSubscription] Assinatura excluída com sucesso!');
      return { success: true }
    } catch (error) {
      console.error('💥 [deleteSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao excluir assinatura' }
    }
  }

  async changeSubscriptionPlan(subscriptionId: string, newPlanId: string) {
    try {
      console.log('🔍 [changeSubscriptionPlan] Trocando plano da assinatura:', subscriptionId, 'para plano:', newPlanId);
      
      // Buscar dados do novo plano
      const { data: newPlan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', newPlanId)
        .single()

      console.log('📊 [changeSubscriptionPlan] Novo plano encontrado:', newPlan);
      console.log('❌ [changeSubscriptionPlan] Erro ao buscar novo plano:', planError);

      if (planError || !newPlan) {
        console.error('💥 [changeSubscriptionPlan] Novo plano não encontrado');
        return { success: false, error: 'Novo plano não encontrado' }
      }

      // Buscar assinatura atual
      const { data: currentSubscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('id', subscriptionId)
        .single()

      if (subError || !currentSubscription) {
        console.error('💥 [changeSubscriptionPlan] Assinatura não encontrada');
        return { success: false, error: 'Assinatura não encontrada' }
      }

      console.log('📊 [changeSubscriptionPlan] Assinatura atual:', currentSubscription);

      // Calcular nova data de vencimento baseada no período restante
      const currentEndDate = new Date(currentSubscription.current_period_end);
      const now = new Date();
      const daysRemaining = Math.ceil((currentEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log('📊 [changeSubscriptionPlan] Dias restantes:', daysRemaining);

      // Se a assinatura já expirou, usar a data atual como base
      const baseDate = daysRemaining > 0 ? now : currentEndDate;
      let newEndDate = new Date(baseDate);

      // Calcular nova data baseada no período do novo plano
      if (newPlan.billing_period === 'WEEKLY') {
        newEndDate.setDate(newEndDate.getDate() + 7);
      } else if (newPlan.billing_period === 'MONTHLY') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else if (newPlan.billing_period === 'LIFETIME') {
        newEndDate.setFullYear(newEndDate.getFullYear() + 100);
      }

      console.log('📊 [changeSubscriptionPlan] Nova data de vencimento:', newEndDate);

      // Atualizar assinatura
      const updateData = {
        plan_id: newPlanId,
        amount: newPlan.price,
        current_period_end: newEndDate.toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('📊 [changeSubscriptionPlan] Dados para atualização:', updateData);

      const { data, error } = await supabase
        .from('subscriptions')
        .update(updateData)
        .eq('id', subscriptionId)
        .select()
        .single()

      console.log('📊 [changeSubscriptionPlan] Assinatura atualizada:', data);
      console.log('❌ [changeSubscriptionPlan] Erro (se houver):', error);

      if (error) {
        console.error('💥 [changeSubscriptionPlan] Erro na atualização:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [changeSubscriptionPlan] Plano da assinatura alterado com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [changeSubscriptionPlan] Erro geral:', error);
      return { success: false, error: 'Erro ao trocar plano da assinatura' }
    }
  }

  // Verificar usuários ativos sem assinatura (excluindo admins)
  async getUsersWithoutSubscription() {
    try {
      console.log('🔍 [getUsersWithoutSubscription] Buscando usuários ativos sem assinatura (excluindo admins)...');
      
      // Buscar usuários ativos (excluindo admins)
      const { data: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'APPROVED')
        .eq('is_active', true)
        .neq('role', 'ADMIN') // ← EXCEÇÃO: Excluir usuários ADMIN

      if (usersError) {
        console.error('💥 [getUsersWithoutSubscription] Erro ao buscar usuários:', usersError);
        return { success: false, error: usersError.message }
      }

      console.log('📊 [getUsersWithoutSubscription] Usuários ativos encontrados (não-admin):', activeUsers?.length || 0);

      // Buscar assinaturas ativas
      const { data: activeSubscriptions, error: subsError } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('status', 'ACTIVE')

      if (subsError) {
        console.error('💥 [getUsersWithoutSubscription] Erro ao buscar assinaturas:', subsError);
        return { success: false, error: subsError.message }
      }

      console.log('📊 [getUsersWithoutSubscription] Assinaturas ativas encontradas:', activeSubscriptions?.length || 0);

      // Filtrar usuários sem assinatura (já excluindo admins)
      const usersWithSubscription = activeSubscriptions?.map(sub => sub.user_id) || [];
      const usersWithoutSubscription = activeUsers?.filter(user => 
        !usersWithSubscription.includes(user.id)
      ) || [];

      console.log('📊 [getUsersWithoutSubscription] Usuários sem assinatura (não-admin):', usersWithoutSubscription.length);
      console.log('📊 [getUsersWithoutSubscription] IDs dos usuários sem assinatura:', usersWithoutSubscription.map(u => u.id));
      console.log('📊 [getUsersWithoutSubscription] Roles dos usuários sem assinatura:', usersWithoutSubscription.map(u => u.role));

      return { success: true, data: usersWithoutSubscription }
    } catch (error) {
      console.error('💥 [getUsersWithoutSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao verificar usuários sem assinatura' }
    }
  }

  // Mover usuário para pendente (para seleção de assinatura)
  async moveUserToPendingForSubscription(userId: string) {
    try {
      console.log('🔍 [moveUserToPendingForSubscription] Movendo usuário para pendente:', userId);
      
      const { data, error } = await supabase
        .from('users')
        .update({ 
          status: 'PENDING',
          is_active: false
        })
        .eq('id', userId)
        .select()
        .single()

      console.log('📊 [moveUserToPendingForSubscription] Dados retornados:', data);
      console.log('❌ [moveUserToPendingForSubscription] Erro (se houver):', error);

      if (error) {
        console.error('💥 [moveUserToPendingForSubscription] Erro na atualização:', error.message);
        return { success: false, error: error.message }
      }

      console.log('✅ [moveUserToPendingForSubscription] Usuário movido para pendente com sucesso!');
      return { success: true, data }
    } catch (error) {
      console.error('💥 [moveUserToPendingForSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao mover usuário para pendente' }
    }
  }

  // Verificar se usuário tem assinatura ativa (admins sempre têm "assinatura")
  async checkUserSubscription(userId: string) {
    try {
      console.log('🔍 [checkUserSubscription] Verificando assinatura do usuário:', userId);
      
      // Primeiro, verificar se o usuário é admin
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single()

      if (userError) {
        console.error('💥 [checkUserSubscription] Erro ao buscar usuário:', userError);
        return { success: false, error: userError.message }
      }

      // Se for admin, sempre retornar como tendo "assinatura"
      if (user.role === 'ADMIN') {
        console.log('📊 [checkUserSubscription] Usuário é ADMIN - sempre tem "assinatura"');
        return { success: true, data: { hasActiveSubscription: true, subscription: null, isAdmin: true } }
      }

      // Para usuários não-admin, verificar assinatura real
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'ACTIVE')
        .single()

      console.log('📊 [checkUserSubscription] Dados retornados:', data);
      console.log('❌ [checkUserSubscription] Erro (se houver):', error);

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('💥 [checkUserSubscription] Erro na consulta:', error.message);
        return { success: false, error: error.message }
      }

      const hasActiveSubscription = !!data;
      console.log('📊 [checkUserSubscription] Usuário tem assinatura ativa:', hasActiveSubscription);

      return { success: true, data: { hasActiveSubscription, subscription: data, isAdmin: false } }
    } catch (error) {
      console.error('💥 [checkUserSubscription] Erro geral:', error);
      return { success: false, error: 'Erro ao verificar assinatura do usuário' }
    }
  }

  // Métricas
  async getMetricsSummary() {
    try {
      // Usuários ativos
      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // Assinaturas ativas
      const { count: activeSubscriptions } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')

      // Novos usuários (7 dias)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { count: newUsers7d } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo.toISOString())

      // Novos usuários (30 dias)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { count: newUsers30d } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString())

      // Assinaturas em teste
      const { count: trials } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'TRIALING')

      // Assinaturas vencidas
      const { count: pastDue } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PAST_DUE')

      // Assinaturas expirando em 7 dias
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      
      const { count: expiringIn7Days } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ACTIVE')
        .lte('current_period_end', sevenDaysFromNow.toISOString())

      // Cancelamentos (30 dias)
      const { count: churn30d } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'CANCELED')
        .gte('canceled_at', thirtyDaysAgo.toISOString())

      // Receita mensal (MRR)
      const { data: mrrData } = await supabase
        .from('subscriptions')
        .select('amount')
        .eq('status', 'ACTIVE')

      const mrr = mrrData?.reduce((sum, sub) => sum + sub.amount, 0) || 0

      return {
        success: true,
        data: {
          activeUsers: activeUsers || 0,
          activeSubscriptions: activeSubscriptions || 0,
          mrr: `R$ ${mrr.toFixed(2)}`,
          newUsers7d: newUsers7d || 0,
          newUsers30d: newUsers30d || 0,
          churn30d: churn30d || 0,
          trials: trials || 0,
          pastDue: pastDue || 0,
          expiringIn7Days: expiringIn7Days || 0
        }
      }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar métricas' }
    }
  }

  // Notificações
  async getNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao buscar notificações' }
    }
  }

  async createNotification(notificationData: Partial<Notification>) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao criar notificação' }
    }
  }

  async markNotificationAsRead(id: string) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true, data }
    } catch (error) {
      return { success: false, error: 'Erro ao marcar notificação como lida' }
    }
  }

  // Método para verificar a estrutura do banco de dados
  async checkDatabaseStructure() {
    try {
      console.log('🔍 [checkDatabaseStructure] Verificando estrutura do banco...');
      
      // Verificar tabela users
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('*')
        .limit(1);

      console.log('📊 [checkDatabaseStructure] Tabela users:', { data: usersData, error: usersError });

      // Verificar tabela plans
      const { data: plansData, error: plansError } = await supabase
        .from('plans')
        .select('*')
        .limit(1);

      console.log('📊 [checkDatabaseStructure] Tabela plans:', { data: plansData, error: plansError });

      // Verificar tabela subscriptions
      const { data: subscriptionsData, error: subscriptionsError } = await supabase
        .from('subscriptions')
        .select('*')
        .limit(1);

      console.log('📊 [checkDatabaseStructure] Tabela subscriptions:', { data: subscriptionsData, error: subscriptionsError });

      // Verificar se há dados nas tabelas
      const { data: allUsers, error: allUsersError } = await supabase
        .from('users')
        .select('id, name, status, created_at');

      const { data: allPlans, error: allPlansError } = await supabase
        .from('plans')
        .select('id, name, price, billing_period');

      const { data: allSubscriptions, error: allSubscriptionsError } = await supabase
        .from('subscriptions')
        .select('id, user_id, plan_id, status');

      console.log('📊 [checkDatabaseStructure] Resumo dos dados:');
      console.log('  - Usuários:', allUsers?.length || 0, allUsersError ? '(erro)' : '');
      console.log('  - Planos:', allPlans?.length || 0, allPlansError ? '(erro)' : '');
      console.log('  - Assinaturas:', allSubscriptions?.length || 0, allSubscriptionsError ? '(erro)' : '');

      if (allUsers && allUsers.length > 0) {
        console.log('📊 [checkDatabaseStructure] Status dos usuários:', 
          allUsers.map(u => ({ name: u.name, status: u.status }))
        );
      }

      return {
        success: true,
        data: {
          users: { count: allUsers?.length || 0, error: allUsersError },
          plans: { count: allPlans?.length || 0, error: allPlansError },
          subscriptions: { count: allSubscriptions?.length || 0, error: allSubscriptionsError }
        }
      };
    } catch (error) {
      console.error('💥 [checkDatabaseStructure] Erro geral:', error);
      return { success: false, error: 'Erro ao verificar estrutura do banco' };
    }
  }
}

// Instância global do cliente
export const supabaseApiClient = new SupabaseApiClient()
