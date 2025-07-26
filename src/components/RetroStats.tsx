export default function RetroStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <div className="text-center p-4 border border-neon-cyan/30 rounded-lg bg-card/50">
        <div className="text-2xl font-retro glow-cyan">42</div>
        <div className="text-xs font-pixel text-muted-foreground">PLAYERS</div>
      </div>
      
      <div className="text-center p-4 border border-neon-pink/30 rounded-lg bg-card/50">
        <div className="text-2xl font-retro glow-pink">156</div>
        <div className="text-xs font-pixel text-muted-foreground">GAMES PLAYED</div>
      </div>
      
      <div className="text-center p-4 border border-neon-purple/30 rounded-lg bg-card/50">
        <div className="text-2xl font-retro glow-purple">9.8</div>
        <div className="text-xs font-pixel text-muted-foreground">AVG SCORE</div>
      </div>
      
      <div className="text-center p-4 border border-neon-green/30 rounded-lg bg-card/50">
        <div className="text-2xl font-retro text-neon-green">85%</div>
        <div className="text-xs font-pixel text-muted-foreground">SUCCESS RATE</div>
      </div>
    </div>
  );
}