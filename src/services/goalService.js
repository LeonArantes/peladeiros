import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";

class GoalService {
  constructor() {
    this.collectionName = "goals";
  }

  // Buscar todos os gols de uma partida
  async findByMatchId(matchId) {
    try {
      if (!matchId) {
        throw new Error("ID da partida é obrigatório");
      }

      const goalsQuery = query(
        collection(db, this.collectionName),
        where("matchId", "==", matchId),
        orderBy("timestamp", "asc")
      );

      const querySnapshot = await getDocs(goalsQuery);
      const goals = [];

      querySnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data(),
          // Converter timestamp do Firestore para Date se necessário
          timestamp: doc.data().timestamp?.toDate() || new Date(),
        });
      });

      return goals; // Retorna array vazio se não houver gols
    } catch (error) {
      console.error("Erro ao buscar gols:", error);

      // Se o erro for porque a collection não existe ou não há dados, retornar array vazio
      if (error.code === "permission-denied" || error.code === "not-found") {
        return [];
      }

      throw new Error("Erro ao carregar os gols da partida. Tente novamente.");
    }
  }

  // Criar um novo gol
  async create(goalData) {
    try {
      if (!goalData.matchId) {
        throw new Error("ID da partida é obrigatório");
      }
      if (!goalData.playerId) {
        throw new Error("ID do jogador é obrigatório");
      }
      if (!goalData.playerName) {
        throw new Error("Nome do jogador é obrigatório");
      }
      if (!goalData.team || !["black", "white"].includes(goalData.team)) {
        throw new Error("Time deve ser 'black' ou 'white'");
      }
      if (!goalData.type || !["favor", "contra"].includes(goalData.type)) {
        throw new Error("Tipo do gol deve ser 'favor' ou 'contra'");
      }

      const goalToCreate = {
        matchId: goalData.matchId,
        playerId: goalData.playerId,
        playerName: goalData.playerName,
        team: goalData.team,
        type: goalData.type,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        goalToCreate
      );

      // Retornar o gol criado com o ID
      return {
        id: docRef.id,
        ...goalToCreate,
        timestamp: new Date(), // Para uso imediato no frontend
      };
    } catch (error) {
      console.error("Erro ao criar gol:", error);
      throw new Error(
        error.message || "Erro ao registrar gol. Tente novamente."
      );
    }
  }

  // Deletar um gol
  async delete(goalId) {
    try {
      if (!goalId) {
        throw new Error("ID do gol é obrigatório");
      }

      await deleteDoc(doc(db, this.collectionName, goalId));
      return true;
    } catch (error) {
      console.error("Erro ao deletar gol:", error);
      throw new Error("Erro ao remover gol. Tente novamente.");
    }
  }

  // Buscar estatísticas de gols de um jogador (para uso futuro)
  async getPlayerStats(playerId) {
    try {
      if (!playerId) {
        throw new Error("ID do jogador é obrigatório");
      }

      const playerGoalsQuery = query(
        collection(db, this.collectionName),
        where("playerId", "==", playerId)
      );

      const querySnapshot = await getDocs(playerGoalsQuery);
      const goals = [];

      querySnapshot.forEach((doc) => {
        goals.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      // Calcular estatísticas
      const goalsFor = goals.filter((goal) => goal.type === "favor").length;
      const goalsAgainst = goals.filter(
        (goal) => goal.type === "contra"
      ).length;
      const totalGoals = goals.length;

      return {
        totalGoals,
        goalsFor,
        goalsAgainst,
        goals,
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas do jogador:", error);
      throw new Error("Erro ao carregar estatísticas do jogador.");
    }
  }

  // Buscar estatísticas de uma partida
  async getMatchStats(matchId) {
    try {
      const goals = await this.findByMatchId(matchId);

      let blackScore = 0;
      let whiteScore = 0;

      goals.forEach((goal) => {
        if (goal.team === "black") {
          if (goal.type === "favor") {
            blackScore++;
          } else {
            whiteScore++; // Gol contra do time preto conta para o branco
          }
        } else {
          if (goal.type === "favor") {
            whiteScore++;
          } else {
            blackScore++; // Gol contra do time branco conta para o preto
          }
        }
      });

      return {
        blackScore: blackScore || 0,
        whiteScore: whiteScore || 0,
        totalGoals: goals.length || 0,
        goals: goals || [],
      };
    } catch (error) {
      console.error("Erro ao buscar estatísticas da partida:", error);

      // Se houver erro, retornar valores padrão
      // Isso pode acontecer se a collection goals não existir ainda ou se não houver gols
      return {
        blackScore: 0,
        whiteScore: 0,
        totalGoals: 0,
        goals: [],
      };
    }
  }
}

export default new GoalService();
