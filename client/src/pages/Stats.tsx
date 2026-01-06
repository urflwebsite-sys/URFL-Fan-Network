import { Team, Player } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PlayerStat {
    id: string;
    playerName: string;
    team: string;
    position: string;
    // QB
    passingYards: number;
    passingTouchdowns: number;
    interceptions: number;
    completions: number;
    attempts: number;
    sacks: number;
    // RB
    rushingYards: number;
    rushingTouchdowns: number;
    rushingAttempts: number;
    missedTacklesForced: number;
    // WR
    receivingYards: number;
    receivingTouchdowns: number;
    receptions: number;
    targets: number;
    yardsAfterCatch: number;
    // K
    fieldGoalsMade: number;
    fieldGoalsAttempted: number;
    extraPointsMade: number;
    extraPointsAttempted: number;
    // DB
    defensiveInterceptions: number;
    passesDefended: number;
    completionsAllowed: number;
    targetsAllowed: number;
    swats: number;
    defensiveTouchdowns: number;
    // DEF
    defensiveSacks: number;
    tackles: number;
    defensiveMisses: number;
    safeties: number;
    
    defensivePoints: number;
    week: number;
}

interface TeamStats {
  team: string;
  pointsFor: number;
  pointsAgainst: number;
}

export default function Stats() {
  const { data: playerStats = [] } = useQuery<PlayerStat[]>({
    queryKey: ["/api/player-stats"],
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  const { data: gameStats = [] } = useQuery<any[]>({
    queryKey: ["/api/games/all"],
  });

  // Aggregate team stats from games
  const calculateTeamStats = (): TeamStats[] => {
    const teamMap = new Map<string, { pointsFor: number; pointsAgainst: number }>();

    gameStats.forEach((game) => {
      if (game.isFinal) {
        if (!teamMap.has(game.team1)) {
          teamMap.set(game.team1, { pointsFor: 0, pointsAgainst: 0 });
        }
        if (!teamMap.has(game.team2)) {
          teamMap.set(game.team2, { pointsFor: 0, pointsAgainst: 0 });
        }

        const team1Stats = teamMap.get(game.team1)!;
        const team2Stats = teamMap.get(game.team2)!;

        team1Stats.pointsFor += game.team1Score;
        team1Stats.pointsAgainst += game.team2Score;
        team2Stats.pointsFor += game.team2Score;
        team2Stats.pointsAgainst += game.team1Score;
      }
    });

    return Array.from(teamMap, ([team, stats]) => ({
      team,
      ...stats,
    }));
  };

  // Get player leaderboards by position
  const getLeaderboard = (position: string) => {
    const filtered = playerStats.filter((p) => {
      const pPos = p.position?.toUpperCase();
      const targetPos = position?.toUpperCase();
      return pPos === targetPos;
    });
    return filtered
      .sort((a, b) => {
        if (position === "QB") {
          return (b.passingYards || 0) - (a.passingYards || 0);
        } else if (position === "RB") {
          return (b.rushingYards || 0) - (a.rushingYards || 0);
        } else if (position === "WR") {
          return (b.receivingYards || 0) - (a.receivingYards || 0);
        } else if (position === "DB") {
          return (b.defensiveInterceptions || 0) - (a.defensiveInterceptions || 0);
        } else if (position === "DEF") {
          return (b.defensiveSacks || 0) - (a.defensiveSacks || 0);
        } else if (position === "K") {
          return ((b.fieldGoalsMade || 0) * 3 + (b.extraPointsMade || 0)) - ((a.fieldGoalsMade || 0) * 3 + (a.extraPointsMade || 0));
        }
        return 0;
      })
      .slice(0, 10);
  };

  const teamStats = calculateTeamStats();
  const offenseRankings = [...teamStats].sort((a, b) => b.pointsFor - a.pointsFor);
  const defenseRankings = [...teamStats].sort((a, b) => a.pointsAgainst - b.pointsAgainst);

  const recordBook = {
    mostQBPoints: playerStats
      .filter((p) => p.position === "QB")
      .sort((a, b) => ((b.passingYards || 0) + (b.passingTouchdowns || 0) * 6) - ((a.passingYards || 0) + (a.passingTouchdowns || 0) * 6))
      .slice(0, 5),
    mostRBPoints: playerStats
      .filter((p) => p.position === "RB")
      .sort((a, b) => ((b.rushingYards || 0) + (b.rushingTouchdowns || 0) * 6) - ((a.rushingYards || 0) + (a.rushingTouchdowns || 0) * 6))
      .slice(0, 5),
    mostWRPoints: playerStats
      .filter((p) => p.position === "WR")
      .sort((a, b) => ((b.receivingYards || 0) + (b.receivingTouchdowns || 0) * 6) - ((a.receivingYards || 0) + (a.receivingTouchdowns || 0) * 6))
      .slice(0, 5),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl md:text-5xl font-black mb-4">Stats & Data</h1>
        <p className="text-muted-foreground text-lg">Season Statistics and Rankings</p>
      </div>

      <Tabs defaultValue="leaderboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          <TabsTrigger value="leaderboard">Leaders</TabsTrigger>
          <TabsTrigger value="passing">Pass</TabsTrigger>
          <TabsTrigger value="rushing">Rush</TabsTrigger>
          <TabsTrigger value="receiving">Rec</TabsTrigger>
          <TabsTrigger value="defense">Def</TabsTrigger>
          <TabsTrigger value="kicking">Kick</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="records">Records</TabsTrigger>
        </TabsList>

        <TabsContent value="leaderboard" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Quarterback Leaders</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {getLeaderboard("QB").map((player, idx) => {
                    const rating = player.attempts > 0 ? (
                      ((8.4 * (player.passingYards || 0)) + (330 * (player.passingTouchdowns || 0)) + (100 * (player.completions || 0)) - (200 * (player.interceptions || 0))) / player.attempts
                    ).toFixed(1) : "0.0";
                    return (
                      <div key={player.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                          <div>
                            <p className="font-semibold">{player.playerName}</p>
                            <p className="text-sm text-muted-foreground">{player.team}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold">{player.passingYards || 0} YDS</p>
                          <p className="text-xs text-muted-foreground">RTG: {rating}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Receiving Leaders</h3>
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {getLeaderboard("WR").map((player, idx) => (
                    <div key={player.id} className="flex justify-between items-center pb-3 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                        <div>
                          <p className="font-semibold">{player.playerName}</p>
                          <p className="text-sm text-muted-foreground">{player.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold">{player.receivingYards || 0} YDS</p>
                        <p className="text-xs text-muted-foreground">{player.receivingTouchdowns || 0} TD</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="passing" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Passing Leaders</h3>
            <div className="space-y-4">
              {getLeaderboard("QB").map((player, idx) => (
                <div key={player.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Yards</p>
                      <p className="font-mono font-bold">{player.passingYards || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">TDs</p>
                      <p className="font-mono font-bold text-primary">{player.passingTouchdowns || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">INT</p>
                      <p className="font-mono font-bold">{player.interceptions || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rushing" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Rushing Leaders</h3>
            <div className="space-y-4">
              {getLeaderboard("RB").map((player, idx) => (
                <div key={player.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Yards</p>
                      <p className="font-mono font-bold">{player.rushingYards || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">TDs</p>
                      <p className="font-mono font-bold text-primary">{player.rushingTouchdowns || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Att</p>
                      <p className="font-mono font-bold">{player.rushingAttempts || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="receiving" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Receiving Leaders</h3>
            <div className="space-y-4">
              {getLeaderboard("WR").map((player, idx) => (
                <div key={player.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Yards</p>
                      <p className="font-mono font-bold">{player.receivingYards || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">TDs</p>
                      <p className="font-mono font-bold text-primary">{player.receivingTouchdowns || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Rec</p>
                      <p className="font-mono font-bold">{player.receptions || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="defense" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Defensive Leaders</h3>
            <div className="space-y-4">
              {getLeaderboard("DEF").map((player, idx) => (
                <div key={player.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Sacks</p>
                      <p className="font-mono font-bold">{player.defensiveSacks || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Tackles</p>
                      <p className="font-mono font-bold">{player.tackles || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Pts</p>
                      <p className="font-mono font-bold text-primary">{player.defensivePoints || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="kicking" className="mt-6">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Kicking Leaders</h3>
            <div className="space-y-4">
              {getLeaderboard("K").map((player, idx) => (
                <div key={player.id} className="flex justify-between items-center pb-4 border-b last:border-b-0">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-muted-foreground w-6">{idx + 1}</span>
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-sm text-muted-foreground">{player.team}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-8 text-center">
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">FG Made</p>
                      <p className="font-mono font-bold">{player.fieldGoalsMade || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">XP Made</p>
                      <p className="font-mono font-bold">{player.extraPointsMade || 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-black text-muted-foreground">Pts</p>
                      <p className="font-mono font-bold text-primary">{(player.fieldGoalsMade || 0) * 3 + (player.extraPointsMade || 0)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="team" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Scoring Offense</h3>
              <div className="space-y-4">
                {offenseRankings.map((team, idx) => (
                  <div key={team.team} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <span className="font-semibold">{team.team}</span>
                    </div>
                    <span className="font-mono font-bold">{team.pointsFor} PTS</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Scoring Defense</h3>
              <div className="space-y-4">
                {defenseRankings.map((team, idx) => (
                  <div key={team.team} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-muted-foreground w-6">{idx + 1}</span>
                      <span className="font-semibold">{team.team}</span>
                    </div>
                    <span className="font-mono font-bold">{team.pointsAgainst} PA</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="records" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Passing Records</h3>
              <div className="space-y-4">
                {recordBook.mostQBPoints.map((player) => (
                  <div key={player.id} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                    <span className="font-mono font-bold text-primary">{(player.passingYards || 0) + (player.passingTouchdowns || 0) * 6} PTS</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Rushing Records</h3>
              <div className="space-y-4">
                {recordBook.mostRBPoints.map((player) => (
                  <div key={player.id} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                    <span className="font-mono font-bold text-primary">{(player.rushingYards || 0) + (player.rushingTouchdowns || 0) * 6} PTS</span>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Receiving Records</h3>
              <div className="space-y-4">
                {recordBook.mostWRPoints.map((player) => (
                  <div key={player.id} className="flex justify-between items-center pb-2 border-b last:border-b-0">
                    <div>
                      <p className="font-semibold">{player.playerName}</p>
                      <p className="text-xs text-muted-foreground">{player.team}</p>
                    </div>
                    <span className="font-mono font-bold text-primary">{(player.receivingYards || 0) + (player.receivingTouchdowns || 0) * 6} PTS</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
