import { useState, useEffect } from "react";
import playerStatsService from "../services/playerStatsService";

/**
 * Hook personalizado para buscar estatísticas reais de um jogador
 * baseado nas collections: goals, match, team_division
 */
export const usePlayerStats = (playerId) => {
  const [stats, setStats] = useState({
    summary: {
      totalGoals: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      winRate: 0,
    },
    goals: {
      goalsFor: 0,
      goalsAgainst: 0,
      totalGoals: 0,
      goals: [],
    },
    matches: {
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      matchDetails: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!playerId) {
        setStats({
          summary: {
            totalGoals: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          },
          goals: {
            goalsFor: 0,
            goalsAgainst: 0,
            totalGoals: 0,
            goals: [],
          },
          matches: {
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            matchDetails: [],
          },
        });
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const playerStats = await playerStatsService.getPlayerStats(playerId);
        setStats(playerStats);
      } catch (err) {
        console.error("Erro ao buscar estatísticas do jogador:", err);
        setError(err.message);

        // Em caso de erro, usar valores zerados
        setStats({
          summary: {
            totalGoals: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            winRate: 0,
          },
          goals: {
            goalsFor: 0,
            goalsAgainst: 0,
            totalGoals: 0,
            goals: [],
          },
          matches: {
            matchesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            matchDetails: [],
          },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId]);

  // Função para recarregar as estatísticas
  const refetchStats = async () => {
    if (playerId) {
      try {
        setLoading(true);
        setError(null);

        const playerStats = await playerStatsService.getPlayerStats(playerId);
        setStats(playerStats);
      } catch (err) {
        console.error("Erro ao recarregar estatísticas:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    stats,
    loading,
    error,
    refetch: refetchStats,
    // Propriedades de conveniência para acesso rápido
    summary: stats.summary,
    hasStats: stats.summary.matchesPlayed > 0 || stats.summary.totalGoals > 0,
    hasCompleteStats:
      stats.summary.matchesPlayed > 0 &&
      (stats.summary.wins > 0 ||
        stats.summary.losses > 0 ||
        stats.summary.totalGoals > 0),
    hasPartialStats:
      stats.summary.matchesPlayed > 0 &&
      stats.summary.wins === 0 &&
      stats.summary.losses === 0,
  };
};
