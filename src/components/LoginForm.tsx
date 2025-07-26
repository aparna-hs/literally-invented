import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", { username, password });
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
          
          <Button 
            type="submit" 
            variant="arcade" 
            size="lg" 
            className="w-full text-lg py-6"
          >
            🕹️ PRESS START 🕹️
          </Button>
        </form>
        
        <div className="mt-4 text-center">
          <Button variant="neon" size="sm" className="text-xs">
            FORGOT PASSWORD?
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}