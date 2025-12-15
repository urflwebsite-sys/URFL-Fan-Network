import { useEffect, useRef } from "react";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export function useNotifications() {
  const preferences = useUserPreferences();
  const { toast } = useToast();
  const lastCheckRef = useRef<{
    liveGames: Set<string>;
    finalGames: Set<string>;
    newsIds: Set<string>;
  }>({ liveGames: new Set(), finalGames: new Set(), newsIds: new Set() });

  // Fetch games for live/final notifications
  const { data: games = [] } = useQuery({
    queryKey: ["/api/games/all"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Fetch news for news notifications
  const { data: news = [] } = useQuery({
    queryKey: ["/api/news"],
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (!games.length || !preferences.notifyGameLive && !preferences.notifyGameFinal) return;

    games.forEach((game: any) => {
      const isFinal = game.isFinal || game.quarter === "FINAL";
      const isLive = game.isLive || (game.quarter && game.quarter !== "Scheduled" && game.quarter !== "FINAL");

      // Notify when game goes live
      if (preferences.notifyGameLive && isLive && !lastCheckRef.current.liveGames.has(game.id)) {
        toast({
          title: "Game Live!",
          description: `${game.team1} vs ${game.team2} is now live!`,
        });
        lastCheckRef.current.liveGames.add(game.id);
      }

      // Notify when game goes final
      if (preferences.notifyGameFinal && isFinal && !lastCheckRef.current.finalGames.has(game.id)) {
        const score = `${game.team1} ${game.team1Score} - ${game.team2} ${game.team2Score}`;
        toast({
          title: "Game Final",
          description: score,
        });
        lastCheckRef.current.finalGames.add(game.id);
      }
    });
  }, [games, preferences.notifyGameLive, preferences.notifyGameFinal, toast]);

  useEffect(() => {
    if (!news.length || !preferences.notifyNews) return;

    news.forEach((item: any) => {
      if (!lastCheckRef.current.newsIds.has(item.id)) {
        toast({
          title: "Breaking News",
          description: item.title,
        });
        lastCheckRef.current.newsIds.add(item.id);
      }
    });
  }, [news, preferences.notifyNews, toast]);
}
