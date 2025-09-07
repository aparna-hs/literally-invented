import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { validateLevel1Answers } from "@/lib/validation";
import { getUserScore } from "@/lib/scores";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface Colleague {
  id: string;
  name: string;
}

interface Description {
  id: string;
  text: string;
  emoji: string;
}

const Level1Game = () => {
  const colleagues: Colleague[] = [
    { id: "1", name: "André" },
    { id: "2", name: "Arundhati" },
    { id: "3", name: "Vikrant" },
    { id: "4", name: "Ana" },
    { id: "5", name: "Preeti" },
    { id: "6", name: "Sagar" },
    { id: "7", name: "Matt" },
    { id: "8", name: "Dipanjan" },
    { id: "9", name: "Laura" },
    { id: "10", name: "Gaurav" },
    { id: "11", name: "Edward" },
    { id: "12", name: "Shreeya" },
    { id: "13", name: "Shereen" },
    { id: "14", name: "Christopher" },
    { id: "15", name: "Rishav" },
    { id: "16", name: "Chhavi" },
    { id: "17", name: "Taylor" }
  ];

  const descriptions: Description[] = [
    { id: "44", text: "Co-founded a magazine and was a football (soccer) columnist, Manchester United fan", emoji: "⚽" },
    { id: "57", text: "From the south of France, has studied & worked in Finland, Australia, New Zealand, likes knitting, outdoor sports, live music", emoji: "🇫🇷" },
    { id: "32", text: "A cricket fan, plays online games", emoji: "🏏" },
    { id: "42", text: "Loves fashion, dancing, and her cat", emoji: "💃" },
    { id: "31", text: "Likes hikes, treks, and gardening", emoji: "🥾" },
    { id: "61", text: "Plays Chess & Table Tennis", emoji: "♟️" },
    { id: "22", text: "Gamer, graphic design is his passion", emoji: "🎮" },
    { id: "36", text: "Born & raised in Jamaica, is the youngest of all his siblings, mountain biker, a NY'er who moved to Connecticut, one of the few people in the world to do an actual negative flight", emoji: "🇯🇲" },
    { id: "73", text: "Analytics queen", emoji: "📊" },
    { id: "34", text: "Wanted to be a pilot - was in training to become a fighter pilot cadet for the Indian Air Force", emoji: "✈️" },
    { id: "75", text: "Powerpoint wizard, is a DJ", emoji: "🎧" },
    { id: "46", text: "From Miami, loves basketball (Go Heat), loves Drake", emoji: "🏀" },
    { id: "72", text: "Native New Yorker, is a weighlifter, loves film & cooking", emoji: "🏋️" },
    { id: "56", text: "Ice hockey player, loves live music", emoji: "🏒" },
    { id: "80", text: "Is really into biohacking, gymnastics & weightlifting, has 2 dogs & 2 cats", emoji: "🤸" },
    { id: "35", text: "Grew up in different cities of northern india, master skills in pottery", emoji: "🏺" },
    { id: "77", text: "Bachelors degree in Pyschology and loves going to converts and camping", emoji: "🏕️" }
  ];

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [shuffledNames, setShuffledNames] = useState<Colleague[]>([]);
  const [saving, setSaving] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [hasPlayedBefore, setHasPlayedBefore] = useState(false);
  const [existingScore, setExistingScore] = useState<any>(null);
  
  const { isAuthenticated } = useAuth();

  const [showExitWarning, setShowExitWarning] = useState(false);

  const handleNavigation = (path: string) => {
    if (!isSubmitted && Object.keys(matches).length > 0) {
      setShowExitWarning(true);
      return;
    }
    window.location.href = path;
  };

  const confirmExit = (path: string) => {
    setShowExitWarning(false);
    window.location.href = path;
  };

  // Shuffle names and check if user has played before
  useEffect(() => {
    const shuffled = [...colleagues].sort(() => Math.random() - 0.5);
    setShuffledNames(shuffled);
    
    // Check if user has already played this level
    if (isAuthenticated) {
      checkExistingScore();
    }
  }, [isAuthenticated]);

  const checkExistingScore = async () => {
    const score = await getUserScore(1); // Level 1
    if (score) {
      setHasPlayedBefore(true);
      setExistingScore(score);
      setIsSubmitted(true); // Show completed state
    }
  };

  const handleDragStart = (e: React.DragEvent, nameId: string) => {
    setDraggedItem(nameId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, descriptionId: string) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [descriptionId]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const handleRemoveMatch = (descriptionId: string) => {
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[descriptionId];
      return newMatches;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setSaving(true);
    
    // Transform matches to format expected by database function
    // matches is currently: { "description_id": "person_id" }
    // database expects: { "person_id": "description_id" }
    const transformedMatches: Record<string, string> = {};
    Object.entries(matches).forEach(([descriptionId, personId]) => {
      transformedMatches[personId] = descriptionId;
    });
    
    console.log('Original matches:', matches);
    console.log('Transformed for database:', transformedMatches);
    
    // Validate answers on server-side (secure)
    const validationResult = await validateLevel1Answers(transformedMatches);
    
    if (!validationResult.success) {
      console.error('Answer validation failed:', validationResult.error);
      setSaving(false);
      return;
    }
    
    console.log('Server validation - Correct matches:', validationResult.correct_matches, 'Score:', validationResult.score);
    console.log('Score automatically saved by database function');
    
    // Store validation result for display
    setValidationResult(validationResult);
    
    setSaving(false);
    setShowResultsModal(true);
  };

  const resetGame = () => {
    if (hasPlayedBefore) {
      // Can't reset if already played - redirect home
      window.location.href = '/';
      return;
    }
    
    const shuffled = [...colleagues].sort(() => Math.random() - 0.5);
    setShuffledNames(shuffled);
    setMatches({});
    setIsSubmitted(false);
    setShowResultsModal(false);
  };

  const getScoreMessage = () => {
    if (!validationResult) return "";
    
    const correctMatches = validationResult.correct_matches;
    const total = validationResult.total_questions;

    if (correctMatches === total) {
      return "woah! you do know the team well, you are literally most caffeinated! ☕✨";
    } else if (correctMatches < total / 2) {
      return "aah you should do more coffee chats and visit social-servicing-innovation more often ☕😅";
    } else {
      return "not bad! but there's always room for more coffee chats ☕🤔";
    }
  };

  const getMatchedName = (descriptionId: string) => {
    const nameId = matches[descriptionId];
    return colleagues.find(colleague => colleague.id === nameId);
  };

  const isNameUsed = (nameId: string) => {
    return Object.values(matches).includes(nameId);
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
        {/* Animated Background Grid */}
        <div className="absolute inset-0 retro-grid opacity-20"></div>
        
        {/* Scanline Effect */}
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
                  You can only play this challenge once! Great job learning more about team SI! 🔍
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

  return (
    <div 
      className="min-h-screen bg-background relative overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.85), rgba(0, 0, 0, 0.9)), url(${retroBg})`,
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
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-retro font-black mb-4 glow-pink animate-pulse-border">
            🔍 SQUAD SCANNER
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Drag to match who's who based on these clues! 🔍
          </p>
        </header>

        <div className="space-y-8 max-w-6xl mx-auto pb-8">
          {/* Descriptions Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-retro glow-cyan text-center mb-4">
              👥 DROP NAMES ON DESCRIPTIONS
            </h2>
            
            <div className="bg-background/70 border border-neon-cyan rounded-lg p-3 max-w-2xl mx-auto mb-6">
              <p className="font-pixel text-xs text-neon-cyan text-center">
                💡 TIP: Click on matched names to remove them and try again!
              </p>
            </div>
            
            {descriptions.map((description) => {
              const matchedName = getMatchedName(description.id);
              // Check if the person matched to this description got it correct
              const matchedPersonId = matches[description.id];
              const isCorrect = matchedPersonId ? validationResult?.results?.[matchedPersonId] : false;
              const showResult = isSubmitted && validationResult;
              
              return (
                <Card 
                  key={description.id}
                  className={`p-4 bg-card/90 border-2 transition-all duration-300 ${
                    showResult 
                      ? isCorrect 
                        ? 'border-neon-green' 
                        : 'border-neon-red'
                      : 'border-neon-cyan hover:border-neon-pink'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{description.emoji}</span>
                        <p className="font-pixel text-sm text-gray-300">
                          {description.text}
                        </p>
                        {showResult && (
                          <span className="text-xl ml-2">
                            {isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div 
                      className={`w-32 h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300 ${
                        showResult
                          ? isCorrect
                            ? 'border-neon-green bg-neon-green/20'
                            : 'border-neon-red bg-neon-red/20'
                          : matchedName 
                            ? 'border-neon-green bg-neon-green/20' 
                            : 'border-gray-400 hover:border-neon-pink'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, description.id)}
                    >
                      {matchedName ? (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => !isSubmitted && handleRemoveMatch(description.id)}
                        >
                          <span className="text-sm font-retro glow-pink">{matchedName.name}</span>
                        </div>
                      ) : (
                        <span className="text-xs font-pixel text-gray-400">DROP HERE</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Fixed Names Panel - Always Visible */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t-2 border-neon-cyan backdrop-blur-sm z-50 p-4">
          <h3 className="text-lg font-retro glow-cyan text-center mb-3">
            🚀 DRAG THESE NAMES
          </h3>
          
          <div className="flex flex-wrap gap-2 justify-center max-w-6xl mx-auto">
            {shuffledNames.map((colleague) => (
              <div
                key={colleague.id}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded border-2 cursor-grab active:cursor-grabbing transition-all duration-300 select-none ${
                  isNameUsed(colleague.id)
                    ? 'bg-gray-600/50 border-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-card border-neon-purple hover:border-neon-pink hover:scale-105'
                }`}
                draggable={!isNameUsed(colleague.id) && !isSubmitted}
                onDragStart={(e) => handleDragStart(e, colleague.id)}
                onDragEnd={() => setDraggedItem(null)}
              >
                <span className="font-retro text-sm glow-purple whitespace-nowrap">
                  {colleague.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-2 mb-8">
          <Button
            onClick={handleSubmit}
            disabled={hasPlayedBefore || isSubmitted || Object.keys(matches).length !== descriptions.length}
            size="lg"
            className="font-retro text-xl px-8 py-4 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink transition-all duration-300 transform hover:scale-105"
          >
            ⚡ EXECUTE MATCH PROTOCOL ⚡
          </Button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-center gap-4 mb-48">
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
              if (!isSubmitted && Object.keys(matches).length > 0) {
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

        {/* Results Modal - Appears on top first */}
        {isSubmitted && showResultsModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <Card className="max-w-lg w-full p-6 bg-card/95 border-2 border-neon-cyan animate-pulse-border">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-retro glow-cyan">MISSION RESULTS</h3>
                <button
                  onClick={() => setShowResultsModal(false)}
                  className="text-2xl text-gray-400 hover:text-neon-pink transition-colors"
                >
                  ✕
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-retro glow-pink mb-2 animate-bounce">
                  {validationResult ? `${validationResult.correct_matches} / ${validationResult.total_questions}` : '0 / 17'}
                </div>
                <p className="font-pixel text-sm mb-2">Correct Matches</p>
                
                <div className="text-3xl font-retro glow-cyan mb-4">
                  {validationResult ? `${validationResult.score} POINTS` : '0 POINTS'}
                </div>
                
                {/* Quirky Score Message */}
                <div className="bg-background/70 border border-neon-purple rounded-lg p-4">
                  <p className="font-pixel text-sm glow-purple animate-pulse">
                    {getScoreMessage()}
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

        {/* Results at Bottom (when modal is closed) */}
        {isSubmitted && !showResultsModal && (
          <div className="mt-8 text-center mb-32">
            <Card className="max-w-lg mx-auto p-6 bg-card/90 border-neon-cyan">
              <h3 className="text-xl font-retro glow-cyan mb-4">MISSION RESULTS</h3>
              <div className="text-3xl font-retro glow-pink mb-2">
                {validationResult ? `${validationResult.correct_matches} / ${validationResult.total_questions}` : '0 / 17'}
              </div>
              <p className="font-pixel text-sm mb-2">Correct Matches</p>
              
              <div className="text-2xl font-retro glow-cyan mb-4">
                {validationResult ? `${validationResult.score} POINTS` : '0 POINTS'}
              </div>
              
              {/* Quirky Score Message */}
              <div className="bg-background/50 border border-neon-purple rounded-lg p-4 mt-4">
                <p className="font-pixel text-sm glow-purple animate-pulse">
                  {getScoreMessage()}
                </p>
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
                  You have unsaved progress! Until you finish the challenge and submit your answers, your score won't be saved.
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

export default Level1Game;