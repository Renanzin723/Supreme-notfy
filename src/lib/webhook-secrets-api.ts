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
        .maybeSingle()

      if (error) throw error
      return { success: true, data: data || null }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Atualizar secret (com fallback para localStorage)
  async updateWebhookSecret(gatewayName: string, secretValue: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[updateWebhookSecret] Tentando salvar secret para ${gatewayName}`, {
        gatewayName,
        secretLength: secretValue.length,
        supabaseUrl: import.meta.env.VITE_SUPABASE_URL
      })
      
      // Primeiro, tentar verificar se a tabela existe
      const { data: existingData, error: selectError } = await supabase
        .from('webhook_secrets')
        .select('id')
        .eq('gateway_name', gatewayName.toLowerCase())
        .maybeSingle()

      // Se erro ao acessar a tabela, pode não existir
      if (selectError) {
        console.warn(`[updateWebhookSecret] Tabela pode não existir, usando localStorage:`, selectError.message)
        // Salvar no localStorage como fallback
        const key = `${gatewayName}-webhook-secret`
        localStorage.setItem(key, secretValue)
        return { 
          success: false, 
          error: `Tabela webhook_secrets não encontrada. Secret salvo no navegador. Erro: ${selectError.message}`
        }
      }

      const now = new Date().toISOString()
      
      if (existingData) {
        // Atualizar registro existente
        console.log(`[updateWebhookSecret] Atualizando registro existente para ${gatewayName}`)
        const { error } = await supabase
          .from('webhook_secrets')
          .update({ 
            secret_value: secretValue,
            is_active: true,
            updated_at: now
          })
          .eq('gateway_name', gatewayName.toLowerCase())

        if (error) {
          console.error(`[updateWebhookSecret] Erro ao atualizar:`, error)
          throw error
        }
      } else {
        // Criar novo registro
        console.log(`[updateWebhookSecret] Criando novo registro para ${gatewayName}`)
        const { error } = await supabase
          .from('webhook_secrets')
          .insert({ 
            gateway_name: gatewayName.toLowerCase(),
            secret_value: secretValue,
            is_active: true,
            created_at: now,
            updated_at: now
          })

        if (error) {
          console.error(`[updateWebhookSecret] Erro ao inserir:`, error)
          throw error
        }
      }

      // Backup no localStorage também
      const key = `${gatewayName}-webhook-secret`
      localStorage.setItem(key, secretValue)

      console.log(`[updateWebhookSecret] Secret salvo com sucesso para ${gatewayName}`)
      return { success: true }
    } catch (error) {
      console.error(`[updateWebhookSecret] Erro ao salvar secret para ${gatewayName}:`, error)
      
      // Fallback: salvar no localStorage
      try {
        const key = `${gatewayName}-webhook-secret`
        localStorage.setItem(key, secretValue)
        console.log(`[updateWebhookSecret] Secret salvo no localStorage como fallback`)
      } catch (localError) {
        console.error(`[updateWebhookSecret] Erro até no localStorage:`, localError)
      }
      
      // Melhor tratamento de erro
      let errorMessage = 'Erro desconhecido'
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error && typeof error === 'object' && 'message' in error) {
        errorMessage = String(error.message)
      } else {
        errorMessage = `Erro: ${JSON.stringify(error)}`
      }
      
      return { 
        success: false, 
        error: errorMessage
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
