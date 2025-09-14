import { supabase } from './supabase'
import { Payment, WebhookLog, User, Subscription, Plan } from './supabase'

// Mapeamento de valores para planos (baseado nos planos do banco)
const PLAN_MAPPING: Record<number, string> = {
  9.90: 'Plano Diário',
  15.90: 'Plano Semanal', 
  34.90: 'Plano Mensal',
  47.90: 'Plano Lifetime'
}

// Configurações do webhook
interface WebhookConfig {
  secret: string
  autoApprove: boolean
  retryAttempts: number
  timeout: number
}

export class WebhookApiClient {
  private config: WebhookConfig = {
    secret: '',
    autoApprove: true,
    retryAttempts: 3,
    timeout: 30000
  }

  // Processar webhook de pagamento
  async processPaymentWebhook(
    gatewayName: string,
    payload: any
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // 1. Log do webhook recebido
      console.log(`Webhook ${gatewayName} recebido:`, payload)

      // 2. Log do webhook recebido
      const logId = await this.logWebhook(gatewayName, 'payment', payload, 'PENDING')

      // 3. Extrair dados do pagamento
      const paymentData = this.extractPaymentData(gatewayName, payload)
      
      if (!paymentData) {
        await this.updateWebhookLog(logId, 'ERROR', 'Dados de pagamento não encontrados')
        return { success: false, message: 'Dados de pagamento não encontrados' }
      }

      // 4. Verificar se o pagamento já foi processado
      const existingPayment = await this.getPaymentByGatewayId(paymentData.gateway_transaction_id)
      if (existingPayment) {
        await this.updateWebhookLog(logId, 'SUCCESS', 'Pagamento já processado')
        return { success: true, message: 'Pagamento já processado' }
      }

      // 5. Criar registro de pagamento
      const payment = await this.createPayment(paymentData)

      // 6. Se auto-aprovação está ativada, ativar assinatura
      if (this.config.autoApprove && paymentData.status === 'PAID') {
        await this.activateSubscription(payment)
      }

      // 7. Atualizar log como sucesso
      await this.updateWebhookLog(logId, 'SUCCESS', 'Pagamento processado com sucesso', payment)

      return { 
        success: true, 
        message: 'Pagamento processado com sucesso',
        data: payment
      }

    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Extrair dados do pagamento baseado no gateway
  private extractPaymentData(gatewayName: string, payload: any): any {
    switch (gatewayName.toLowerCase()) {
      case 'cakto':
        return this.extractCaktoData(payload)
      case 'nivuspay':
        return this.extractNivuspayData(payload)
      default:
        return null
    }
  }

  // Extrair dados do Cakto
  private extractCaktoData(payload: any): any {
    // Verificar se é um evento de pagamento aprovado
    if (payload.event !== 'payment.approved' && payload.status !== 'approved') return null

    return {
      user_id: payload.customer_id || payload.user_id,
      amount: parseFloat(payload.amount),
      currency: payload.currency || 'BRL',
      gateway_transaction_id: payload.transaction_id || payload.id,
      gateway_name: 'cakto',
      status: 'PAID',
      gateway_response: payload,
      plan_identifier: payload.plan_id || this.identifyPlanByAmount(parseFloat(payload.amount)),
      paid_at: payload.paid_at || new Date().toISOString()
    }
  }

  // Extrair dados do Nivuspay
  private extractNivuspayData(payload: any): any {
    // Verificar se é um evento de pagamento aprovado
    if (payload.event !== 'payment.completed' && payload.status !== 'completed') return null

    return {
      user_id: payload.customer_id || payload.user_id,
      amount: parseFloat(payload.amount),
      currency: payload.currency || 'BRL',
      gateway_transaction_id: payload.transaction_id || payload.id,
      gateway_name: 'nivuspay',
      status: 'PAID',
      gateway_response: payload,
      plan_identifier: payload.plan_id || this.identifyPlanByAmount(parseFloat(payload.amount)),
      paid_at: payload.paid_at || new Date().toISOString()
    }
  }

  // Identificar plano pelo valor
  private identifyPlanByAmount(amount: number): string {
    return PLAN_MAPPING[amount] || 'unknown'
  }

  // Validação de webhook (sem assinatura para Cakto e Nivuspay)
  private validateWebhook(payload: any): boolean {
    // Validações básicas do payload
    if (!payload) return false
    if (typeof payload !== 'object') return false
    
    // Validações específicas por gateway
    if (payload.gateway_name === 'cakto') {
      return payload.event && payload.amount && payload.customer_id
    }
    
    if (payload.gateway_name === 'nivuspay') {
      return payload.event && payload.amount && payload.customer_id
    }
    
    return true
  }

  // Criar registro de pagamento
  private async createPayment(paymentData: any): Promise<Payment> {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        user_id: paymentData.user_id,
        amount: paymentData.amount,
        currency: paymentData.currency,
        gateway_transaction_id: paymentData.gateway_transaction_id,
        gateway_name: paymentData.gateway_name,
        status: paymentData.status,
        gateway_response: paymentData.gateway_response,
        plan_identifier: paymentData.plan_identifier,
        paid_at: paymentData.paid_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Ativar assinatura automaticamente
  private async activateSubscription(payment: Payment): Promise<void> {
    try {
      // 1. Buscar usuário
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', payment.user_id)
        .single()

      if (userError || !user) {
        throw new Error('Usuário não encontrado')
      }

      // 2. Identificar plano
      let planId: string
      if (payment.plan_identifier && payment.plan_identifier !== 'unknown') {
        // Buscar plano pelo identificador
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('id')
          .eq('name', payment.plan_identifier)
          .single()

        if (planError || !plan) {
          throw new Error('Plano não encontrado')
        }
        planId = plan.id
      } else {
        // Buscar plano pelo valor
        const { data: plan, error: planError } = await supabase
          .from('plans')
          .select('id')
          .eq('price', payment.amount)
          .single()

        if (planError || !plan) {
          throw new Error('Plano não encontrado para o valor pago')
        }
        planId = plan.id
      }

      // 3. Criar ou atualizar assinatura
      const now = new Date()
      const endDate = new Date(now)
      
      // Calcular data de fim baseada no tipo de plano
      if (payment.plan_identifier === 'Plano Diário' || payment.plan_identifier === 'daily_plan') {
        endDate.setDate(endDate.getDate() + 1)
      } else if (payment.plan_identifier === 'Plano Semanal' || payment.plan_identifier === 'weekly_plan') {
        endDate.setDate(endDate.getDate() + 7)
      } else if (payment.plan_identifier === 'Plano Mensal' || payment.plan_identifier === 'monthly_plan') {
        endDate.setMonth(endDate.getMonth() + 1)
      } else if (payment.plan_identifier === 'Plano Lifetime' || payment.plan_identifier === 'lifetime_plan') {
        endDate.setFullYear(endDate.getFullYear() + 100) // 100 anos = lifetime
      } else {
        // Fallback para plano mensal se não conseguir identificar
        endDate.setMonth(endDate.getMonth() + 1)
      }

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .upsert([{
          user_id: payment.user_id,
          plan_id: planId,
          status: 'ACTIVE',
          current_period_start: now.toISOString(),
          current_period_end: endDate.toISOString(),
          amount: payment.amount,
          approved_at: new Date().toISOString(),
          approved_by: 'WEBHOOK_SYSTEM',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }], {
          onConflict: 'user_id'
        })
        .select()
        .single()

      if (subError) throw subError

      // 4. Atualizar pagamento com subscription_id
      await supabase
        .from('payments')
        .update({ 
          subscription_id: subscription.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      // 5. Ativar usuário se estiver pendente
      if (user.status === 'PENDING') {
        await supabase
          .from('users')
          .update({
            status: 'APPROVED',
            is_active: true,
            approved_at: new Date().toISOString(),
            approved_by: 'WEBHOOK_SYSTEM',
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id)
      }

    } catch (error) {
      console.error('Erro ao ativar assinatura:', error)
      throw error
    }
  }

  // Buscar pagamento por ID do gateway
  private async getPaymentByGatewayId(gatewayTransactionId: string): Promise<Payment | null> {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('gateway_transaction_id', gatewayTransactionId)
      .single()

    if (error && error.code !== 'PGRST116') return null // PGRST116 = no rows
    return data
  }

  // Log do webhook
  private async logWebhook(
    gatewayName: string,
    webhookType: string,
    payload: any,
    status: 'SUCCESS' | 'ERROR' | 'PENDING'
  ): Promise<string> {
    const { data, error } = await supabase
      .from('webhook_logs')
      .insert([{
        webhook_type: webhookType,
        gateway_name: gatewayName,
        payload: payload,
        status: status,
        created_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (error) throw error
    return data.id
  }

  // Atualizar log do webhook
  private async updateWebhookLog(
    logId: string,
    status: 'SUCCESS' | 'ERROR' | 'PENDING',
    message?: string,
    response?: any
  ): Promise<void> {
    const updateData: any = {
      status,
      processed_at: new Date().toISOString()
    }

    if (message) updateData.error_message = message
    if (response) updateData.response = response

    const { error } = await supabase
      .from('webhook_logs')
      .update(updateData)
      .eq('id', logId)

    if (error) throw error
  }

  // Buscar pagamentos
  async getPayments(): Promise<{ success: boolean; data?: Payment[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          users:user_id (id, name, email),
          subscriptions:subscription_id (id, status)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Buscar logs de webhook
  async getWebhookLogs(): Promise<{ success: boolean; data?: WebhookLog[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('webhook_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Configurar webhook
  setConfig(config: Partial<WebhookConfig>): void {
    this.config = { ...this.config, ...config }
  }

  // Obter configuração
  getConfig(): WebhookConfig {
    return this.config
  }
}

// Instância singleton
export const webhookApiClient = new WebhookApiClient()
