'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User, AuthContextType } from '@/types'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        await fetchUserProfile(session.user.id)
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchUserProfile(session.user.id)
        } else {
          setUser(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error
      setUser(data)
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const signUp = async (email: string, password: string, name: string, profileImage?: string | null) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            profile_image: profileImage
          }
        }
      })

      if (error) throw error

      // 개발 환경에서는 이메일 확인 없이 바로 로그인 시도
      if (data.user) {
        // 잠시 대기 후 로그인 시도 (사용자 생성 완료 대기)
        setTimeout(async () => {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })
          
          if (signInError) {
            console.error('Auto sign-in failed:', signInError)
          }
        }, 1000)
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Sign in error:', error)
        return { error }
      }

      // 로그인 성공 시 사용자 프로필 가져오기
      if (data.user) {
        await fetchUserProfile(data.user.id)
      }

      return { error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (name: string, profileImage?: string | null) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        return { error: 'Not authenticated' }
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          name,
          profile_image: profileImage
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        return { error: errorData.error || 'Failed to update profile' }
      }

      const { user: updatedUser } = await response.json()
      setUser(updatedUser)
      return { error: null }
    } catch (error) {
      console.error('Error updating profile:', error)
      return { error: 'Failed to update profile' }
    }
  }

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

