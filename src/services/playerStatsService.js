import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import userService from "./userService";

class PlayerStatsService {
  constructor() {
    this.goalsCollection = "goals";
    this.teamDivisionCollection = "team_divisions";
  }

  /**
   * Buscar todas as estatísticas de um jogador - versão simplificada e otimizada
   */
  async getPlayerStats(playerId) {
    try {
      if (!playerId) {
        throw new Error("ID do jogador é obrigatório");
      }

      let partidas_jogadas = 0;
      let partidas_vencidas = 0;
      let partidas_perdidas = 0;
      let partidas_empates = 0;
      let gols_marcados = 0;
      let gols_contra = 0;
      let gols_a_favor = 0;

      // 1. Buscar todas as participações do jogador em team_division
      const teamDivisionsSnapshot = await getDocs(
        collection(db, this.teamDivisionCollection)
      );
      const userMatches = [];

      for (const doc of teamDivisionsSnapshot.docs) {
        const data = doc.data();
        const matchId = data.matchId;

        // Verificar se os arrays existem e são válidos
        const teamBlack = Array.isArray(data.teamBlack) ? data.teamBlack : [];
        const teamWhite = Array.isArray(data.teamWhite) ? data.teamWhite : [];

        const isInBlack = teamBlack.includes(playerId);
        const isInWhite = teamWhite.includes(playerId);

        if (isInBlack || isInWhite) {
          const userTeam = isInBlack ? "black" : "white";
          userMatches.push({ matchId, userTeam });
        }
      }

      partidas_jogadas = userMatches.length;

      if (partidas_jogadas === 0) {
        return this.getEmptyStats();
      }

      // 2. Para cada partida, calcular estatísticas
      for (const match of userMatches) {
        const { matchId, userTeam } = match;

        // Buscar todos os gols da partida
        const goalsQuery = query(
          collection(db, this.goalsCollection),
          where("matchId", "==", matchId)
        );
        const goalsSnapshot = await getDocs(goalsQuery);

        let teamGoals = { black: 0, white: 0 };

        for (const goalDoc of goalsSnapshot.docs) {
          const goal = goalDoc.data();
          const isUser = goal.playerId === playerId;

          // Gols do time
          if (goal.type === "favor") {
            teamGoals[goal.team]++;

            // Gols marcados pelo usuário
            if (isUser) gols_marcados++;
          }

          // Gols contra
          if (isUser && goal.type === "contra") {
            gols_contra++;
          }
        }

        // 3. Gols a favor do time do jogador
        gols_a_favor += teamGoals[userTeam];

        // 4. Vitória / Derrota / Empate
        const opponentTeam = userTeam === "black" ? "white" : "black";

        if (teamGoals[userTeam] > teamGoals[opponentTeam]) {
          partidas_vencidas++;
        } else if (teamGoals[userTeam] < teamGoals[opponentTeam]) {
          partidas_perdidas++;
        } else {
          // Empate
          partidas_empates++;
        }
      }

      const winRate =
        partidas_jogadas > 0
          ? Math.round((partidas_vencidas / partidas_jogadas) * 100)
          : 0;

      return {
        summary: {
          totalGoals: gols_marcados + gols_contra,
          goalsFor: gols_marcados,
          goalsAgainst: gols_contra,
          teamGoalsFor: gols_a_favor,
          matchesPlayed: partidas_jogadas,
          wins: partidas_vencidas,
          losses: partidas_perdidas,
          draws: partidas_empates,
          winRate,
        },
        matches: {
          matchesPlayed: partidas_jogadas,
          wins: partidas_vencidas,
          losses: partidas_perdidas,
          draws: partidas_empates,
          matchDetails: [], // Podemos adicionar depois se necessário
        },
        goals: {
          goalsFor: gols_marcados,
          goalsAgainst: gols_contra,
          teamGoalsFor: gols_a_favor,
          totalGoals: gols_marcados + gols_contra,
          goals: [], // Podemos adicionar depois se necessário
        },
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do jogador:", error);
      throw new Error("Erro ao carregar estatísticas do jogador.");
    }
  }

  /**
   * Retornar estatísticas vazias
   */
  getEmptyStats() {
    return {
      summary: {
        totalGoals: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        teamGoalsFor: 0,
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        winRate: 0,
      },
      matches: {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matchDetails: [],
      },
      goals: {
        goalsFor: 0,
        goalsAgainst: 0,
        teamGoalsFor: 0,
        totalGoals: 0,
        goals: [],
      },
    };
  }

  /**
   * Buscar estatísticas resumidas rápidas
   */
  async getPlayerQuickStats(playerId) {
    try {
      const stats = await this.getPlayerStats(playerId);
      return {
        goalsFor: stats.summary.goalsFor,
        goalsAgainst: stats.summary.goalsAgainst,
        totalGoals: stats.summary.totalGoals,
        totalParticipations: stats.summary.matchesPlayed,
        hasGoals: stats.summary.totalGoals > 0,
        hasParticipations: stats.summary.matchesPlayed > 0,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas rápidas:", error);
      return {
        goalsFor: 0,
        goalsAgainst: 0,
        totalGoals: 0,
        totalParticipations: 0,
        hasGoals: false,
        hasParticipations: false,
      };
    }
  }

  /**
   * Método de debug simplificado
   */
  async debugPlayerStats(playerId) {
    try {
      console.log(`🔍 Debug de estatísticas para jogador: ${playerId}`);

      const stats = await this.getPlayerStats(playerId);

      console.log(`📊 ESTATÍSTICAS:`);
      console.log(`- Partidas jogadas: ${stats.summary.matchesPlayed}`);
      console.log(`- Vitórias: ${stats.summary.wins}`);
      console.log(`- Derrotas: ${stats.summary.losses}`);
      console.log(`- Empates: ${stats.summary.draws}`);
      console.log(`- Gols marcados: ${stats.summary.goalsFor}`);
      console.log(`- Gols contra: ${stats.summary.goalsAgainst}`);
      console.log(`- Gols a favor do time: ${stats.summary.teamGoalsFor}`);
      console.log(`- Taxa de vitória: ${stats.summary.winRate}%`);

      return stats;
    } catch (error) {
      console.error("Erro no debug:", error);
      return null;
    }
  }

  /**
   * Buscar ranking de jogadores por gols
   */
  async getGoalsRanking(limit = 10) {
    try {
      // Buscar todos os gols do tipo "favor"
      const goalsQuery = query(
        collection(db, this.goalsCollection),
        where("type", "==", "favor")
      );

      const querySnapshot = await getDocs(goalsQuery);
      const playerGoals = {};

      querySnapshot.forEach((doc) => {
        const goal = doc.data();
        if (!playerGoals[goal.playerId]) {
          playerGoals[goal.playerId] = {
            playerId: goal.playerId,
            goals: 0,
          };
        }
        playerGoals[goal.playerId].goals++;
      });

      // Converter para array, buscar nomes e ordenar
      const playersArray = Object.values(playerGoals);

      // Buscar nomes dos jogadores dinamicamente
      const rankingWithNames = await Promise.all(
        playersArray.map(async (player) => {
          const playerName = await this.getPlayerName(player.playerId);
          return {
            ...player,
            playerName,
          };
        })
      );

      // Ordenar por gols e limitar
      const ranking = rankingWithNames
        .sort((a, b) => b.goals - a.goals)
        .slice(0, limit);

      return ranking;
    } catch (error) {
      console.error("Erro ao buscar ranking de gols:", error);
      return [];
    }
  }

  // Buscar nome do jogador pelo ID
  async getPlayerName(playerId) {
    try {
      const userData = await userService.findById(playerId);
      return userData?.name || userData?.display_name || "Jogador";
    } catch (error) {
      console.warn("Erro ao buscar nome do jogador:", error);
      return "Jogador";
    }
  }
}

export default new PlayerStatsService();
