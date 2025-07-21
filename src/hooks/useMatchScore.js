import { useState, useEffect } from "react";
import goalService from "../services/goalService";

/**
 * Hook personalizado para buscar o placar real de uma partida
 * baseado nos gols registrados no Firebase
 */
export const useMatchScore = (matchId, isFinished = false) => {
  const [score, setScore] = useState({ team_black: 0, team_white: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScore = async () => {
      // Só buscar se a partida estiver finalizada e tiver ID
      if (!isFinished || !matchId) {
        setScore({ team_black: 0, team_white: 0 });
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const matchStats = await goalService.getMatchStats(matchId);

        setScore({
          team_black: matchStats.blackScore || 0,
          team_white: matchStats.whiteScore || 0,
        });
      } catch (err) {
        console.error("Erro ao buscar placar da partida:", err);
        setError(err.message);

        // Em caso de erro, usar placar zerado
        // Isso pode acontecer se a partida foi finalizada mas não tem gols registrados
        setScore({ team_black: 0, team_white: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [matchId, isFinished]);

  // Função para recarregar o placar (útil após adicionar/remover gols)
  const refetchScore = async () => {
    if (isFinished && matchId) {
      try {
        setLoading(true);
        setError(null);

        const matchStats = await goalService.getMatchStats(matchId);

        setScore({
          team_black: matchStats.blackScore || 0,
          team_white: matchStats.whiteScore || 0,
        });
      } catch (err) {
        console.error("Erro ao recarregar placar:", err);
        setError(err.message);
        setScore({ team_black: 0, team_white: 0 });
      } finally {
        setLoading(false);
      }
    }
  };

  return {
    score,
    loading,
    error,
    refetch: refetchScore,
    // Propriedades de conveniência
    hasGoals: score.team_black + score.team_white > 0,
    totalGoals: score.team_black + score.team_white,
  };
};
