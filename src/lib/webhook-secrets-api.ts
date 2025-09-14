import { supabase } from './supabase'

export interface WebhookSecret {
  id: string
  gateway_name: string
  secret_value: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class WebhookSecretsApiClient {
  // Buscar todos os secrets
  async getWebhookSecrets(): Promise<{ success: boolean; data?: WebhookSecret[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('webhook_secrets')
        .select('*')
        .eq('is_active', true)
        .order('gateway_name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Buscar secret específico por gateway
  async getWebhookSecret(gatewayName: string): Promise<{ success: boolean; data?: WebhookSecret; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('webhook_secrets')
        .select('*')
        .eq('gateway_name', gatewayName.toLowerCase())
        .eq('is_active', true)
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Atualizar secret
  async updateWebhookSecret(gatewayName: string, secretValue: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('webhook_secrets')
        .update({ 
          secret_value: secretValue,
          updated_at: new Date().toISOString()
        })
        .eq('gateway_name', gatewayName.toLowerCase())

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Ativar/desativar secret
  async toggleWebhookSecret(gatewayName: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('webhook_secrets')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('gateway_name', gatewayName.toLowerCase())

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Verificar se secret está configurado
  async isSecretConfigured(gatewayName: string): Promise<boolean> {
    try {
      const result = await this.getWebhookSecret(gatewayName)
      return result.success && 
             !!result.data?.secret_value && 
             result.data.secret_value.trim() !== '' &&
             result.data.secret_value.length >= 10
    } catch (error) {
      return false
    }
  }

  // Verificar status de todos os secrets
  async getSecretsStatus(): Promise<{ caktoConfigured: boolean; nivuspayConfigured: boolean }> {
    try {
      const [caktoResult, nivuspayResult] = await Promise.all([
        this.isSecretConfigured('cakto'),
        this.isSecretConfigured('nivuspay')
      ])

      return {
        caktoConfigured: caktoResult,
        nivuspayConfigured: nivuspayResult
      }
    } catch (error) {
      return {
        caktoConfigured: false,
        nivuspayConfigured: false
      }
    }
  }
}

export const webhookSecretsApiClient = new WebhookSecretsApiClient()
