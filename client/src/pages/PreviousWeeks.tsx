import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GameCard } from "@/components/GameCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Game } from "@shared/schema";
import { useLocation } from "wouter";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function PreviousWeeks() {
  const [selectedSeason, setSelectedSeason] = useState("2");
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [, setLocation] = useLocation();

  const { data: games, isLoading, error } = useQuery<Game[]>({
    queryKey: ["/api/games/week", selectedWeek, { season: selectedSeason }],
  });

  const { data: allGames, isLoading: allGamesLoading } = useQuery<Game[]>({
    queryKey: ["/api/games/all", { season: selectedSeason }],
  });

  const weeks = Array.from({ length: 14 }, (_, i) => i + 1);

  const gamesByWeek = allGames?.reduce((acc, game) => {
    if (!acc[game.week]) {
      acc[game.week] = [];
    }
    acc[game.week].push(game);
    return acc;
  }, {} as Record<number, Game[]>) || {};

  const playoffWeeks = [11, 12, 13, 14].filter(w => gamesByWeek[w]);

  const getRoundName = (week: number) => {
    if (week === 11) return "WILDCARD";
    if (week === 12) return "DIVISIONAL";
    if (week === 13) return "CONFERENCE";
    if (week === 14) return "SUPER BOWL";
    return `Week ${week}`;
  };

  const GameCardCompact = ({ game }: { game: Game }) => {
    return (
      <Link href={`/game/${game.id}`}>
        <Card className="p-3 hover-elevate cursor-pointer min-w-44" data-testid={`card-game-${game.id}`}>
          <div className="flex flex-col gap-2">
            <Badge
              variant={game.isLive ? "default" : game.isFinal ? "secondary" : "outline"}
              className="text-xs w-fit"
              data-testid={`badge-status-${game.id}`}
            >
              {game.isLive ? "LIVE" : game.isFinal ? "FINAL" : "Scheduled"}
            </Badge>
            <div className="text-sm font-semibold" data-testid={`text-matchup-${game.id}`}>
              <div className="truncate">{game.team1}</div>
              <div className="text-center my-1 text-xs">vs</div>
              <div className="truncate">{game.team2}</div>
            </div>
            {game.isFinal && (
              <div className="text-sm text-muted-foreground font-semibold text-center" data-testid={`text-score-${game.id}`}>
                {game.team1Score} - {game.team2Score}
              </div>
            )}
          </div>
        </Card>
      </Link>
    );
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-3 text-destructive">
          <AlertCircle className="w-5 h-5" />
          <p>Failed to load games</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black mb-4" data-testid="text-page-title">
            Previous Weeks
          </h1>
          <p className="text-muted-foreground text-lg mb-6">
            Browse final scores from Season {selectedSeason}
          </p>
        </div>
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium text-muted-foreground">Season:</span>
          <select 
            value={selectedSeason} 
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="bg-background border-2 border-primary/20 rounded-md px-2 py-1 text-sm font-bold focus:outline-none focus:border-primary transition-colors"
          >
            <option value="1">Season 1</option>
            <option value="2">Season 2</option>
          </select>
        </div>
      </div>

      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {weeks.map((week) => {
            const roundName = week === 11 ? "Wildcard" : week === 12 ? "Divisional" : week === 13 ? "Conference" : week === 14 ? "Super Bowl" : `Week ${week}`;
            return (
              <Button
                key={week}
                variant={selectedWeek === week ? "default" : "outline"}
                onClick={() => setSelectedWeek(week)}
                data-testid={`button-week-${week}`}
              >
                {roundName}
              </Button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : games && games.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onClick={() => setLocation(`/game/${game.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            No games found for Week {selectedWeek} in Season {selectedSeason}
          </p>
        </div>
      )}

      {playoffWeeks.length > 0 && (
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-3xl font-bold mb-8 text-primary">Playoffs</h2>
          {allGamesLoading ? (
            <div className="space-y-8">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-40" />
              ))}
            </div>
          ) : (
            <div className="space-y-12">
              {playoffWeeks.map((week) => (
                <div key={week}>
                  <h3 className="text-2xl font-bold mb-6 text-primary">{getRoundName(week)}</h3>
                  <div className="flex flex-wrap gap-4">
                    {gamesByWeek[week].map((game) => (
                      <GameCardCompact key={game.id} game={game} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
