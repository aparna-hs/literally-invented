import { supabase } from './supabase'
import { getCurrentUser } from './auth'

// Validate Level 1 answers on server-side
export const validateLevel1Answers = async (userAnswers: Record<string, string>): Promise<{ 
  score: number; 
  correct_matches: number; 
  total_questions: number; 
  perfect_score: boolean; 
  success: boolean; 
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    console.log('Validating answers server-side:', userAnswers, 'for user:', user.id)
    
    const { data, error } = await supabase
      .rpc('validate_level1_answers', { 
        user_answers: userAnswers,
        player_user_id: user.id
      })

    if (error) {
      console.error('Server validation error:', error)
      throw error
    }

    console.log('Server validation result:', data)
    
    return {
      success: true,
      score: data.score,
      correct_matches: data.correct_matches,
      total_questions: data.total_questions,
      perfect_score: data.perfect_score
    }

  } catch (error: any) {
    console.error('Error validating answers:', error)
    return {
      success: false,
      score: 0,
      correct_matches: 0,
      total_questions: 0,
      perfect_score: false,
      error: error.message
    }
  }
}