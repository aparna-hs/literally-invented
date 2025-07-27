import { supabase } from './supabase'
import { getCurrentUser } from './auth'

export interface GameScore {
  id?: number
  user_id: number
  level: number
  score: number
  attempts: number
  completed_at?: string
}

// Save or update score for a level
export const saveScore = async (level: number, score: number, attempts: number): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('saveScore called with level:', level, 'score:', score, 'attempts:', attempts)
    const user = getCurrentUser()
    if (!user) {
      console.log('No authenticated user found')
      return { success: false, error: 'User not authenticated' }
    }
    console.log('Authenticated user:', user.id)

    // Check if user already has a score for this level
    console.log('Checking for existing score - user_id:', user.id, 'level:', level)
    const { data: existingScore, error: fetchError } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('level', level)
      .single()

    console.log('Existing score query result:', { existingScore, fetchError })

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw fetchError
    }

    if (existingScore) {
      // Always update existing score (removed "better score" logic for debugging)
      console.log('Updating existing score - old:', existingScore.score, 'new:', score)
      console.log('Updating for user_id:', user.id, 'level:', level)
      console.log('Exact update query will be: UPDATE scores SET score =', score, ', attempts =', attempts, ', completed_at = NOW() WHERE user_id =', user.id, 'AND level =', level)
      
      const updatePayload = {
        score,
        attempts,
        completed_at: new Date().toISOString()
      }
      console.log('Update data being sent:', updatePayload)
      
      const { data: updateResult, error: updateError } = await supabase
        .from('scores')
        .update(updatePayload)
        .eq('user_id', user.id)
        .eq('level', level)
        .select()

      console.log('Update result:', { updateResult, updateError })
      if (updateError) throw updateError
    } else {
      // Insert new score
      console.log('Inserting new score:', { level, score, attempts, userId: user.id })
      const { error: insertError } = await supabase
        .from('scores')
        .insert({
          user_id: user.id,
          level,
          score,
          attempts
        })

      if (insertError) throw insertError
    }

    console.log('Score save operation completed successfully')
    return { success: true }

  } catch (error: any) {
    console.error('Error saving score:', error)
    return { success: false, error: error.message }
  }
}

// Get user's score for a specific level
export const getUserScore = async (level: number): Promise<GameScore | null> => {
  try {
    const user = getCurrentUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', user.id)
      .eq('level', level)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    return data || null

  } catch (error) {
    console.error('Error fetching user score:', error)
    return null
  }
}

// Check if user can play a level
export const canPlayLevel = async (level: number): Promise<{ canPlay: boolean; reason?: string; existingScore?: GameScore }> => {
  try {
    const existingScore = await getUserScore(level)
    
    if (!existingScore) {
      return { canPlay: true }
    }

    if (level === 1) {
      // Level 1: Can't replay after submission
      return { 
        canPlay: false, 
        reason: 'Level 1 completed - no replays allowed',
        existingScore 
      }
    }

    if (level === 2) {
      // Level 2: Can't replay after 3 attempts
      if (existingScore.attempts >= 3) {
        return { 
          canPlay: false, 
          reason: 'Level 2 completed - maximum 3 attempts used',
          existingScore 
        }
      }
      return { canPlay: true, existingScore }
    }

    return { canPlay: true, existingScore }

  } catch (error) {
    console.error('Error checking play permission:', error)
    return { canPlay: true } // Allow play if we can't check (fail open)
  }
}