import { useState, useEffect } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

interface AuthUser {
  id: string
  username: string
  email: string
  name: string
  role: 'ADMIN' | 'AGENT' | 'USER'
  is_active: boolean
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export const useSupabaseAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    // Verificar sessão inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      
      if (session?.user) {
        await fetchUserData(session.user.email!)
      } else {
        setLoading(false)
      }
    }

    getInitialSession()

    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        
        if (session?.user) {
          await fetchUserData(session.user.email!)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserData = async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error)
        setUser(null)
      } else {
        setUser(data)
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Buscar dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError) {
        return { success: false, error: 'Usuário não encontrado' }
      }

      setUser(userData)
      return { success: true, data: { user: userData, session: data.session } }
    } catch (error) {
      return { success: false, error: 'Erro de conexão' }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        return { success: false, error: error.message }
      }
      setUser(null)
      setSession(null)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Erro ao fazer logout' }
    }
  }

  const signup = async (email: string, password: string, userData: Partial<AuthUser>) => {
    try {
      setLoading(true)
      
      // Criar usuário no Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Criar registro na tabela users
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert([{
          ...userData,
          email,
          is_active: true,
          must_change_password: false,
        }])
        .select()
        .single()

      if (userError) {
        return { success: false, error: userError.message }
      }

      return { success: true, data: { user: newUser, session: data.session } }
    } catch (error) {
      return { success: false, error: 'Erro ao criar usuário' }
    } finally {
      setLoading(false)
    }
  }

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'ADMIN' || user?.role === 'AGENT',
    login,
    logout,
    signup,
  }
}
