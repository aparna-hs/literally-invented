import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import LoginForm from "@/components/LoginForm";
import Leaderboard from "@/components/Leaderboard";
import { useAuth } from "@/contexts/AuthContext";
import { logout } from "@/lib/auth";
import retroBg from "@/assets/retro-gaming-bg.jpg";

const Index = () => {
  const [showRules, setShowRules] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();

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
                  WELCOME BACK, {user?.display_name?.toUpperCase()}!
                </h3>
                <p className="font-pixel text-sm text-muted-foreground">
                  Choose your challenge and prove your team knowledge
                </p>
              </div>
              
              <div className="w-full max-w-sm space-y-4">
                <Button 
                  onClick={() => window.location.href = '/level1'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-purple to-neon-pink hover:from-neon-pink hover:to-neon-purple"
                >
                  🎯 LEVEL 1: INVENTION STATION
                </Button>
                
                <Button 
                  onClick={() => window.location.href = '/level2'}
                  className="w-full font-retro text-lg py-6 bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan"
                >
                  ⏰ LEVEL 2: TIMELINE CHALLENGE
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
    </div>
  );
};

export default Index;
