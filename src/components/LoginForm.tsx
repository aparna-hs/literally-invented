import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/auth";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { setUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(username, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        // Redirect will be handled by the parent component
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      setError("🚨 Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
    setTimeout(() => setShowForgotPassword(false), 5000); // Hide after 5 seconds
  };

  return (
    <Card className="neon-border bg-card/90 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="font-retro text-xl glow-cyan">
          PLAYER LOGIN
        </CardTitle>
        <div className="text-xs font-pixel text-muted-foreground">
          INSERT COIN TO CONTINUE
        </div>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="username" className="font-pixel text-sm glow-pink">
              USERNAME
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-input/50 border-border focus:border-neon-cyan transition-colors font-pixel"
              placeholder="Enter player name..."
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="font-pixel text-sm glow-pink">
              PASSWORD
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-input/50 border-border focus:border-neon-cyan transition-colors font-pixel"
              placeholder="Enter secret code..."
              required
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-3 rounded border border-red-500 bg-red-500/20">
              <p className="font-pixel text-sm text-red-300 text-center">
                {error}
              </p>
            </div>
          )}

          <Button 
            type="submit" 
            variant="arcade" 
            size="lg" 
            className="w-full text-lg py-6"
            disabled={loading}
          >
            {loading ? "⏳ CONNECTING..." : "🕹️ PRESS START 🕹️"}
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button 
            variant="neon" 
            size="sm" 
            className="text-xs"
            onClick={handleForgotPassword}
            type="button"
          >
            FORGOT PASSWORD?
          </Button>
          
          {/* Quirky Forgot Password Message */}
          {showForgotPassword && (
            <div className="mt-3 p-3 rounded border border-neon-purple bg-neon-purple/20">
              <p className="font-pixel text-xs glow-purple text-center">
                🤖 Oops! Memory overflow detected! <br />
                Please reach out to the R&R team for a password reset. <br />
                They're probably in the kitchen getting coffee ☕
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}