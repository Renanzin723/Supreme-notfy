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
  gatewaySecrets: {
    cakto: string
    nivuspay: string
  }
}

export class WebhookApiClient {
  private config: WebhookConfig = {
    secret: '',
    autoApprove: true,
    retryAttempts: 3,
    timeout: 30000,
    gatewaySecrets: {
      cakto: process.env.CAKTO_WEBHOOK_SECRET || '',
      nivuspay: process.env.NIVUSPAY_WEBHOOK_SECRET || ''
    }
  }

  // Processar webhook genérico (pagamento, assinatura, etc.)
  async processWebhook(
    gatewayName: string,
    payload: any,
    signature?: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // 1. Log do webhook recebido
      console.log(`Webhook ${gatewayName} recebido:`, payload)

      // 2. Validar assinatura se fornecida
      if (signature && !this.validateWebhookSignature(gatewayName, payload, signature)) {
        console.error(`Assinatura inválida para webhook ${gatewayName}`)
        return { success: false, message: 'Assinatura inválida' }
      }

      // 3. Validar payload básico
      if (!this.validateWebhook(payload)) {
        return { success: false, message: 'Payload inválido' }
      }

      // 4. Identificar tipo de evento
      const eventType = this.identifyEventType(payload)
      const logId = await this.logWebhook(gatewayName, eventType, payload, 'PENDING')

      // 3. Processar baseado no tipo de evento
      let result: any = null
      
      switch (eventType) {
        case 'payment.approved':
        case 'payment.completed':
          result = await this.processPaymentEvent(gatewayName, payload)
          break
        case 'payment.refunded':
        case 'payment.refund':
          result = await this.processRefundEvent(gatewayName, payload)
          break
        case 'payment.chargeback':
          result = await this.processChargebackEvent(gatewayName, payload)
          break
        case 'payment.declined':
        case 'payment.failed':
          result = await this.processDeclinedPaymentEvent(gatewayName, payload)
          break
        case 'subscription.created':
        case 'subscription.created':
          result = await this.processSubscriptionCreatedEvent(gatewayName, payload)
          break
        case 'subscription.renewed':
        case 'subscription.renewal':
          result = await this.processSubscriptionRenewalEvent(gatewayName, payload)
          break
        case 'subscription.cancelled':
        case 'subscription.canceled':
          result = await this.processSubscriptionCancelledEvent(gatewayName, payload)
          break
        default:
          await this.updateWebhookLog(logId, 'ERROR', `Tipo de evento não suportado: ${eventType}`)
          return { success: false, message: `Tipo de evento não suportado: ${eventType}` }
      }

      if (result.success) {
        await this.updateWebhookLog(logId, 'SUCCESS', result.message, result.data)
      } else {
        await this.updateWebhookLog(logId, 'ERROR', result.message)
      }

      return result

    } catch (error) {
      console.error('Erro ao processar webhook:', error)
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Processar webhook de pagamento (mantido para compatibilidade)
  async processPaymentWebhook(
    gatewayName: string,
    payload: any
  ): Promise<{ success: boolean; message: string; data?: any }> {
    return this.processWebhook(gatewayName, payload)
  }

  // Identificar tipo de evento baseado no payload
  private identifyEventType(payload: any): string {
    // Verificar campo event primeiro
    if (payload.event) {
      return payload.event
    }
    
    // Verificar campo type
    if (payload.type) {
      return payload.type
    }
    
    // Verificar campo action
    if (payload.action) {
      return payload.action
    }
    
    // Verificar status para inferir evento
    if (payload.status) {
      switch (payload.status.toLowerCase()) {
        case 'approved':
        case 'completed':
        case 'paid':
          return 'payment.approved'
        case 'declined':
        case 'failed':
        case 'rejected':
          return 'payment.declined'
        case 'refunded':
        case 'refund':
          return 'payment.refunded'
        case 'chargeback':
          return 'payment.chargeback'
        case 'cancelled':
        case 'canceled':
          return 'subscription.cancelled'
        case 'created':
          return 'subscription.created'
        case 'renewed':
        case 'renewal':
          return 'subscription.renewed'
        default:
          return 'unknown'
      }
    }
    
    return 'unknown'
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

  // Validar webhook com secret
  private validateWebhookSignature(gatewayName: string, payload: any, signature: string): boolean {
    const secret = this.config.gatewaySecrets[gatewayName.toLowerCase() as keyof typeof this.config.gatewaySecrets]
    
    if (!secret) {
      console.warn(`Secret não configurado para ${gatewayName}`)
      return true // Permitir se não configurado (para desenvolvimento)
    }
    
    // Validação específica para Cakto
    if (gatewayName.toLowerCase() === 'cakto') {
      return this.validateCaktoSignature(payload, signature, secret)
    }
    
    // Validação específica para Nivuspay
    if (gatewayName.toLowerCase() === 'nivuspay') {
      return this.validateNivuspaySignature(payload, signature, secret)
    }
    
    return true
  }

  // Validar assinatura da Cakto
  private validateCaktoSignature(payload: any, signature: string, secret: string): boolean {
    try {
      // A Cakto geralmente usa HMAC-SHA256
      const crypto = require('crypto')
      const payloadString = JSON.stringify(payload)
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payloadString)
        .digest('hex')
      
      // Comparar assinaturas de forma segura
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      )
    } catch (error) {
      console.error('Erro ao validar assinatura da Cakto:', error)
      return false
    }
  }

