import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { saveScore } from "@/lib/scores";
import { useAuth } from "@/contexts/AuthContext";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface Colleague {
  id: string;
  name: string;
  invention: string;
}

interface Invention {
  id: string;
  name: string;
  emoji: string;
}

const Level1Game = () => {
  const colleagues: Colleague[] = [
    { id: "1", name: "Aparna", invention: "board-games" },
    { id: "2", name: "Raiid", invention: "retro-games" },
    { id: "3", name: "Ana", invention: "dancing" },
    { id: "4", name: "Harshad", invention: "randr" },
    { id: "5", name: "Kara", invention: "christmas" },
    { id: "6", name: "Christian", invention: "weekly-bytes" },
    { id: "7", name: "Leigh", invention: "lunch-learn" },
    { id: "8", name: "Emery", invention: "whiteboarding" },
    { id: "9", name: "Ted", invention: "football" },
    { id: "10", name: "Miriam", invention: "servicing-innovation" }
  ];

  const inventions: Invention[] = [
    { id: "board-games", name: "Board Games", emoji: "🎲" },
    { id: "retro-games", name: "Retro Games", emoji: "🕹️" },
    { id: "dancing", name: "Dancing", emoji: "💃" },
    { id: "randr", name: "R&R", emoji: "🎉" },
    { id: "christmas", name: "Christmas", emoji: "🎄" },
    { id: "weekly-bytes", name: "Weekly Bytes", emoji: "📰" },
    { id: "lunch-learn", name: "Lunch & Learn", emoji: "🍽️" },
    { id: "whiteboarding", name: "White Boarding", emoji: "📝" },
    { id: "football", name: "Football", emoji: "⚽" },
    { id: "servicing-innovation", name: "Servicing Innovation", emoji: "💡" }
  ];

  const [matches, setMatches] = useState<Record<string, string>>({});
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [shuffledInventions, setShuffledInventions] = useState<Invention[]>([]);
  const [saving, setSaving] = useState(false);
  
  const { isAuthenticated } = useAuth();

  // Shuffle inventions on component mount
  useEffect(() => {
    const shuffled = [...inventions].sort(() => Math.random() - 0.5);
    setShuffledInventions(shuffled);
  }, []);

  const handleDragStart = (e: React.DragEvent, inventionId: string) => {
    setDraggedItem(inventionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, colleagueId: string) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [colleagueId]: draggedItem
      }));
      setDraggedItem(null);
    }
  };

  const handleRemoveMatch = (colleagueId: string) => {
    setMatches(prev => {
      const newMatches = { ...prev };
      delete newMatches[colleagueId];
      return newMatches;
    });
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);
    setSaving(true);
    
    // Calculate score - 10 points per correct answer
    const correctMatches = colleagues.filter(colleague => 
      matches[colleague.id] === colleague.invention
    ).length;
    
    const score = correctMatches * 10;
    console.log('Level 1 - Correct matches:', correctMatches, 'Score:', score);
    
    // Save score to database
    if (isAuthenticated) {
      const result = await saveScore(1, score, 1); // Level 1, score, 1 attempt
      if (!result.success) {
        console.error('Failed to save score:', result.error);
      } else {
        console.log('Score saved successfully');
      }
    }
    
    setSaving(false);
    setShowResultsModal(true);
  };

  const resetGame = () => {
    const shuffled = [...inventions].sort(() => Math.random() - 0.5);
    setShuffledInventions(shuffled);
    setMatches({});
    setIsSubmitted(false);
    setShowResultsModal(false);
  };

  const getScoreMessage = () => {
    const correctMatches = colleagues.filter(colleague => 
      matches[colleague.id] === colleague.invention
    ).length;

    if (correctMatches === 10) {
      return "woah! you do know the team well, you are literally most caffeinated! ☕✨";
    } else if (correctMatches < 5) {
      return "aah you should do more coffee chats and visit social-servicing-innovation more often ☕😅";
    } else {
      return "not bad! but there's always room for more coffee chats ☕🤔";
    }
  };

  const getMatchedInvention = (colleagueId: string) => {
    const inventionId = matches[colleagueId];
    return shuffledInventions.find(inv => inv.id === inventionId);
  };

  const isInventionUsed = (inventionId: string) => {
    return Object.values(matches).includes(inventionId);
  };


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
            🎯 LEVEL 1: KNOW YOUR CREW
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Match each colleague with what they literally invented! 🚀
          </p>
        </header>

        <div className="space-y-8 max-w-4xl mx-auto pb-32">
          {/* Colleagues Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-retro glow-cyan text-center mb-6">
              👥 DROP ON TEAM MEMBERS
            </h2>
            
            {colleagues.map((colleague) => {
              const matchedInvention = getMatchedInvention(colleague.id);
              const isCorrect = isSubmitted && matches[colleague.id] === colleague.invention;
              const isWrong = isSubmitted && matches[colleague.id] && matches[colleague.id] !== colleague.invention;
              
              return (
                <Card 
                  key={colleague.id}
                  className={`p-4 bg-card/90 border-2 transition-all duration-300 ${
                    isSubmitted 
                      ? isCorrect 
                        ? 'border-green-500 bg-green-500/20' 
                        : isWrong 
                          ? 'border-red-500 bg-red-500/20'
                          : matches[colleague.id] 
                            ? 'border-gray-500 bg-gray-500/20'
                            : 'border-gray-500'
                      : 'border-neon-cyan hover:border-neon-pink'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-retro text-lg glow-cyan">
                      {colleague.name}
                    </span>
                    
                    <div 
                      className={`w-48 h-12 border-2 border-dashed rounded-lg flex items-center justify-center transition-all duration-300 ${
                        matchedInvention 
                          ? 'border-neon-green bg-neon-green/20' 
                          : 'border-gray-400 hover:border-neon-pink'
                      }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, colleague.id)}
                    >
                      {matchedInvention ? (
                        <div 
                          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => !isSubmitted && handleRemoveMatch(colleague.id)}
                        >
                          <span>{matchedInvention.emoji}</span>
                          <span className="text-xs font-pixel">{matchedInvention.name}</span>
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

        {/* Fixed Inventions Panel - Always Visible */}
        <div className="fixed bottom-0 left-0 right-0 bg-card/95 border-t-2 border-neon-cyan backdrop-blur-sm z-50 p-4">
          <h3 className="text-lg font-retro glow-cyan text-center mb-3">
            🚀 DRAG THESE INVENTIONS
          </h3>
          
          <div className="flex flex-wrap gap-2 justify-center max-w-6xl mx-auto">
            {shuffledInventions.map((invention) => (
              <div
                key={invention.id}
                className={`inline-flex items-center gap-2 px-2 py-1 rounded border-2 cursor-grab active:cursor-grabbing transition-all duration-300 select-none ${
                  isInventionUsed(invention.id)
                    ? 'bg-gray-600/50 border-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-card border-neon-purple hover:border-neon-pink hover:scale-105'
                }`}
                draggable={!isInventionUsed(invention.id) && !isSubmitted}
                onDragStart={(e) => handleDragStart(e, invention.id)}
                onDragEnd={() => setDraggedItem(null)}
              >
                <span className="text-sm">{invention.emoji}</span>
                <span className="font-pixel text-xs glow-purple whitespace-nowrap">
                  {invention.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-12 mb-32">
          <Button
            onClick={handleSubmit}
disabled={Object.keys(matches).length !== colleagues.length}
            size="lg"
            className="font-retro text-xl px-8 py-4 bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink transition-all duration-300 transform hover:scale-105"
          >
            ⚡ EXECUTE MATCH PROTOCOL ⚡
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
                <div className="text-4xl font-retro glow-pink mb-4 animate-bounce">
                  {colleagues.filter(c => matches[c.id] === c.invention).length} / {colleagues.length}
                </div>
                <p className="font-pixel text-sm mb-6">Correct Matches</p>
                
                {/* Quirky Score Message */}
                <div className="bg-background/70 border border-neon-purple rounded-lg p-4">
                  <p className="font-pixel text-sm glow-purple animate-pulse">
                    {getScoreMessage()}
                  </p>
                </div>
                
                <div className="mt-6 flex gap-4 justify-center">
                  <Button
                    onClick={resetGame}
                    className="font-retro bg-neon-purple hover:bg-neon-pink"
                  >
                    🔄 PLAY AGAIN
                  </Button>
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
              <div className="text-3xl font-retro glow-pink mb-4">
                {colleagues.filter(c => matches[c.id] === c.invention).length} / {colleagues.length}
              </div>
              <p className="font-pixel text-sm mb-4">Correct Matches</p>
              
              {/* Quirky Score Message */}
              <div className="bg-background/50 border border-neon-purple rounded-lg p-4 mt-4">
                <p className="font-pixel text-sm glow-purple animate-pulse">
                  {getScoreMessage()}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Level1Game;