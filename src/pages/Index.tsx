import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/LoginForm";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import retroBg from "@/assets/retro-gaming-bg.jpg";

const Index = () => {
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [userTotalScore, setUserTotalScore] = useState<number>(0);
  const [completedChallenges, setCompletedChallenges] = useState<number>(0);
  const [loadingScore, setLoadingScore] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

  // Fetch user's total score when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserScore();
    }
  }, [isAuthenticated, user]);

  const fetchUserScore = async () => {
    if (!user) return;
    
    setLoadingScore(true);
    try {
      // Get completed scores
      const { data: completedScores } = await supabase
        .from('scores')
        .select('score, level')
        .eq('user_id', user.id);

      let totalScore = 0;
      let challengeCount = 0;

      if (completedScores) {
        totalScore = completedScores.reduce((sum, score) => sum + score.score, 0);
        challengeCount = completedScores.length;
      }

      // Get temp scores from Level 2 (Timeline Takedown) - only if not completed
      const level2Completed = completedScores?.find(s => s.level === 2);
      if (!level2Completed) {
        const { data: level2TempScore } = await supabase
          .rpc('get_level2_temp_score', { 
            player_user_id: user.id 
          });

        if (level2TempScore > 0) {
          totalScore += level2TempScore;
          // Don't count as completed challenge, just add score
        }
      }

      // Get temp scores from Level 4 (Bluff Buster) - only if not completed
      const level4Completed = completedScores?.find(s => s.level === 4);
      if (!level4Completed) {
        const { data: level4TempScore } = await supabase
          .rpc('get_bluff_buster_temp_score', { 
            player_user_id: user.id 
          });

        if (level4TempScore > 0) {
          totalScore += level4TempScore;
          // Don't count as completed challenge, just add score
        }
      }

      // Get temp scores from Level 3 (Crossword) - only if not completed
      const level3Completed = completedScores?.find(s => s.level === 3);
      if (!level3Completed) {
        const { data: level3TempScore } = await supabase
          .rpc('get_crossword_temp_score', { 
            player_user_id: user.id 
          });

        if (level3TempScore > 0) {
          totalScore += level3TempScore;
          // Don't count as completed challenge, just add score
        }
      }

      setUserTotalScore(totalScore);
      setCompletedChallenges(challengeCount);

      // Show celebration if user completed all 4 games
      if (challengeCount === 4) {
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Error fetching user score:', error);
    } finally {
      setLoadingScore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-retro glow-cyan animate-pulse">
            ⏳ LOADING GAME...
          </div>
        </div>
      </div>
    );
  }


  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.8)), url(${retroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Animated Background Grid */}
      <div className="absolute inset-0 retro-grid opacity-20"></div>
      
      {/* Scanline Effect */}
      <div className="absolute inset-0 scanlines"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-retro font-black mb-4 glow-pink animate-pulse-border">
            🎮 LITERALLY INVENTED
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-retro mb-2 glow-cyan">
            The Ultimate SI Team Discovery Game
          </h2>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Think you know your teammates? Prove it! ⚡
          </p>
          
          <div className="flex justify-center gap-4 mb-8">
            <Dialog open={showRules} onOpenChange={setShowRules}>
              <DialogTrigger asChild>
                <Button variant="neon" size="sm">
                  📋 GAME RULES
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-neon-cyan">
                <DialogHeader>
                  <DialogTitle className="font-retro glow-cyan text-center text-2xl">GAME RULES</DialogTitle>
                  <div className="border-b border-neon-cyan/40 mb-6"></div>
                  <DialogDescription className="font-pixel space-y-3">
                    <div className="mb-6">
                      <h3 className="font-retro text-lg glow-pink mb-4">🎮 CHALLENGES:</h3>
                      <div className="space-y-3 ml-2">
                        <div>⏰ <strong>TIMELINE TAKEDOWN:</strong> Sort SI team members by their join year (2024 vs 2025)</div>
                        <div>🔍 <strong>SQUAD SCANNER:</strong> Match colleagues with their unique talents and hobbies</div>
                        <div>🕵️ <strong>BLUFF BUSTER:</strong> Detect facts vs bluffs about your SI teammates</div>
                        <div>🧩 <strong>CROSSWORD CONQUEST:</strong> Solve team-themed crossword clues</div>
                      </div>
                    </div>
                    
                    <div className="border-t border-neon-purple/30 pt-4 space-y-3">
                      <div className="bg-neon-cyan/10 border border-neon-cyan/30 rounded p-3">
                        <strong className="text-neon-cyan">⚡ SCORING:</strong> Earn 10 points per correct answer, build your total score
                      </div>
                      <div className="bg-neon-orange/10 border border-neon-orange/30 rounded p-3">
                        <strong className="text-neon-orange">🎯 ONE-TIME PLAY:</strong> Each challenge can only be completed once. Once you finish a challenge, you cannot replay it
                      </div>
                      <div className="bg-neon-pink/10 border border-neon-pink/30 rounded p-3">
                        <strong className="text-neon-pink">🏆 WIN CONDITION:</strong> Complete challenges and top the leaderboard to become the Ultimate SI Team Expert!
                      </div>
                    </div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="retro" 
              size="sm"
              onClick={() => setShowLeaderboard(true)}
            >
              🏆 LEADERBOARD
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex justify-center max-w-2xl mx-auto">
          {!isAuthenticated ? (
            /* Login Section */
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <div className="text-4xl mb-2 animate-float">🕹️</div>
                <h3 className="text-xl font-retro glow-pink mb-2">
                  READY TO PLAY?
                </h3>
                <p className="font-pixel text-sm text-muted-foreground">
                  Log in to start your colleague discovery journey
                </p>
              </div>
              
              <div className="w-full max-w-sm">
                <LoginForm />
              </div>
            </div>
          ) : (
            /* Authenticated User Section */
            <div className="flex flex-col items-center">
              <div className="mb-6 text-center">
                <div className="text-4xl mb-2 animate-float">🕹️</div>
                <h3 className="text-xl font-retro glow-pink mb-2">
                  WELCOME {user?.display_name?.toUpperCase()}!
                </h3>
                
                {/* User Score Display */}
                {loadingScore ? (
                  <div className="font-pixel text-sm text-muted-foreground animate-pulse">
                    ⏳ Loading your stats...
                  </div>
                ) : userTotalScore > 0 ? (
                  <div className="bg-background/70 border border-neon-cyan rounded-lg p-3 mb-4 inline-block">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-lg font-retro glow-cyan">TOTAL SCORE</div>
                        <div className="text-2xl font-pixel text-neon-green">{userTotalScore}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-retro glow-cyan">COMPLETED</div>
                        <div className="text-2xl font-pixel text-neon-green">{completedChallenges}/4</div>
                      </div>
                    </div>
                  </div>
                ) : null}
                
                <p className="font-pixel text-sm text-muted-foreground">
                  Choose your challenge and prove your team knowledge
                </p>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <Button 
                  onClick={() => window.location.href = '/level2'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan"
                >
                  ⏰ TIMELINE TAKEDOWN
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/level1'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple"
                >
                  🔍 SQUAD SCANNER
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/level4'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-orange to-neon-purple hover:from-neon-purple hover:to-neon-orange"
                >
                  🕵️ BLUFF BUSTER
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/level3'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-green to-neon-cyan hover:from-neon-cyan hover:to-neon-green"
                >
                  🧩 CROSSWORD CONQUEST
                </Button>
                
                <Button 
                  onClick={logout}
                  variant="outline"
                  className="w-full font-pixel text-sm py-3 border-neon-red text-neon-red hover:bg-neon-red/20"
                >
                  🚪 LOGOUT
                </Button>
              </div>
            </div>
          )}
        </div>


        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="border-t border-neon-cyan/20 pt-8">
            <p className="font-pixel text-sm text-muted-foreground">
              <span className="text-neon-green">Level Up Your SI Team Knowledge! 🚀</span>
            </p>
            <div className="mt-2 text-xs font-pixel text-muted-foreground">
              © 2025 • Made with 💜 by <span className="glow-pink">R&R Team</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Leaderboard Modal */}
      <Leaderboard 
        isOpen={showLeaderboard} 
        onClose={() => setShowLeaderboard(false)} 
      />

      {/* All Games Completed Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto p-4 sm:p-6 bg-gradient-to-br from-neon-purple/20 to-neon-cyan/20 border-2 sm:border-4 border-neon-pink rounded-lg animate-pulse-border my-auto">
            <div className="text-center">
              <div className="text-4xl sm:text-6xl mb-4 animate-bounce">🏆</div>
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-retro font-black mb-3 glow-pink animate-pulse">
                LEGENDARY!
              </h1>
              <h2 className="text-lg sm:text-2xl font-retro glow-cyan mb-4">
                ULTIMATE SI TEAM EXPERT
              </h2>
              
              <div className="bg-background/80 border-2 border-neon-green rounded-lg p-3 sm:p-4 mb-4">
                <div className="text-3xl sm:text-5xl font-retro glow-green mb-2">
                  {userTotalScore} POINTS
                </div>
                <p className="font-pixel text-sm sm:text-base text-neon-green glow-green">
                  ALL 4 CHALLENGES CONQUERED! 🎮✨
                </p>
              </div>
              
              <div className="bg-neon-pink/10 border border-neon-pink/30 rounded-lg p-3 mb-4">
                <p className="font-pixel text-xs sm:text-sm glow-pink animate-pulse">
                  🌟 You've mastered every challenge in the SI Team Discovery Game! 🌟
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="font-retro text-sm bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink"
                >
                  🎉 BASK IN GLORY
                </Button>
                <Button
                  onClick={() => {
                    setShowCelebration(false);
                    setShowLeaderboard(true);
                  }}
                  variant="outline"
                  className="font-retro text-sm border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
                >
                  🏆 VIEW LEADERBOARD
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
