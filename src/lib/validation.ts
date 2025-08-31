import { supabase } from './supabase'
import { getCurrentUser } from './auth'

// Validate Level 1 answers on server-side
export const validateLevel1Answers = async (userAnswers: Record<string, string>): Promise<{ 
  score: number; 
  correct_matches: number; 
  total_questions: number; 
  perfect_score: boolean; 
  results?: Record<string, boolean>;
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
      perfect_score: data.perfect_score,
      results: data.results
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

// Check single Level 2 answer and get immediate feedback
export const checkSingleLevel2Answer = async (id: string, year: number): Promise<{ 
  isCorrect: boolean; 
  success: boolean; 
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .rpc('check_single_answer', { 
        person_id: parseInt(id), // Send ID instead of name
        submitted_year: parseInt(year.toString()), // Ensure it's an integer
        player_user_id: user.id
      })

    if (error) {
      console.error('Server check error:', error)
      throw error
    }
    
    console.log('Raw server response:', data, 'type:', typeof data);
    
    return {
      success: true,
      isCorrect: data === 1 || data === true || data === 'true' // Handle multiple formats
    }

  } catch (error: any) {
    console.error('Error checking single answer:', error)
    return {
      success: false,
      isCorrect: false,
      error: error.message
    }
  }
}

// Calculate final Level 2 score from all stored answers
export const calculateLevel2Score = async (): Promise<{ 
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
    
    const { data, error } = await supabase
      .rpc('calculate_level2_score', { 
        player_user_id: user.id
      })

    if (error) {
      console.error('Server calculation error:', error)
      throw error
    }
    
    return {
      success: true,
      score: data.score,
      correct_matches: data.correct_matches,
      total_questions: data.total_questions,
      perfect_score: data.perfect_score
    }

  } catch (error: any) {
    console.error('Error calculating score:', error)
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