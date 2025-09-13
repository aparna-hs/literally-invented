import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserScore } from "@/lib/scores";
import { checkSingleLevel2Answer, calculateLevel2Score, getLevel2Progress } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface Colleague {
  id: string;
  name: string;
  isCorrect?: boolean; // For dropped items
  droppedYear?: number; // Which year they were dropped into
}

const Level2Game = () => {
  const colleagues: Colleague[] = [
    { id: "1", name: "Ashank" },
    { id: "2", name: "Christian" },
    { id: "3", name: "Danielle" },
    { id: "4", name: "Deba" },
    { id: "5", name: "Garima" },
    { id: "6", name: "Gayatri" },
    { id: "7", name: "Harshad" },
    { id: "8", name: "Kara" },
    { id: "9", name: "Kyle" },
    { id: "10", name: "Lindsay" },
    { id: "11", name: "Matthew" },
    { id: "12", name: "Nikita" },
    { id: "13", name: "Prince" },
    { id: "14", name: "Raiid" },
    { id: "15", name: "Sachin" },
    { id: "16", name: "Shalini" },
    { id: "17", name: "Toni" },
    { id: "18", name: "Varun" }
  ];

  const [shuffledQueue, setShuffledQueue] = useState<Colleague[]>([]);
  const [currentName, setCurrentName] = useState<Colleague | null>(null);
  const [bucket2024, setBucket2024] = useState<Colleague[]>([]);
  const [bucket2025, setBucket2025] = useState<Colleague[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [existingScore, setExistingScore] = useState<any>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [alreadyAnswered, setAlreadyAnswered] = useState<Set<string>>(new Set());
  
  const { isAuthenticated } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/';
      return;
    }
  }, [isAuthenticated]);

  const handleNavigation = (path: string) => {
    // No exit warning needed - progress auto-saved to database
    window.location.href = path;
  };

  const confirmExit = (path: string) => {
    setShowExitWarning(false);
    window.location.href = path;
  };


  // Setup game queue and check if user has played before
  useEffect(() => {
    if (isAuthenticated) {
      checkExistingScore();
    }
  }, [isAuthenticated]);

  const checkExistingScore = async () => {
    const score = await getUserScore(2); // Level 2
    
    if (score) {
      // User has completed the game
      setHasPlayedBefore(true);
      setExistingScore(score);
      setIsLoading(false);
    } else {
      // Check for partial progress
      const progress = await getLevel2Progress();
      
      if (progress.success && progress.tempAnswers.length > 0) {
        // User has partial progress - rebuild buckets from saved answers
        const answeredSet = new Set(progress.tempAnswers.map(a => a.player_id.toString()));
        setAlreadyAnswered(answeredSet);
        
        // Rebuild buckets from temp answers
        const new2024: Colleague[] = [];
        const new2025: Colleague[] = [];
        let correctCount = 0;
        
        progress.tempAnswers.forEach(tempAnswer => {
          const colleague = colleagues.find(c => c.id === tempAnswer.player_id.toString());
          if (colleague) {
            const colleagueWithResult = {
              ...colleague,
              isCorrect: tempAnswer.is_correct,
              droppedYear: tempAnswer.submitted_year
            };
            
            if (tempAnswer.submitted_year === 2024) {
              new2024.push(colleagueWithResult);
            } else {
              new2025.push(colleagueWithResult);
            }
            
            if (tempAnswer.is_correct) {
              correctCount++;
            }
          }
        });
        
        setBucket2024(new2024);
        setBucket2025(new2025);
        setCorrectCount(correctCount);
        setScore(correctCount * 10); // 10 points per correct answer
        
        const unanswered = colleagues.filter(c => !answeredSet.has(c.id));
        const shuffled = unanswered.sort(() => Math.random() - 0.5);
        
        setShuffledQueue(shuffled);
        setCurrentName(shuffled[0] || null);
        
        // If all questions answered but no final score, trigger completion
        if (unanswered.length === 0) {
          setIsGameComplete(true);
          handleGameComplete();
        }
      } else {
        // Fresh start - no progress
        const shuffled = [...colleagues].sort(() => Math.random() - 0.5);
        setShuffledQueue(shuffled);
        setCurrentName(shuffled[0] || null);
      }
      
      setIsLoading(false);
    }
  };

  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});

  const handleDropToBucket = async (year: number) => {
    if (!currentName || isGameComplete) return;

    console.log('Checking answer:', currentName.id, currentName.name, 'year:', year);
    
    // Check answer with server for immediate feedback
    const result = await checkSingleLevel2Answer(currentName.id, year);
    
    console.log('Server result:', result);
    
    // Add to bucket with server validation result
    const droppedColleague = { 
      ...currentName, 
      droppedYear: year, 
      isCorrect: result.isCorrect 
    };
    
    if (year === 2024) {
      setBucket2024(prev => [...prev, droppedColleague]);
    } else {
      setBucket2025(prev => [...prev, droppedColleague]);
    }
    
    // Update score immediately if correct
    if (result.isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }
    
    // Move to next name
    const remaining = shuffledQueue.filter(c => c.id !== currentName.id);
    setShuffledQueue(remaining);
    
    if (remaining.length > 0) {
      setCurrentName(remaining[0]);
    } else {
      // All names done - calculate final score
      setCurrentName(null);
      setIsGameComplete(true);
      handleGameComplete();
    }
  };

  const handleGameComplete = async () => {
    // Calculate final score from stored server results
    const result = await calculateLevel2Score();
    
    if (result.success) {
      console.log('Final score calculated:', result);
      setShowResultsModal(true);
    } else {
      console.error('Failed to calculate final score:', result.error);
    }
  };

  const getScoreMessage = () => {
    if (!validationResult) return "";
    
    const correctMatches = validationResult.correct_matches;
    const total = validationResult.total_questions;

    if (correctMatches === total) {
      return "🎉 Perfect! You really know when everyone joined the team! Time travel skills activated! ⏰✨";
    } else if (correctMatches < total / 2) {
      return "🤔 Hmm, timeline's a bit fuzzy! Maybe check the team directory or ask around! 📅😅";
    } else {
      return "📈 Not bad! You're getting the hang of team timelines! 🕐💫";
    }
  };

  // Show "already played" screen if user has completed this level
  if (hasPlayedBefore && existingScore) {
    return (
      <div 
        className="min-h-screen bg-background relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), url(${retroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 retro-grid opacity-20"></div>
        <div className="absolute inset-0 scanlines"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <Card className="max-w-2xl w-full p-8 bg-card/95 border-2 border-neon-cyan animate-pulse-border">
              <div className="text-center">
                <h1 className="text-4xl font-retro font-black mb-4 glow-pink">
                  🎮 CHALLENGE COMPLETED!
                </h1>
                
                <div className="text-6xl mb-6 animate-bounce">✅</div>
                
                <div className="bg-background/70 border border-neon-purple rounded-lg p-6 mb-6">
                  <h3 className="text-xl font-retro glow-cyan mb-4">YOUR PREVIOUS SCORE</h3>
                  <div className="text-4xl font-retro glow-pink mb-2">
                    {existingScore.score} POINTS
                  </div>
                  <p className="font-pixel text-sm text-gray-300">
                    Completed on {new Date(existingScore.completed_at).toLocaleDateString()}
                  </p>
                </div>
                
                <p className="font-pixel text-lg glow-purple mb-8">
                  You can only play this challenge once! Great job completing the timeline challenge! 🚀
                </p>
                
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="font-retro px-6 py-3 border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
                  >
                    🏠 HOME
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-retro glow-cyan animate-pulse mb-4">
            ⏳ LOADING TIMELINE...
          </div>
          <div className="text-lg font-pixel glow-purple">
            Checking your progress
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), url(${retroBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 retro-grid opacity-20"></div>
      <div className="absolute inset-0 scanlines"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-retro font-black mb-4 glow-pink animate-pulse-border">
            ⏰ TIMELINE TAKEDOWN
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            When did these amazing people join Servicing Innovation? 🚀✨
          </p>
        </header>

        {/* Current Score Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-8 bg-background/70 border border-neon-cyan rounded-lg p-4">
            <div className="text-center">
              <div className="text-lg font-retro glow-cyan">SCORE</div>
              <div className="text-2xl font-pixel text-neon-green">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-retro glow-cyan">PROGRESS</div>
              <div className="text-2xl font-pixel text-neon-green">
                {userAnswers ? Object.keys(userAnswers).length : 0}/{colleagues.length}
              </div>
            </div>
          </div>
        </div>

        {/* Current Name Display */}
        {currentName && !isGameComplete && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-4 bg-gradient-to-r from-neon-pink/20 to-neon-cyan/20 border-2 border-neon-pink rounded-full px-6 py-3 animate-pulse-border">
              <span className="text-lg font-pixel glow-pink">👤</span>
              <div className="text-2xl font-retro glow-cyan animate-pulse">
                {currentName.name}
              </div>
              <span className="text-lg">📅</span>
            </div>
            <div className="mt-4">
              <p className="text-lg font-retro glow-pink animate-bounce">
                ⬇️ CLICK A YEAR BUCKET BELOW ⬇️
              </p>
            </div>
          </div>
        )}

        {/* Drop Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-8">
          {/* 2024 Bucket */}
          <Card 
            className={`min-h-[300px] p-6 bg-card/90 border-4 transition-all duration-300 cursor-pointer ${
              currentName ? 'border-neon-purple hover:border-neon-pink hover:scale-105' : 'border-gray-600'
            }`}
            onClick={() => currentName && handleDropToBucket(2024)}
          >
            <h2 className="text-2xl font-retro glow-purple text-center mb-4">
              📅 JOINED IN 2024
            </h2>
            
            <div className="space-y-2 min-h-[200px]">
              {bucket2024.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="font-pixel text-sm text-gray-400">
                    {currentName ? 'Click here if 2024' : 'No names yet'}
                  </span>
                </div>
              ) : (
                bucket2024.map((colleague) => (
                  <div
                    key={colleague.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      colleague.isCorrect
                        ? 'bg-neon-green/20 border-neon-green'
                        : 'bg-neon-red/20 border-neon-red'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-retro text-sm glow-purple">{colleague.name}</span>
                      <span className="text-lg">
                        {colleague.isCorrect ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* 2025 Bucket */}
          <Card 
            className={`min-h-[300px] p-6 bg-card/90 border-4 transition-all duration-300 cursor-pointer ${
              currentName ? 'border-neon-cyan hover:border-neon-pink hover:scale-105' : 'border-gray-600'
            }`}
            onClick={() => currentName && handleDropToBucket(2025)}
          >
            <h2 className="text-2xl font-retro glow-cyan text-center mb-4">
              📅 JOINED IN 2025
            </h2>
            
            <div className="space-y-2 min-h-[200px]">
              {bucket2025.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <span className="font-pixel text-sm text-gray-400">
                    {currentName ? 'Click here if 2025' : 'No names yet'}
                  </span>
                </div>
              ) : (
                bucket2025.map((colleague) => (
                  <div
                    key={colleague.id}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      colleague.isCorrect
                        ? 'bg-neon-green/20 border-neon-green'
                        : 'bg-neon-red/20 border-neon-red'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-retro text-sm glow-cyan">{colleague.name}</span>
                      <span className="text-lg">
                        {colleague.isCorrect ? '✅' : '❌'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => handleNavigation('/')}
            variant="outline"
            size="sm"
            className="font-pixel border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
          >
            🏠 HOME
          </Button>
          <Button
            onClick={() => {
              if (!isGameComplete && (bucket2024.length > 0 || bucket2025.length > 0)) {
                setShowExitWarning(true);
              } else {
                logout();
              }
            }}
            variant="outline"
            size="sm"
            className="font-pixel border-neon-red text-neon-red hover:bg-neon-red/20"
          >
            🚪 LOGOUT
          </Button>
        </div>

        {/* Results Modal */}
        {isGameComplete && showResultsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 bg-card/95 border-2 border-neon-cyan animate-pulse-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-retro glow-cyan">MISSION COMPLETE!</h3>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-2xl text-gray-400 hover:text-neon-pink transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-retro glow-pink mb-2 animate-bounce">
                  {correctCount} / {colleagues.length}
                </div>
                <p className="font-pixel text-sm mb-2">Correct Placements</p>
                
                <div className="text-3xl font-retro glow-cyan mb-4">
                  {score} POINTS
                </div>
                
                <div className="bg-background/70 border border-neon-purple rounded-lg p-4">
                  <p className="font-pixel text-sm glow-purple animate-pulse">
                    {correctCount === colleagues.length 
                      ? "🎉 Perfect! You really know when everyone joined the team! Time travel skills activated! ⏰✨"
                      : correctCount < colleagues.length / 2
                        ? "🤔 Hmm, timeline's a bit fuzzy! Maybe ask around during coffee chats?! 📅😅"
                        : "📈 Not bad! You're getting the hang of team timelines! 🕐💫"
                    }
                  </p>
                </div>
                
                <div className="mt-6 flex gap-4 justify-center">
                  <Button
                    onClick={() => window.location.href = '/'}
                    variant="outline"
                    className="font-retro border-neon-cyan text-neon-cyan hover:bg-neon-cyan/20"
                  >
                    🏠 HOME
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <Card className="max-w-md w-full p-6 bg-card/95 border-2 border-neon-red animate-pulse-border">
              <div className="text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-retro glow-red mb-4">WAIT!</h3>
                <p className="font-pixel text-sm mb-6">
                  You have unsaved progress! Until you finish the challenge and complete all placements, your score won't be saved.
                </p>
                
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setShowExitWarning(false)}
                    className="font-retro bg-neon-green hover:bg-neon-cyan"
                  >
                    🔄 CONTINUE PLAYING
                  </Button>
                  <Button
                    onClick={() => confirmExit('/')}
                    variant="outline"
                    className="font-retro border-neon-red text-neon-red hover:bg-neon-red/20"
                  >
                    🚪 LEAVE ANYWAY
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Level2Game;