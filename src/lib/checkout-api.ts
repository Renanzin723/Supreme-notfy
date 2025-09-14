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

  // Atualizar link de checkout
  async updateCheckoutLink(planId: string, checkoutUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('checkout_links')
        .update({ 
          checkout_url: checkoutUrl,
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

  // Buscar link específico por plano
  async getCheckoutLinkByPlan(planId: string): Promise<{ success: boolean; data?: CheckoutLink; error?: string }> {
    try {
      const { data, error } = await supabase
        .from('checkout_links')
        .select('*')
        .eq('plan_id', planId)
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
