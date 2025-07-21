import { useState, useEffect } from "react";
import playerStatsService from "../services/playerStatsService";

/**
 * Hook customizado para buscar ranking de artilheiros
 * Combina dados de gols e estatísticas de partidas
 */
export const useTopScorers = (limit = 20) => {
  const [topScorers, setTopScorers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopScorers = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Buscar ranking básico de gols
        const goalsRanking = await playerStatsService.getGoalsRanking(limit);

        if (goalsRanking.length === 0) {
          setTopScorers([]);
          return;
        }

        // 2. Para cada jogador, buscar estatísticas completas (incluindo partidas)
        const scorersWithStats = await Promise.all(
          goalsRanking.map(async (scorer, index) => {
            try {
              const playerStats = await playerStatsService.getPlayerStats(
                scorer.playerId
              );

              return {
                ...scorer,
                position: index + 1,
                matchesPlayed: playerStats.summary.matchesPlayed,
                wins: playerStats.summary.wins,
                losses: playerStats.summary.losses,
                draws: playerStats.summary.draws,
                winRate: playerStats.summary.winRate,
                goalsAgainst: playerStats.summary.goalsAgainst,
                // Para facilitar o acesso, manter goals como goalsFor
                goalsFor: scorer.goals,
              };
            } catch (statsError) {
              console.warn(
                `Erro ao buscar stats para ${scorer.playerName}:`,
                statsError
              );
              // Retornar dados básicos se falhar ao buscar estatísticas
              return {
                ...scorer,
                position: index + 1,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                goalsAgainst: 0,
                goalsFor: scorer.goals,
              };
            }
          })
        );

        setTopScorers(scorersWithStats);
      } catch (err) {
        console.error("Erro ao buscar ranking de artilheiros:", err);
        setError(err.message || "Erro ao carregar ranking de artilheiros");
        setTopScorers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopScorers();
  }, [limit]);

  // Função para recarregar dados
  const refetch = async () => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const goalsRanking = await playerStatsService.getGoalsRanking(limit);

        if (goalsRanking.length === 0) {
          setTopScorers([]);
          return;
        }

        const scorersWithStats = await Promise.all(
          goalsRanking.map(async (scorer, index) => {
            try {
              const playerStats = await playerStatsService.getPlayerStats(
                scorer.playerId
              );

              return {
                ...scorer,
                position: index + 1,
                matchesPlayed: playerStats.summary.matchesPlayed,
                wins: playerStats.summary.wins,
                losses: playerStats.summary.losses,
                draws: playerStats.summary.draws,
                winRate: playerStats.summary.winRate,
                goalsAgainst: playerStats.summary.goalsAgainst,
                goalsFor: scorer.goals,
              };
            } catch (statsError) {
              console.warn(
                `Erro ao buscar stats para ${scorer.playerName}:`,
                statsError
              );
              return {
                ...scorer,
                position: index + 1,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                draws: 0,
                winRate: 0,
                goalsAgainst: 0,
                goalsFor: scorer.goals,
              };
            }
          })
        );

        setTopScorers(scorersWithStats);
      } catch (err) {
        console.error("Erro ao recarregar ranking de artilheiros:", err);
        setError(err.message || "Erro ao recarregar ranking de artilheiros");
        setTopScorers([]);
      } finally {
        setLoading(false);
      }
    };

    if (!loading) {
      await fetchData();
    }
  };

  return {
    topScorers,
    loading,
    error,
    refetch,
    // Propriedades de conveniência
    hasData: topScorers.length > 0,
    isEmpty: !loading && topScorers.length === 0,
  };
};
