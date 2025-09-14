import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://amoohmfedlhzrcswocya.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtb29obWZlZGxoenJjc3dvY3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NjgxMjcsImV4cCI6MjA3MzM0NDEyN30.x5FXMdB434GUT4cIT33mlApPZflke8AnD-PSLWE0JQE'

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Criar cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos TypeScript para as tabelas
export interface User {
  id: string
  username: string
  email: string
  name: string
  role: 'ADMIN' | 'AGENT' | 'USER'
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'
  is_active: boolean
  must_change_password: boolean
  password_hash?: string
  created_at: string
  updated_at: string
  approved_at?: string
  approved_by?: string
}

export interface Plan {
  id: string
  name: string
  description?: string
  price: number
  billing_period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'LIFETIME'
  features: any
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Subscription {
  id: string
  user_id: string
  plan_id: string
  status: 'PENDING' | 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'SUSPENDED'
  current_period_start: string
  current_period_end: string
  amount: number
  created_at: string
  updated_at: string
  canceled_at?: string
  approved_at?: string
  approved_by?: string
  plans?: Plan
  users?: User
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'
  is_read: boolean
  created_at: string
}

export interface Payment {
  id: string
  user_id: string
  subscription_id?: string
  amount: number
  currency: string
  gateway_transaction_id: string
  gateway_name: string
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELLED'
  gateway_response: any
  plan_identifier?: string
  created_at: string
  updated_at: string
  paid_at?: string
  refunded_at?: string
  users?: User
  subscriptions?: Subscription
}

export interface WebhookLog {
  id: string
  webhook_type: string
  gateway_name: string
  payload: any
  status: 'SUCCESS' | 'ERROR' | 'PENDING'
  response?: any
  error_message?: string
  processed_at?: string
  created_at: string
}
