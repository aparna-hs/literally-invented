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

// Validate single crossword word on server-side
export const validateCrosswordWord = async (
  clueNumber: number, 
  direction: string, 
  userAnswer: string
): Promise<{ 
  success: boolean; 
  isCorrect: boolean; 
  correctAnswer?: string;
  score: number;
  completedWords: number;
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .rpc('validate_crossword_word', { 
        clue_number: clueNumber,
        direction: direction,
        user_answer: userAnswer,
        player_user_id: user.id
      })

    if (error) {
      console.error('Server validation error:', error)
      throw error
    }
    
    return {
      success: data.success,
      isCorrect: data.is_correct,
      correctAnswer: data.correct_answer,
      score: data.score,
      completedWords: data.completed_words
    }

  } catch (error: any) {
    console.error('Error validating crossword word:', error)
    return {
      success: false,
      isCorrect: false,
      score: 0,
      completedWords: 0,
      error: error.message
    }
  }
}

// Validate all crossword answers on server-side
export const validateCrosswordAll = async (userAnswers: Record<string, string>): Promise<{ 
  success: boolean; 
  results: Record<string, boolean>;
  score: number;
  completedWords: number;
  perfectScore: boolean;
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .rpc('validate_crossword_all', { 
        user_answers: userAnswers,
        player_user_id: user.id
      })

    if (error) {
      console.error('Server validation error:', error)
      throw error
    }
    
    return {
      success: data.success,
      results: data.results,
      score: data.score,
      completedWords: data.completed_words,
      perfectScore: data.perfect_score
    }

  } catch (error: any) {
    console.error('Error validating all crossword answers:', error)
    return {
      success: false,
      results: {},
      score: 0,
      completedWords: 0,
      perfectScore: false,
      error: error.message
    }
  }
}

// Save crossword progress (auto-save)
export const saveCrosswordProgress = async (userAnswers: Record<string, string>): Promise<{ 
  success: boolean; 
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .rpc('save_crossword_progress', { 
        user_answers: userAnswers,
        player_user_id: user.id
      })

    if (error) {
      console.error('Auto-save error:', error)
      throw error
    }
    
    return { success: true }

  } catch (error: any) {
    console.error('Error saving crossword progress:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Load crossword progress
export const getCrosswordProgress = async (): Promise<{ 
  success: boolean; 
  answers: Record<string, string>;
  score: number;
  completedWords: number;
  error?: string 
}> => {
  try {
    const user = getCurrentUser()
    if (!user) {
      throw new Error('User not authenticated')
    }
    
    const { data, error } = await supabase
      .rpc('get_crossword_progress', { 
        player_user_id: user.id
      })

    if (error) {
      console.error('Load progress error:', error)
      throw error
    }
    
    return {
      success: true,
      answers: data.answers || {},
      score: data.score || 0,
      completedWords: data.completed_words || 0
    }

  } catch (error: any) {
    console.error('Error loading crossword progress:', error)
    return {
      success: false,
      answers: {},
      score: 0,
      completedWords: 0,
      error: error.message
    }
  }
}