import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GameLevelCardProps {
  level: number;
  title: string;
  description: string;
  icon: string;
  isComingSoon?: boolean;
}

export default function GameLevelCard({ level, title, description, icon, isComingSoon }: GameLevelCardProps) {
  return (
    <Card className={`game-card relative overflow-hidden ${isComingSoon ? 'opacity-70' : ''}`}>
      <div className="absolute top-2 right-2 text-xs font-pixel text-muted-foreground">
        LEVEL {level}
      </div>
      
      <CardHeader className="text-center">
        <div className="text-4xl mb-2 animate-float">{icon}</div>
        <CardTitle className="font-retro text-lg glow-cyan">{title}</CardTitle>
        <CardDescription className="font-pixel text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="text-center">
        {isComingSoon ? (
          <div className="text-neon-purple font-pixel text-sm animate-pulse">
            COMING SOON...
          </div>
        ) : (
          <div className="text-neon-green font-pixel text-xs">
            ⚡ READY TO PLAY
          </div>
        )}
      </CardContent>
      
      {!isComingSoon && (
        <div className="absolute inset-0 scanlines opacity-20"></div>
      )}
    </Card>
  );
}