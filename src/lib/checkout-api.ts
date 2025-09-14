import { supabase } from './supabase'

export interface CheckoutLink {
  id: string
  plan_id: string
  plan_name: string
  checkout_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export class CheckoutApiClient {
  // Buscar todos os links de checkout
  async getCheckoutLinks(): Promise<{ success: boolean; data?: CheckoutLink[]; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('is_active', true)
        .order('plan_id')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }

  // Atualizar link de checkout (com fallback para localStorage)
  async updateCheckoutLink(planId: string, checkoutUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log(`[updateCheckoutLink] Tentando salvar link para ${planId}`)
      
      // Primeiro, verificar se a tabela existe
      const { data: existingData, error: selectError } = await supabase
        .from('checkout_links')
        .select('id')
        .eq('plan_id', planId)
        .maybeSingle()

      // Se erro ao acessar a tabela, pode não existir
      if (selectError) {
        console.warn(`[updateCheckoutLink] Tabela pode não existir, usando localStorage:`, selectError.message)
        // Salvar no localStorage como fallback
        const links = JSON.parse(localStorage.getItem('checkout-links') || '{}')
        links[planId] = checkoutUrl
        localStorage.setItem('checkout-links', JSON.stringify(links))
        return { 
          success: false, 
          error: `Tabela checkout_links não encontrada. Link salvo no navegador. Erro: ${selectError.message}`
        }
      }

      const now = new Date().toISOString()
      
      if (existingData) {
        // Atualizar registro existente
        console.log(`[updateCheckoutLink] Atualizando registro existente para ${planId}`)
        const { error } = await supabase
          .from('checkout_links')
          .update({ 
            checkout_url: checkoutUrl,
            is_active: true,
            updated_at: now
          })
          .eq('plan_id', planId)

        if (error) {
          console.error(`[updateCheckoutLink] Erro ao atualizar:`, error)
          throw error
        }
      } else {
        // Criar novo registro
        console.log(`[updateCheckoutLink] Criando novo registro para ${planId}`)
        const { error } = await supabase
          .from('checkout_links')
          .insert({ 
            plan_id: planId,
            plan_name: this.getPlanName(planId),
            checkout_url: checkoutUrl,
            is_active: true,
            created_at: now,
            updated_at: now
          })

        if (error) {
          console.error(`[updateCheckoutLink] Erro ao inserir:`, error)
          throw error
        }
      }

      // Backup no localStorage também
      const links = JSON.parse(localStorage.getItem('checkout-links') || '{}')
      links[planId] = checkoutUrl
      localStorage.setItem('checkout-links', JSON.stringify(links))

      console.log(`[updateCheckoutLink] Link salvo com sucesso para ${planId}`)
      return { success: true }
    } catch (error) {
      console.error(`[updateCheckoutLink] Erro ao salvar link para ${planId}:`, error)
      
      // Fallback: salvar no localStorage
      try {
        const links = JSON.parse(localStorage.getItem('checkout-links') || '{}')
        links[planId] = checkoutUrl
        localStorage.setItem('checkout-links', JSON.stringify(links))
        console.log(`[updateCheckoutLink] Link salvo no localStorage como fallback`)
      } catch (localError) {
        console.error(`[updateCheckoutLink] Erro até no localStorage:`, localError)
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

  // Helper para obter nome do plano
  private getPlanName(planId: string): string {
    const planNames: { [key: string]: string } = {
      'daily': 'Plano Diário',
      'weekly': 'Plano Semanal', 
      'monthly': 'Plano Mensal',
      'lifetime': 'Plano Lifetime'
    }
    return planNames[planId] || planId
  }

  // Buscar link específico por plano
  async getCheckoutLinkByPlan(planId: string): Promise<{ success: boolean; data?: CheckoutLink; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('plan_id', planId)
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

  // Verificar se link está configurado
  async isLinkConfigured(planId: string): Promise<boolean> {
    try {
      const result = await this.getCheckoutLinkByPlan(planId)
      return result.success && 
             !!result.data?.checkout_url && 
             result.data.checkout_url.trim() !== '' &&
             result.data.checkout_url.startsWith('http')
    } catch (error) {
      return false
    }
  }

  // Verificar status de todos os links
  async getLinksStatus(): Promise<{ daily: boolean; weekly: boolean; monthly: boolean; lifetime: boolean }> {
    try {
      const [daily, weekly, monthly, lifetime] = await Promise.all([
        this.isLinkConfigured('daily'),
        this.isLinkConfigured('weekly'),
        this.isLinkConfigured('monthly'),
        this.isLinkConfigured('lifetime')
      ])

      return { daily, weekly, monthly, lifetime }
    } catch (error) {
      return {
        daily: false,
        weekly: false,
        monthly: false,
        lifetime: false
      }
    }
  }

  // Ativar/desativar link
  async toggleCheckoutLink(planId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('checkout_links')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('plan_id', planId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }
    }
  }
}

export const checkoutApiClient = new CheckoutApiClient()

