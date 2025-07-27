import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card } from '@/components/ui/card'

interface LeaderboardEntry {
  user_id: number
  display_name: string
  total_score: number
  last_played: string
}

interface LeaderboardProps {
  isOpen: boolean
  onClose: () => void
}

const Leaderboard = ({ isOpen, onClose }: LeaderboardProps) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard()
    }
  }, [isOpen])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      // Fetch total scores per user across all levels
      const { data, error } = await supabase
        .from('scores')
        .select(`
          user_id,
          score,
          completed_at,
          user:users(display_name)
        `)
        .order('completed_at', { ascending: false })

      if (error) throw error

      // Group by user and sum scores
      const userScores = new Map<number, LeaderboardEntry>()

      data?.forEach((entry: any) => {
        const userId = entry.user_id
        const existing = userScores.get(userId)

        if (existing) {
          existing.total_score += entry.score
          // Keep the most recent play date
          if (new Date(entry.completed_at) > new Date(existing.last_played)) {
            existing.last_played = entry.completed_at
          }
        } else {
          userScores.set(userId, {
            user_id: userId,
            display_name: entry.user.display_name,
            total_score: entry.score,
            last_played: entry.completed_at
          })
        }
      })

      // Convert to array and sort by total score
      const sortedScores = Array.from(userScores.values())
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 10) // Top 10

      setScores(sortedScores)
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full max-h-[80vh] overflow-hidden bg-card/95 border-2 border-neon-cyan animate-pulse-border">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-retro glow-cyan">
              🏆 LEADERBOARD
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-400 hover:text-neon-pink transition-colors"
            >
              ✕
            </button>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-retro glow-pink">
              🎮 TOTAL SCORES
            </h3>
          </div>

          {/* Leaderboard Content */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-lg font-retro glow-cyan animate-pulse">
                  ⏳ LOADING SCORES...
                </div>
              </div>
            ) : scores.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-lg font-pixel text-gray-400">
                  🤷‍♂️ No scores yet - be the first to play!
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((entry, index) => (
                  <Card
                    key={entry.user_id}
                    className={`p-4 border-2 ${
                      index === 0
                        ? 'border-yellow-400 bg-yellow-400/20' // Gold
                        : index === 1
                        ? 'border-gray-300 bg-gray-300/20' // Silver
                        : index === 2
                        ? 'border-orange-400 bg-orange-400/20' // Bronze
                        : 'border-neon-purple bg-neon-purple/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                        </span>
                        <div>
                          <div className="font-retro text-lg glow-cyan">
                            {entry.display_name}
                          </div>
                          <div className="font-pixel text-xs text-gray-400">
                            Last played: {new Date(entry.last_played).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-2xl font-retro ${
                          entry.total_score > 50 ? 'glow-pink' : 'glow-cyan'
                        }`}>
                          {entry.total_score}
                        </div>
                        <div className="font-pixel text-xs text-gray-400">
                          points
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="font-pixel text-xs text-gray-400">
              Total scores across all levels • Top 10 players
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Leaderboard