  // Validar assinatura da Nivuspay
  private validateNivuspaySignature(payload: any, signature: string, secret: string): boolean {
    try {
      // Implementar validação específica da Nivuspay se necessário
      // Por enquanto, retorna true se o secret estiver configurado
      return !!secret
    } catch (error) {
      console.error('Erro ao validar assinatura da Nivuspay:', error)
      return false
    }
  }

  // Validação básica de webhook
  private validateWebhook(payload: any): boolean {
    // Validações básicas do payload
    if (!payload) return false
    if (typeof payload !== 'object') return false
    
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
  // Processar evento de pagamento aprovado
  private async processPaymentEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const paymentData = this.extractPaymentData(gatewayName, payload)
    
    if (!paymentData) {
      return { success: false, message: 'Dados de pagamento não encontrados' }
    }

    // Verificar se o pagamento já foi processado
    const existingPayment = await this.getPaymentByGatewayId(paymentData.gateway_transaction_id)
    if (existingPayment) {
      return { success: true, message: 'Pagamento já processado' }
    }

    // Criar registro de pagamento
    const payment = await this.createPayment(paymentData)

    // Se auto-aprovação está ativada, ativar assinatura
    if (this.config.autoApprove && paymentData.status === 'PAID') {
      await this.activateSubscription(payment)
    }

    return { 
      success: true, 
      message: 'Pagamento processado com sucesso',
      data: payment
    }
  }

  // Processar evento de reembolso
  private async processRefundEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const refundData = this.extractRefundData(gatewayName, payload)
    
    if (!refundData) {
      return { success: false, message: 'Dados de reembolso não encontrados' }
    }

    // Buscar pagamento original
    const originalPayment = await this.getPaymentByGatewayId(refundData.original_transaction_id)
    if (!originalPayment) {
      return { success: false, message: 'Pagamento original não encontrado' }
    }

    // Criar registro de reembolso
    const refund = await this.createRefund(refundData, originalPayment.id)

    // Cancelar assinatura se necessário
    await this.cancelSubscriptionByPayment(originalPayment.id)

