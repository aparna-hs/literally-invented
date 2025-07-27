import { supabase } from './supabase'

export interface User {
  id: number
  username: string
  display_name: string
  created_at: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

// Login function
export const login = async (username: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    // Query users table for matching credentials
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single()

    if (error || !data) {
      return { 
        success: false, 
        error: '🤔 Hmm, those credentials don\'t match our records. Double-check your username and password!' 
      }
    }

    // Store user in localStorage for persistence
    localStorage.setItem('literally-invented-user', JSON.stringify(data))
    
    return { 
      success: true, 
      user: data 
    }

  } catch (error) {
    console.error('Login error:', error)
    return { 
      success: false, 
      error: '🚨 Oops! Something went wrong on our end. Try again in a moment.' 
    }
  }
}

// Logout function
export const logout = () => {
  localStorage.removeItem('literally-invented-user')
  window.location.href = '/' // Redirect to home
}

// Get current user from localStorage
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('literally-invented-user')
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null
}