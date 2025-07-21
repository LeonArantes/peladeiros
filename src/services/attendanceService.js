import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  updateDoc,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "../config/firebase";
import userService from "./userService";

/**
 * Serviço para gerenciar lista de presença
 * Segue o princípio SRP - responsabilidade única de gerenciar presenças
 */
class AttendanceService {
  constructor() {
    this.collectionName = "attendance_list";
  }

  /**
   * Adiciona usuário à lista de presença
   * @param {string} matchId - ID da partida
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object>} - Documento criado
   */
  async addUserToMatch(matchId, userId) {
    try {
      // Verificar se usuário já está na lista
      const existingAttendance = await this.getUserAttendance(matchId, userId);
      if (existingAttendance) {
        throw new Error("Usuário já está na lista");
      }

      console.log("addUserToMatch", matchId, userId);
      // Buscar dados do usuário para determinar posição
      const user = await userService.findById(userId);
      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Buscar lista atual para calcular posição
      const currentList = await this.getMatchAttendanceList(matchId);
      const position = this.calculatePosition(user, currentList);

      const attendanceData = {
        matchId,
        userId,
        position,
        joinedAt: new Date(),
      };

      const docRef = await addDoc(
        collection(db, this.collectionName),
        attendanceData
      );

      // Atualizar contador de jogadores na partida
      await this.updateMatchPlayerCount(matchId, 1);

      return {
        id: docRef.id,
        ...attendanceData,
      };
    } catch (error) {
      console.error("Erro ao adicionar usuário à lista:", error);
      throw error;
    }
  }

  /**
   * Remove usuário da lista de presença
   * @param {string} matchId - ID da partida
   * @param {string} userId - ID do usuário
   */
  async removeUserFromMatch(matchId, userId) {
    try {
      const attendance = await this.getUserAttendance(matchId, userId);
      if (!attendance) {
        throw new Error("Usuário não está na lista");
      }

      await deleteDoc(doc(db, this.collectionName, attendance.id));

      // Atualizar contador de jogadores na partida
      await this.updateMatchPlayerCount(matchId, -1);

      // Reordenar posições dos demais jogadores
      await this.reorderPositions(matchId);
    } catch (error) {
      console.error("Erro ao remover usuário da lista:", error);
      throw error;
    }
  }

  /**
   * Busca a presença de um usuário específico
   * @param {string} matchId - ID da partida
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} - Dados da presença ou null
   */
  async getUserAttendance(matchId, userId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("matchId", "==", matchId),
        where("userId", "==", userId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } catch (error) {
      console.error("Erro ao buscar presença do usuário:", error);
      throw error;
    }
  }

  /**
   * Busca lista completa de presença de uma partida
   * @param {string} matchId - ID da partida
   * @returns {Promise<Array>} - Lista de presenças com dados dos usuários
   */
  async getMatchAttendanceList(matchId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("matchId", "==", matchId)
      );

      const querySnapshot = await getDocs(q);

      const attendanceList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      }));

      // Buscar dados dos usuários para cada item da lista
      const enrichedList = await Promise.all(
        attendanceList.map(async (attendance) => {
          const userData = await userService.findById(attendance.userId);
          return {
            ...attendance,
            userData,
            isMonthlyPayer: userService.isMonthlyPayer(userData),
          };
        })
      );

      return enrichedList;
    } catch (error) {
      console.error("Erro ao buscar lista de presença:", error);
      throw error;
    }
  }

  /**
   * Observa mudanças na lista de presença em tempo real
   * @param {string} matchId - ID da partida
   * @param {Function} callback - Callback para receber atualizações
   * @returns {Function} - Função para cancelar a observação
   */
  observeMatchAttendance(matchId, callback) {
    const q = query(
      collection(db, this.collectionName),
      where("matchId", "==", matchId)
    );

    return onSnapshot(q, async (snapshot) => {
      const attendanceList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        joinedAt: doc.data().joinedAt?.toDate() || new Date(),
      }));

      // Buscar dados dos usuários para cada item da lista
      const enrichedList = await Promise.all(
        attendanceList.map(async (attendance) => {
          const userData = await userService.findById(attendance.userId);
          return {
            ...attendance,
            userData,
            isMonthlyPayer: userService.isMonthlyPayer(userData),
          };
        })
      );

      // Ordenar lista: mensalistas primeiro, depois por ordem de chegada
      const sortedList = this.sortAttendanceList(enrichedList);
      callback(sortedList);
    });
  }

  /**
   * Calcula a posição correta para um usuário na lista
   * @param {Object} user - Dados do usuário
   * @param {Array} currentList - Lista atual de presença com dados dos usuários
   * @returns {number} - Posição calculada
   */
  calculatePosition(user, currentList) {
    const isUserMonthlyPayer = userService.isMonthlyPayer(user);

    if (isUserMonthlyPayer) {
      // Se é mensalista, vai para o final da lista de mensalistas
      const monthlyPayersCount = currentList.filter(
        (item) =>
          item.isMonthlyPayer || userService.isMonthlyPayer(item.userData)
      ).length;
      return monthlyPayersCount + 1;
    } else {
      // Se não é mensalista, vai para o final da lista geral
      return currentList.length + 1;
    }
  }

  /**
   * Ordena lista de presença: mensalistas primeiro, depois por ordem de chegada
   * @param {Array} attendanceList - Lista de presença
   * @returns {Array} - Lista ordenada
   */
  sortAttendanceList(attendanceList) {
    return attendanceList.sort((a, b) => {
      // Mensalistas sempre primeiro
      if (a.isMonthlyPayer && !b.isMonthlyPayer) return -1;
      if (!a.isMonthlyPayer && b.isMonthlyPayer) return 1;

      // Se ambos são iguais, ordenar por data de entrada
      return a.joinedAt - b.joinedAt;
    });
  }

  /**
   * Reordena as posições após remoção de um usuário
   * @param {string} matchId - ID da partida
   */
  async reorderPositions(matchId) {
    try {
      const currentList = await this.getMatchAttendanceList(matchId);
      const sortedList = this.sortAttendanceList(currentList);

      // Atualizar posições de acordo com a nova ordem
      const updatePromises = sortedList.map((item, index) => {
        const newPosition = index + 1;
        if (item.position !== newPosition) {
          return updateDoc(doc(db, this.collectionName, item.id), {
            position: newPosition,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Erro ao reordenar posições:", error);
      throw error;
    }
  }

  /**
   * Atualiza contador de jogadores na partida
   * @param {string} matchId - ID da partida
   * @param {number} increment - Valor para incrementar/decrementar
   */
  async updateMatchPlayerCount(matchId, incrementValue) {
    try {
      await updateDoc(doc(db, "match", matchId), {
        current_players: increment(incrementValue),
      });
    } catch (error) {
      console.error("Erro ao atualizar contador de jogadores:", error);
      throw error;
    }
  }
}

// Exportar instância única (Singleton)
export const attendanceService = new AttendanceService();
export default attendanceService;
