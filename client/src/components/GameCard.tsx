import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Game } from "@shared/schema";
import { formatInTimeZone } from "date-fns-tz";
import { TEAMS } from "@/lib/teams";
import { Video } from "lucide-react";
import { useUserPreferences } from "@/hooks/useUserPreferences";

interface GameCardProps {
  game: Game;
  onClick?: () => void;
}

const TeamLogo = ({ teamName, className }: { teamName: string; className?: string }) => {
  const logo = TEAMS[teamName as keyof typeof TEAMS];
  if (!logo) return <div className={`${className} bg-muted rounded-full flex items-center justify-center text-[10px] font-bold`}>{teamName.substring(0, 2)}</div>;
  return <img src={logo} alt={teamName} className={`${className} object-contain`} />;
};

export function GameCard({ game, onClick }: GameCardProps) {
  const preferences = useUserPreferences();

  return (
    <Card 
      className={`group relative overflow-hidden transition-all duration-500 hover:shadow-[0_20px_50px_rgba(var(--primary),0.15)] border-border/40 bg-card/40 backdrop-blur-xl cursor-pointer ${
        game.isLive ? 'ring-1 ring-primary/50 bg-primary/5' : ''
      }`}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="p-5 space-y-6 relative z-10">
        <div className="flex justify-between items-center">
          <Badge 
            variant={game.isLive ? "default" : "secondary"}
            className={`text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full ${
              game.isLive ? 'animate-pulse bg-primary shadow-lg shadow-primary/20' : 'bg-muted/50 border-none'
            }`}
          >
            {game.isLive ? (
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                Live • {game.quarter}
              </span>
            ) : game.isFinal ? 'Final' : 'Scheduled'}
          </Badge>
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] italic">Week {game.week}</span>
        </div>

        <div className="grid grid-cols-[1fr,auto,1fr] items-center gap-6 py-2">
          <div className="text-center space-y-4">
            <div className="relative inline-block group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <TeamLogo teamName={game.team1} className="w-16 h-16 relative z-10 drop-shadow-2xl" />
            </div>
            <p className="font-black italic text-[11px] uppercase tracking-wider text-foreground/80">{game.team1}</p>
          </div>

          <div className="text-center">
            <div className="text-3xl font-black italic tracking-tighter tabular-nums flex flex-col items-center gap-1">
              {game.isLive || game.isFinal ? (
                <div className="flex items-center gap-4">
                  <span className={game.team1Score! > game.team2Score! ? 'text-primary scale-110' : 'text-foreground/50'}>{game.team1Score}</span>
                  <span className="text-muted-foreground/20 text-lg not-italic font-light">-</span>
                  <span className={game.team2Score! > game.team1Score! ? 'text-primary scale-110' : 'text-foreground/50'}>{game.team2Score}</span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-full border border-border/50 flex items-center justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-black not-italic opacity-40">VS</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="relative inline-block group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              <TeamLogo teamName={game.team2} className="w-16 h-16 relative z-10 drop-shadow-2xl" />
            </div>
            <p className="font-black italic text-[11px] uppercase tracking-wider text-foreground/80">{game.team2}</p>
          </div>
        </div>

        <div className="pt-4 flex flex-col items-center gap-3 border-t border-border/20">
          {!game.isFinal && !game.isLive ? (
             <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.25em]">
               {game.gameTime ? formatInTimeZone(new Date(game.gameTime), "America/New_York", "EEE, MMM d • h:mm a 'EST'") : "Time TBD"}
             </p>
          ) : game.streamLink && (
            <Button 
              size="sm" 
              className="w-full bg-primary/10 hover:bg-primary text-primary hover:text-white border-none font-black uppercase tracking-widest text-[10px] h-8 transition-all duration-300"
              onClick={(e) => {
                e.stopPropagation();
                const url = game.streamLink!.startsWith('http') ? game.streamLink! : `https://${game.streamLink}`;
                window.open(url, '_blank');
              }}
            >
              <Video className="w-3 h-3 mr-2" />
              Watch Live
            </Button>
          )}
          {game.location && (
            <p className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">{game.location}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