    return { 
      success: true, 
      message: 'Reembolso processado com sucesso',
      data: refund
    }
  }

  // Processar evento de chargeback
  private async processChargebackEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const chargebackData = this.extractChargebackData(gatewayName, payload)
    
    if (!chargebackData) {
      return { success: false, message: 'Dados de chargeback não encontrados' }
    }

    // Buscar pagamento original
    const originalPayment = await this.getPaymentByGatewayId(chargebackData.original_transaction_id)
    if (!originalPayment) {
      return { success: false, message: 'Pagamento original não encontrado' }
    }

    // Criar registro de chargeback
    const chargeback = await this.createChargeback(chargebackData, originalPayment.id)

    // Cancelar assinatura imediatamente
    await this.cancelSubscriptionByPayment(originalPayment.id)

    return { 
      success: true, 
      message: 'Chargeback processado com sucesso',
      data: chargeback
    }
  }

  // Processar evento de pagamento recusado
  private async processDeclinedPaymentEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const declinedData = this.extractDeclinedPaymentData(gatewayName, payload)
    
    if (!declinedData) {
      return { success: false, message: 'Dados de pagamento recusado não encontrados' }
    }

    // Criar registro de pagamento recusado
    const declinedPayment = await this.createDeclinedPayment(declinedData)

    return { 
      success: true, 
      message: 'Pagamento recusado registrado com sucesso',
      data: declinedPayment
    }
  }

  // Processar evento de assinatura criada
  private async processSubscriptionCreatedEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const subscriptionData = this.extractSubscriptionData(gatewayName, payload)
    
    if (!subscriptionData) {
      return { success: false, message: 'Dados de assinatura não encontrados' }
    }

    // Criar assinatura
    const subscription = await this.createSubscription(subscriptionData)

    return { 
      success: true, 
      message: 'Assinatura criada com sucesso',
      data: subscription
    }
  }

  // Processar evento de renovação de assinatura
  private async processSubscriptionRenewalEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const renewalData = this.extractSubscriptionRenewalData(gatewayName, payload)
    
    if (!renewalData) {
      return { success: false, message: 'Dados de renovação não encontrados' }
    }

    // Renovar assinatura
    const subscription = await this.renewSubscription(renewalData)

    return { 
      success: true, 
      message: 'Assinatura renovada com sucesso',
      data: subscription
    }
  }

  // Processar evento de assinatura cancelada
  private async processSubscriptionCancelledEvent(gatewayName: string, payload: any): Promise<{ success: boolean; message: string; data?: any }> {
    const cancelData = this.extractSubscriptionCancelData(gatewayName, payload)
    
    if (!cancelData) {
      return { success: false, message: 'Dados de cancelamento não encontrados' }
    }

    // Cancelar assinatura
    const subscription = await this.cancelSubscription(cancelData)

    return { 
      success: true, 
      message: 'Assinatura cancelada com sucesso',
      data: subscription
    }
  }

  // Métodos auxiliares para extrair dados específicos
  private extractRefundData(gatewayName: string, payload: any): any {
    return {
      original_transaction_id: payload.original_transaction_id || payload.transaction_id,
      refund_amount: parseFloat(payload.refund_amount || payload.amount),
      refund_id: payload.refund_id || payload.id,
      gateway_name: gatewayName,
      gateway_response: payload,
      refunded_at: payload.refunded_at || new Date().toISOString()
    }
  }

  private extractChargebackData(gatewayName: string, payload: any): any {
    return {
      original_transaction_id: payload.original_transaction_id || payload.transaction_id,
      chargeback_amount: parseFloat(payload.chargeback_amount || payload.amount),
      chargeback_id: payload.chargeback_id || payload.id,
      gateway_name: gatewayName,
      gateway_response: payload,
      chargeback_at: payload.chargeback_at || new Date().toISOString()
    }
  }

  private extractDeclinedPaymentData(gatewayName: string, payload: any): any {
    return {
      user_id: payload.customer_id || payload.user_id,
      amount: parseFloat(payload.amount),
      gateway_transaction_id: payload.transaction_id || payload.id,
      gateway_name: gatewayName,
      status: 'DECLINED',
      gateway_response: payload,
      declined_at: payload.declined_at || new Date().toISOString()
    }
  }

  private extractSubscriptionData(gatewayName: string, payload: any): any {
    return {
      user_id: payload.customer_id || payload.user_id,
      plan_identifier: payload.plan_id || this.identifyPlanByAmount(parseFloat(payload.amount)),
      gateway_subscription_id: payload.subscription_id || payload.id,
      gateway_name: gatewayName,
      status: 'ACTIVE',
      gateway_response: payload,
      created_at: payload.created_at || new Date().toISOString()
    }
  }

  private extractSubscriptionRenewalData(gatewayName: string, payload: any): any {
    return {
      subscription_id: payload.subscription_id,
      gateway_transaction_id: payload.transaction_id || payload.id,
      gateway_name: gatewayName,
      gateway_response: payload,
      renewed_at: payload.renewed_at || new Date().toISOString()
    }
  }

  private extractSubscriptionCancelData(gatewayName: string, payload: any): any {
    return {
      subscription_id: payload.subscription_id,
      gateway_name: gatewayName,
      gateway_response: payload,
      cancelled_at: payload.cancelled_at || new Date().toISOString()
    }
  }

  // Métodos para criar registros no banco (implementar conforme necessário)
  private async createRefund(refundData: any, paymentId: string): Promise<any> {
    // Implementar criação de reembolso
    console.log('Criando reembolso:', refundData, 'para pagamento:', paymentId)
    return refundData
  }

  private async createChargeback(chargebackData: any, paymentId: string): Promise<any> {
    // Implementar criação de chargeback
    console.log('Criando chargeback:', chargebackData, 'para pagamento:', paymentId)
    return chargebackData
  }

  private async createDeclinedPayment(declinedData: any): Promise<any> {
    // Implementar criação de pagamento recusado
    console.log('Criando pagamento recusado:', declinedData)
    return declinedData
  }

  private async createSubscription(subscriptionData: any): Promise<any> {
    // Implementar criação de assinatura
    console.log('Criando assinatura:', subscriptionData)
    return subscriptionData
  }

  private async renewSubscription(renewalData: any): Promise<any> {
    // Implementar renovação de assinatura
    console.log('Renovando assinatura:', renewalData)
    return renewalData
  }

  private async cancelSubscription(cancelData: any): Promise<any> {
    // Implementar cancelamento de assinatura
    console.log('Cancelando assinatura:', cancelData)
    return cancelData
  }

  private async cancelSubscriptionByPayment(paymentId: string): Promise<void> {
    // Implementar cancelamento de assinatura por pagamento
    console.log('Cancelando assinatura por pagamento:', paymentId)
  }
}

export const webhookApiClient = new WebhookApiClient()
