import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUserScore } from "@/lib/scores";
import { checkSingleBluffAnswer, calculateBluffBusterScore, getBluffBusterProgress } from "@/lib/validation";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface Person {
  id: string;
  name: string;
}

interface Description {
  id: string;
  text: string;
}

interface GameStatement {
  personId: string;
  descriptionId: string;
  personName: string;
  statement: string;
  isAnswered?: boolean;
  isCorrect?: boolean;
  userAnswer?: boolean;
}

const Level4Game = () => {
  // People mapping
  const people: Person[] = [
    { id: "1", name: "Jidnesh (JD)" },
    { id: "2", name: "Mohammed (Mo)" },
    { id: "3", name: "Mark" },
    { id: "4", name: "Daniella (Dani)" },
    { id: "5", name: "Leigh" },
    { id: "6", name: "Charles" },
    { id: "7", name: "Nishtha" },
    { id: "8", name: "Suraj" },
    { id: "9", name: "Ted" },
    { id: "10", name: "Jaymin" },
    { id: "11", name: "Aparna" },
    { id: "12", name: "Laissa" },
    { id: "13", name: "Prerna" }
  ];

  // Descriptions mapping
  const descriptions: Description[] = [
    { id: "22", text: "football fan and is writing an autobiography" },
    { id: "26", text: "loves baking and watching F1" },
    { id: "29", text: "Has been a part of Hollywood movie crew" },
    { id: "54", text: "Has met the Queen of England and Rishi Sunak in a span of one week" },
    { id: "48", text: "If not travelling, love to practise ballet and ceramic crafts" },
    { id: "74", text: "Can speak 5 sentences in Hindi" },
    { id: "21", text: "loves to play cricket and chess" },
    { id: "19", text: "Always watches FRIENDS when eating" },
    { id: "39", text: "Plays golf as well as soccer" },
    { id: "47", text: "Has a graduate degree in Political Science" },
    { id: "35", text: "Has read one Harry Potter Book in espanol" },
    { id: "32", text: "Can fluently converse in 5 languages" },
    { id: "41", text: "Can binge watch Naruto on repeat" }
  ];

  // Person-Description assignments
  const gameStatements: GameStatement[] = [
    { personId: "1", descriptionId: "22", personName: "Jidnesh (JD)", statement: "football fan and is writing an autobiography" },
    { personId: "2", descriptionId: "26", personName: "Mohammed (Mo)", statement: "loves baking and watching F1" },
    { personId: "3", descriptionId: "29", personName: "Mark", statement: "Has been a part of Hollywood movie crew" },
    { personId: "4", descriptionId: "54", personName: "Daniella (Dani)", statement: "Has met the Queen of England and Rishi Sunak in a span of one week" },
    { personId: "5", descriptionId: "48", personName: "Leigh", statement: "If not travelling, love to practise ballet and ceramic crafts" },
    { personId: "6", descriptionId: "74", personName: "Charles", statement: "Can speak 5 sentences in Hindi" },
    { personId: "7", descriptionId: "21", personName: "Nishtha", statement: "loves to play cricket and chess" },
    { personId: "8", descriptionId: "19", personName: "Suraj", statement: "Always watches FRIENDS when eating" },
    { personId: "9", descriptionId: "39", personName: "Ted", statement: "Plays golf as well as soccer" },
    { personId: "10", descriptionId: "47", personName: "Jaymin", statement: "Has a graduate degree in Political Science" },
    { personId: "11", descriptionId: "35", personName: "Aparna", statement: "Has read one Harry Potter Book in espanol" },
    { personId: "12", descriptionId: "32", personName: "Laissa", statement: "Can fluently converse in 5 languages" },
    { personId: "13", descriptionId: "41", personName: "Prerna", statement: "Can binge watch Naruto on repeat" }
  ];

  const [shuffledQueue, setShuffledQueue] = useState<GameStatement[]>([]);
  const [currentStatement, setCurrentStatement] = useState<GameStatement | null>(null);
  const [answeredStatements, setAnsweredStatements] = useState<GameStatement[]>([]);
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [existingScore, setExistingScore] = useState<any>(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { isAuthenticated } = useAuth();

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
    const score = await getUserScore(4); // Level 4
    
    if (score) {
      // User has completed the game
      setHasPlayedBefore(true);
      setExistingScore(score);
      setIsLoading(false);
    } else {
      // Check for partial progress
      const progress = await getBluffBusterProgress();
      
      if (progress.success && progress.tempAnswers.length > 0) {
        // User has partial progress - rebuild state from saved answers
        const answeredIds = new Set(progress.tempAnswers.map(a => `${a.person_id}-${a.description_id}`));
        
        const answered: GameStatement[] = [];
        let correctCount = 0;
        
        progress.tempAnswers.forEach(tempAnswer => {
          const statement = gameStatements.find(s => 
            s.personId === tempAnswer.person_id && s.descriptionId === tempAnswer.description_id
          );
          if (statement) {
            const answeredStatement = {
              ...statement,
              isAnswered: true,
              isCorrect: tempAnswer.is_correct,
              userAnswer: tempAnswer.user_answer
            };
            answered.push(answeredStatement);
            
            if (tempAnswer.is_correct) {
              correctCount++;
            }
          }
        });
        
        setAnsweredStatements(answered);
        setCorrectCount(correctCount);
        setScore(correctCount * 10); // 10 points per correct answer
        
        const unanswered = gameStatements.filter(s => !answeredIds.has(`${s.personId}-${s.descriptionId}`));
        const shuffled = unanswered.sort(() => Math.random() - 0.5);
        
        setShuffledQueue(shuffled);
        setCurrentStatement(shuffled[0] || null);
        
        // If all questions answered but no final score, trigger completion
        if (unanswered.length === 0) {
          setIsGameComplete(true);
          handleGameComplete();
        }
      } else {
        // Fresh start - no progress
        const shuffled = [...gameStatements].sort(() => Math.random() - 0.5);
        setShuffledQueue(shuffled);
        setCurrentStatement(shuffled[0] || null);
      }
      
      setIsLoading(false);
    }
  };

  const handleAnswer = async (userAnswer: boolean) => {
    if (!currentStatement || isGameComplete) return;

    console.log('Checking answer:', currentStatement.personId, currentStatement.descriptionId, 'user answer:', userAnswer);
    
    // Check answer with server for immediate feedback
    const result = await checkSingleBluffAnswer(currentStatement.personId, currentStatement.descriptionId, userAnswer);
    
    console.log('Server result:', result);
    
    // Add to answered statements with server validation result
    const answeredStatement = { 
      ...currentStatement, 
      isAnswered: true,
      isCorrect: result.isCorrect,
      userAnswer: userAnswer
    };
    
    setAnsweredStatements(prev => [...prev, answeredStatement]);
    
    // Update score immediately if correct
    if (result.isCorrect) {
      setScore(prev => prev + 10);
      setCorrectCount(prev => prev + 1);
    }
    
    // Move to next statement
    const remaining = shuffledQueue.filter(s => 
      !(s.personId === currentStatement.personId && s.descriptionId === currentStatement.descriptionId)
    );
    setShuffledQueue(remaining);
    
    if (remaining.length > 0) {
      setCurrentStatement(remaining[0]);
    } else {
      // All statements done - calculate final score
      setCurrentStatement(null);
      setIsGameComplete(true);
      handleGameComplete();
    }
  };

  const handleGameComplete = async () => {
    // Calculate final score from stored server results
    const result = await calculateBluffBusterScore();
    
    if (result.success) {
      console.log('Final score calculated:', result);
      setShowResultsModal(true);
    } else {
      console.error('Failed to calculate final score:', result.error);
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
                  You can only play this challenge once! Great job being a Bluff Buster! 🕵️
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
            ⏳ LOADING BLUFF BUSTER...
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
            🕵️ BLUFF BUSTER
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Can you spot the facts from the bluffs about your colleagues? 🤔💭
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
                {answeredStatements.length}/{gameStatements.length}
              </div>
            </div>
          </div>
        </div>

        {/* Current Statement Display */}
        {currentStatement && !isGameComplete && (
          <div className="max-w-2xl mx-auto mb-8">
            <Card className="p-8 bg-card/95 border-2 border-neon-purple animate-pulse-border">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-retro glow-cyan mb-4">
                  {currentStatement.personName}
                </h2>
                <div className="text-lg font-pixel text-gray-300 mb-6 leading-relaxed">
                  "{currentStatement.statement}"
                </div>
              </div>
              
              <div className="flex gap-6 justify-center">
                <Button
                  onClick={() => handleAnswer(true)}
                  className="font-retro text-lg px-8 py-6 bg-gradient-to-r from-neon-green to-neon-cyan hover:from-neon-cyan hover:to-neon-green"
                >
                  ✅ FACT
                </Button>
                
                <Button
                  onClick={() => handleAnswer(false)}
                  className="font-retro text-lg px-8 py-6 bg-gradient-to-r from-neon-red to-neon-pink hover:from-neon-pink hover:to-neon-red"
                >
                  ❌ BLUFF
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Answered Statements History */}
        {answeredStatements.length > 0 && (
          <div className="max-w-4xl mx-auto mb-8">
            <h3 className="text-xl font-retro glow-purple text-center mb-4">
              📋 YOUR ANSWERS
            </h3>
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {answeredStatements.map((statement, index) => (
                <Card
                  key={`${statement.personId}-${statement.descriptionId}`}
                  className={`p-4 border-2 ${
                    statement.isCorrect
                      ? 'border-neon-green bg-neon-green/20'
                      : 'border-neon-red bg-neon-red/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-retro text-sm glow-cyan mb-1">
                        {statement.personName}
                      </div>
                      <div className="font-pixel text-xs text-gray-400">
                        "{statement.statement}"
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg mb-1">
                        {statement.isCorrect ? '✅' : '❌'}
                      </div>
                      <div className="font-pixel text-xs text-gray-400">
                        You: {statement.userAnswer ? 'FACT' : 'BLUFF'}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

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
            onClick={() => logout()}
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
                  {correctCount} / {gameStatements.length}
                </div>
                <p className="font-pixel text-sm mb-2">Correct Detections</p>
                
                <div className="text-3xl font-retro glow-cyan mb-4">
                  {score} POINTS
                </div>
                
                <div className="bg-background/70 border border-neon-purple rounded-lg p-4">
                  <p className="font-pixel text-sm glow-purple animate-pulse">
                    {correctCount === gameStatements.length
                      ? "🎉 Perfect! You're a master detective, and know the entire team inside out! No bluff gets past you! 🕵️✨"
                      : correctCount < gameStatements.length / 2
                        ? "🤔 Hmm, those SI folks are trickier than they look! Time for more coffee chats! ☕😅"
                        : "📈 Nice work! Your bluff-busting skills are getting sharper, and you are en-route to getting know the team! 🔍💫"
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
                  You have unsaved progress! Until you finish the challenge and complete all statements, your score won't be saved.
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

export default Level4Game;