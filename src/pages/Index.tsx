import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import GameLevelCard from "@/components/GameLevelCard";
import LoginForm from "@/components/LoginForm";
import retroBg from "@/assets/retro-gaming-bg.jpg";

const Index = () => {
  const [showRules, setShowRules] = useState(false);

  const gameLevels = [
    {
      level: 1,
      title: "The Invention Station",
      description: "Match colleagues with their amazing talents & hobbies",
      icon: "🎯",
      isComingSoon: false
    },
    {
      level: 2, 
      title: "Baby Face Detective",
      description: "Match baby photos with current colleague photos",
      icon: "👶",
      isComingSoon: false
    },
    {
      level: 3,
      title: "Mystery Challenge", 
      description: "Top secret challenge awaits...",
      icon: "❓",
      isComingSoon: true
    }
  ];

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
            The Ultimate Colleague Discovery Game
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
                  <DialogTitle className="font-retro glow-cyan">GAME RULES</DialogTitle>
                  <DialogDescription className="font-pixel space-y-4">
                    <div>🎯 <strong>LEVEL 1:</strong> Match colleagues with their unique talents and hobbies</div>
                    <div>👶 <strong>LEVEL 2:</strong> Identify team members from their baby photos</div>
                    <div>⚡ <strong>SCORING:</strong> Earn points for correct matches, lose points for wrong guesses</div>
                    <div>🏆 <strong>WIN CONDITION:</strong> Complete all levels to become the Ultimate Colleague Detective!</div>
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
            
            <Button variant="retro" size="sm">
              🏆 HIGH SCORES
            </Button>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto">
          {/* Login Section */}
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <div className="text-4xl mb-2 animate-float">🎮</div>
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

          {/* Game Levels Preview */}
          <div>
            <h3 className="text-2xl font-retro glow-cyan mb-6 text-center">
              🕹️ GAME LEVELS
            </h3>
            
            <div className="grid gap-6">
              {gameLevels.map((level) => (
                <GameLevelCard key={level.level} {...level} />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="border-t border-neon-cyan/20 pt-8">
            <p className="font-pixel text-sm text-muted-foreground">
              Powered by <span className="glow-pink">R&R Team</span> 
              <span className="mx-2">•</span>
              <span className="text-neon-green">Level Up Your Team Knowledge! 🚀</span>
            </p>
            <div className="mt-2 text-xs font-pixel text-muted-foreground">
              © 2024 • Made with 💜 for team building excellence
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
