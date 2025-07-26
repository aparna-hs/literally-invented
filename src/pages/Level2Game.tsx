import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import retroBg from "@/assets/retro-gaming-bg.jpg";

interface Colleague {
  id: string;
  name: string;
  role: string;
  funFact: string;
  joinDate: string; // YYYY-MM format for sorting
  displayDate: string; // Human readable
  correctOrder: number; // 1 = newest, 5 = oldest
}

const Level2Game = () => {
  const colleagues: Colleague[] = [
    {
      id: "1",
      name: "Aparna",
      role: "Tech Lead",
      funFact: "Board game strategist extraordinaire",
      joinDate: "2023-08",
      displayDate: "Aug 2023",
      correctOrder: 1
    },
    {
      id: "2", 
      name: "Raiid",
      role: "Senior Developer",
      funFact: "Retro gaming console collector",
      joinDate: "2022-11",
      displayDate: "Nov 2022",
      correctOrder: 2
    },
    {
      id: "3",
      name: "Ana",
      role: "UX Designer", 
      funFact: "Salsa dancing champion",
      joinDate: "2021-03",
      displayDate: "Mar 2021",
      correctOrder: 3
    },
    {
      id: "4",
      name: "Harshad",
      role: "Product Manager",
      funFact: "R&R event planning mastermind",
      joinDate: "2020-01",
      displayDate: "Jan 2020",
      correctOrder: 4
    },
    {
      id: "5",
      name: "Christian",
      role: "DevOps Engineer",
      funFact: "Weekly Bytes newsletter curator",
      joinDate: "2019-06",
      displayDate: "Jun 2019",
      correctOrder: 5
    }
  ];

  const [currentOrder, setCurrentOrder] = useState<Colleague[]>([]);
  const [draggedItem, setDraggedItem] = useState<Colleague | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [lastAttemptCorrect, setLastAttemptCorrect] = useState<boolean | null>(null);

  // Shuffle colleagues on component mount
  useEffect(() => {
    const shuffled = [...colleagues].sort(() => Math.random() - 0.5);
    setCurrentOrder(shuffled);
  }, []);

  const handleDragStart = (e: React.DragEvent, colleague: Colleague) => {
    setDraggedItem(colleague);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the container, not just moving between items
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDragOverIndex(null);
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const dragIndex = currentOrder.findIndex(item => item.id === draggedItem.id);
    if (dragIndex === -1 || dragIndex === dropIndex) return;

    const newOrder = [...currentOrder];
    const [draggedColleague] = newOrder.splice(dragIndex, 1);
    newOrder.splice(dropIndex, 0, draggedColleague);
    
    setCurrentOrder(newOrder);
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const checkOrder = () => {
    const isCorrect = currentOrder.every((colleague, index) => 
      colleague.correctOrder === index + 1
    );

    setAttempts(prev => prev + 1);
    setLastAttemptCorrect(isCorrect);

    if (isCorrect) {
      setScore(50);
      setIsGameComplete(true);
      setShowResultsModal(true);
    } else if (attempts + 1 >= 3) {
      setScore(0);
      setIsGameComplete(true);
      setShowResultsModal(true);
    } else {
      // Show feedback for incorrect attempt, but also show modal immediately
      setShowResultsModal(true);
      // Don't auto-close anymore
    }
  };

  const getResultMessage = () => {
    if (score === 50) {
      return "🎉 Perfect timeline mastery! You know exactly when everyone joined the squad!";
    } else {
      return "🤔 Timeline's a bit fuzzy? Maybe check out the team page or ask around during coffee chats!";
    }
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
            ⏰ LEVEL 2: TIMELINE CHALLENGE
          </h1>
          
          <p className="text-lg font-pixel glow-purple mb-6">
            Order colleagues from newest hire to longest tenured! 📅
          </p>

          <div className="flex justify-center gap-8 mb-6">
            <div className="text-center">
              <div className="text-2xl font-retro glow-cyan">Attempts</div>
              <div className="text-xl font-pixel text-neon-green">{attempts}/3</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-retro glow-cyan">Score</div>
              <div className="text-xl font-pixel text-neon-green">{score}</div>
            </div>
          </div>
        </header>

        {/* Instructions */}
        <div className="max-w-2xl mx-auto mb-8">
          <Card className="p-4 bg-card/80 border border-neon-purple">
            <h3 className="font-retro text-lg glow-purple text-center mb-2">
              🎯 MISSION BRIEFING
            </h3>
            <p className="font-pixel text-sm text-center">
              Drag and drop to arrange from <span className="glow-cyan">NEWEST HIRE</span> (top) 
              to <span className="glow-pink">LONGEST TENURED</span> (bottom)
            </p>
          </Card>
        </div>

        {/* Timeline Ordering Area */}
        <div className="max-w-2xl mx-auto space-y-4 mb-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-lg font-retro glow-cyan mb-4">
              ⬆️ NEWEST HIRE
            </div>
          </div>

          {currentOrder.map((colleague, index) => (
            <div
              key={colleague.id}
              className="relative"
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
            >
              {/* Drop Zone Indicator */}
              {dragOverIndex === index && (
                <div className="absolute -top-2 left-0 right-0 h-1 bg-neon-pink rounded animate-pulse"></div>
              )}

              <Card
                className={`p-4 bg-card/90 border-2 cursor-grab active:cursor-grabbing transition-all duration-300 ${
                  draggedItem?.id === colleague.id
                    ? 'border-neon-pink bg-neon-pink/20 scale-105 rotate-2'
                    : 'border-neon-cyan hover:border-neon-purple hover:scale-102'
                }`}
                draggable={!isGameComplete}
                onDragStart={(e) => handleDragStart(e, colleague)}
                onDragEnd={handleDragEnd}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">👤</span>
                      <div>
                        <h4 className="font-retro text-lg glow-cyan">{colleague.name}</h4>
                      </div>
                    </div>
                    <p className="font-pixel text-xs text-gray-300 italic">
                      💡 {colleague.funFact}
                    </p>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg">📅</div>
                    <div className="font-pixel text-xs text-gray-400">Drag to reorder</div>
                  </div>
                </div>
              </Card>
            </div>
          ))}

          <div className="text-center">
            <div className="inline-flex items-center gap-2 text-lg font-retro glow-pink mt-4">
              ⬇️ LONGEST TENURED
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={checkOrder}
            disabled={isGameComplete || attempts >= 3}
            size="lg"
            className="font-retro text-xl px-8 py-4 bg-gradient-to-r from-neon-purple to-neon-cyan hover:from-neon-cyan hover:to-neon-purple transition-all duration-300 transform hover:scale-105"
          >
            ⚡ SUBMIT TIMELINE ORDER ⚡
          </Button>
        </div>

        {/* Attempt Feedback */}
        {lastAttemptCorrect === false && attempts < 3 && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="p-4 bg-red-500/20 border border-red-500">
              <p className="font-pixel text-sm text-center text-red-300">
                ❌ Not quite right! {3 - attempts} attempts remaining. Try again!
              </p>
            </Card>
          </div>
        )}

      </div>

      {/* Results Modal */}
      {showResultsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <Card className="max-w-lg w-full p-6 bg-card/95 border-2 border-neon-cyan animate-pulse-border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-retro glow-cyan">
                {isGameComplete ? "FINAL RESULTS" : "ATTEMPT RESULT"}
              </h3>
              <button
                onClick={() => {
                  setShowResultsModal(false);
                  setLastAttemptCorrect(null);
                }}
                className="text-2xl text-gray-400 hover:text-neon-pink transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="text-center">
              {isGameComplete ? (
                <>
                  <div className="text-4xl font-retro glow-pink mb-4 animate-bounce">
                    {score} POINTS
                  </div>
                  <p className="font-pixel text-sm mb-4">
                    Final Score - Attempts used: {attempts}/3
                  </p>
                  
                  {/* Quirky Score Message */}
                  <div className="bg-background/70 border border-neon-purple rounded-lg p-4">
                    <p className="font-pixel text-sm glow-purple animate-pulse">
                      {getResultMessage()}
                    </p>
                  </div>
                  
                  <p className="font-pixel text-xs text-gray-400 mt-4">
                    Click ✕ to close
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-retro glow-red mb-4 animate-bounce">
                    ❌ INCORRECT
                  </div>
                  <p className="font-pixel text-sm mb-4">
                    Attempt {attempts}/3 - {3 - attempts} attempts remaining
                  </p>
                  
                  <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                    <p className="font-pixel text-sm text-red-300">
                      Not quite right! Try reordering from newest hire to longest tenured.
                    </p>
                  </div>
                  
                  <p className="font-pixel text-xs text-gray-400 mt-4">
                    Click ✕ to close and try again
                  </p>
                </>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Level2Game;