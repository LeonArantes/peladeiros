import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import userService from "./userService";

/**
 * Serviço para gerenciar divisão única de times por partida
 * Segue o princípio SRP - responsabilidade única de gerenciar escalação
 */
class TeamDivisionService {
  constructor() {
    this.collectionName = "team_divisions";
  }

  /**
   * Cria ou atualiza a divisão de uma partida (única por match)
   * @param {Object} divisionData - Dados da divisão
   * @param {string} divisionData.matchId - ID da partida
   * @param {string} divisionData.createdBy - ID do usuário que criou
   * @param {Array} divisionData.teamBlack - IDs dos jogadores do time preto
   * @param {Array} divisionData.teamWhite - IDs dos jogadores do time branco
   * @returns {Promise<Object>} - Documento criado/atualizado
   */
  async createOrUpdateDivision({ matchId, createdBy, teamBlack, teamWhite }) {
    try {
      // Verificar se já existe uma divisão para esta partida
      const existingDivision = await this.getMatchDivision(matchId);

      const divisionData = {
        matchId,
        createdBy,
        teamBlack,
        teamWhite,
        createdAt: existingDivision?.createdAt || new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      if (existingDivision) {
        // Atualizar divisão existente
        const divisionRef = doc(db, this.collectionName, existingDivision.id);
        await updateDoc(divisionRef, {
          ...divisionData,
          createdBy, // Atualizar quem fez a última modificação
        });

        return {
          id: existingDivision.id,
          ...divisionData,
        };
      } else {
        // Criar nova divisão
        const docRef = await addDoc(
          collection(db, this.collectionName),
          divisionData
        );

        return {
          id: docRef.id,
          ...divisionData,
        };
      }
    } catch (error) {
      console.error("Erro ao criar/atualizar divisão:", error);
      throw error;
    }
  }

  /**
   * Busca a divisão de uma partida (única)
   * @param {string} matchId - ID da partida
   * @returns {Promise<Object|null>} - Divisão com dados dos usuários ou null
   */
  async getMatchDivision(matchId) {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("matchId", "==", matchId)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const division = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      };

      // Enriquecer com dados dos usuários
      const [creatorData, teamBlackData, teamWhiteData] = await Promise.all([
        userService.findById(division.createdBy),
        Promise.all(
          division.teamBlack.map((userId) => userService.findById(userId))
        ),
        Promise.all(
          division.teamWhite.map((userId) => userService.findById(userId))
        ),
      ]);

      return {
        ...division,
        creatorData,
        teamBlackData: teamBlackData.filter(Boolean),
        teamWhiteData: teamWhiteData.filter(Boolean),
      };
    } catch (error) {
      console.error("Erro ao buscar divisão:", error);
      throw error;
    }
  }

  /**
   * Observa mudanças na divisão de uma partida em tempo real
   * @param {string} matchId - ID da partida
   * @param {Function} callback - Callback para receber atualizações
   * @returns {Function} - Função para cancelar a observação
   */
  observeMatchDivision(matchId, callback) {
    const q = query(
      collection(db, this.collectionName),
      where("matchId", "==", matchId)
    );

    return onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        callback(null);
        return;
      }

      const doc = snapshot.docs[0];
      const division = {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      };

      // Enriquecer com dados dos usuários
      const [creatorData, teamBlackData, teamWhiteData] = await Promise.all([
        userService.findById(division.createdBy),
        Promise.all(
          division.teamBlack.map((userId) => userService.findById(userId))
        ),
        Promise.all(
          division.teamWhite.map((userId) => userService.findById(userId))
        ),
      ]);

      const enrichedDivision = {
        ...division,
        creatorData,
        teamBlackData: teamBlackData.filter(Boolean),
        teamWhiteData: teamWhiteData.filter(Boolean),
      };

      callback(enrichedDivision);
    });
  }

  /**
   * Remove a divisão de uma partida (apenas o criador ou admin)
   * @param {string} matchId - ID da partida
   * @param {string} userId - ID do usuário solicitante
   */
  async deleteDivision(matchId, userId) {
    try {
      const division = await this.getMatchDivision(matchId);

      if (!division) {
        throw new Error("Divisão não encontrada");
      }

      const user = await userService.findById(userId);

      // Verificar permissões
      if (division.createdBy !== userId && !userService.isAdmin(user)) {
        throw new Error("Sem permissão para deletar esta divisão");
      }

      await deleteDoc(doc(db, this.collectionName, division.id));
    } catch (error) {
      console.error("Erro ao deletar divisão:", error);
      throw error;
    }
  }

  /**
   * Verifica se o usuário pode deletar/editar uma divisão
   * @param {Object} division - Dados da divisão
   * @param {string} userId - ID do usuário
   * @returns {boolean} - Se pode editar/deletar
   */
  canEditDivision(division, userId) {
    if (!division || !userId) return false;

    const user = userService.findById(userId);
    return division.createdBy === userId || userService.isAdmin(user);
  }
}

// Exportar instância única (Singleton)
export const teamDivisionService = new TeamDivisionService();
export default teamDivisionService;
