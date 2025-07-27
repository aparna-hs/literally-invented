import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to test connection
export const testConnection = async () => {
  try {
    // First check if we have the environment variables
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    // Simple test - try to query a non-existent table (which should return a predictable error)
    const { data, error } = await supabase.from('_health_check').select('*').limit(1)
    
    // If we get a "table doesn't exist" error, that means we connected successfully!
    if (error && (error.code === 'PGRST116' || error.message?.includes('does not exist'))) {
      return { success: true, message: 'Connected to Supabase successfully! 🎉' }
    }
    
    // If we get data or no error, also success
    if (!error || data) {
      return { success: true, message: 'Connected to Supabase successfully! 🎉' }
    }

    // Any other error means real connection issues
    throw error

  } catch (error: any) {
    console.error('Supabase connection error:', error)
    const errorMessage = error?.message || error?.details || error?.hint || 'Unknown connection error'
    return { success: false, message: `Connection failed: ${errorMessage}` }
  }
}

// Export database types for later use
export type Database = {
  // We'll define these as we create tables
}