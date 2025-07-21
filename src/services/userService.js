import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Serviço para gerenciar operações relacionadas aos usuários
 * Segue o princípio SRP - responsabilidade única de gerenciar usuários
 */
class UserService {
  constructor() {
    this.collectionName = "users";
  }

  /**
   * Busca usuário por telefone e data de nascimento
   * @param {string} phone - Telefone do usuário
   * @param {string} birthdate - Data de nascimento no formato YYYYMMDD
   * @returns {Promise<Object|null>} - Dados do usuário ou null
   */
  async findByPhoneAndBirthdate(phone, birthdate) {
    try {
      const phoneNumber = Number(phone.replace(/[^0-9]/g, ""));
      const birthdateNumber = Number(birthdate.replace(/[^0-9]/g, ""));

      console.log("Buscando usuário:", { phoneNumber, birthdateNumber });

      const usersRef = collection(db, this.collectionName);
      const q = query(
        usersRef,
        where("phone", "==", phoneNumber),
        where("birthdate", "==", birthdateNumber)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log("Usuário não encontrado");
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = {
        id: userDoc.id,
        ...userDoc.data(),
        isAuthenticated: true,
      };

      console.log("Usuário encontrado:", userData);
      return userData;
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      throw new Error("Erro ao buscar usuário. Tente novamente.");
    }
  }

  /**
   * Busca usuário por ID
   * @param {string} userId - ID do usuário
   * @returns {Promise<Object|null>} - Dados do usuário ou null
   */
  async findById(userId) {
    try {
      const userDoc = await getDoc(doc(db, this.collectionName, userId));

      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data(),
      };
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      throw new Error("Erro ao buscar usuário.");
    }
  }

  /**
   * Busca todos os usuários
   * @returns {Promise<Array>} - Lista de todos os usuários
   */
  async findAll() {
    try {
      console.log("Buscando todos os usuários...");

      const usersRef = collection(db, this.collectionName);
      const querySnapshot = await getDocs(usersRef);

      const users = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`${users.length} usuários encontrados`);
      return users;
    } catch (error) {
      console.error("Erro ao buscar todos os usuários:", error);
      throw new Error("Erro ao carregar lista de usuários. Tente novamente.");
    }
  }

  /**
   * Atualiza dados de um usuário
   * @param {string} userId - ID do usuário
   * @param {Object} userData - Dados a serem atualizados
   * @returns {Promise<Object>} - Usuário atualizado
   */
  async update(userId, userData) {
    try {
      if (!userId) {
        throw new Error("ID do usuário é obrigatório");
      }

      // Converter tipos conforme necessário (mesma lógica do create)
      const userToUpdate = {};

      if (userData.name !== undefined) {
        userToUpdate.name = userData.name;
      }

      if (userData.phone !== undefined) {
        userToUpdate.phone = Number(
          String(userData.phone).replace(/[^0-9]/g, "")
        );
      }

      if (userData.birthdate !== undefined) {
        userToUpdate.birthdate = Number(
          String(userData.birthdate).replace(/[^0-9]/g, "")
        );
      }

      if (userData.is_active !== undefined) {
        userToUpdate.is_active = Boolean(userData.is_active);
      }

      if (userData.is_admin !== undefined) {
        userToUpdate.is_admin = Boolean(userData.is_admin);
      }

      if (userData.is_montly_payer !== undefined) {
        userToUpdate.is_montly_payer = Boolean(userData.is_montly_payer);
      }

      if (userData.playing_positions !== undefined) {
        userToUpdate.playing_positions = Array.isArray(
          userData.playing_positions
        )
          ? userData.playing_positions
          : [];
      }

      if (userData.score !== undefined) {
        userToUpdate.score = Number(userData.score) || 0;
      }

      console.log("Atualizando usuário:", { userId, userToUpdate });

      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, userToUpdate);

      // Buscar dados atualizados
      const updatedUser = await this.findById(userId);

      console.log("Usuário atualizado com sucesso:", updatedUser);
      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw new Error(
        error.message || "Erro ao atualizar usuário. Tente novamente."
      );
    }
  }

  /**
   * Verifica se o usuário é mensalista
   * @param {Object} user - Dados do usuário
   * @returns {boolean} - Se é mensalista
   */
  isMonthlyPayer(user) {
    return Boolean(user?.is_montly_payer);
  }

  /**
   * Verifica se o usuário está ativo
   * @param {Object} user - Dados do usuário
   * @returns {boolean} - Se está ativo
   */
  isActive(user) {
    return Boolean(user?.is_active);
  }

  /**
   * Verifica se o usuário é admin
   * @param {Object} user - Dados do usuário
   * @returns {boolean} - Se é admin
   */
  isAdmin(user) {
    return Boolean(user?.is_admin);
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} - Usuário criado com ID
   */
  async create(userData) {
    try {
      // Validar dados obrigatórios
      if (!userData.name || !userData.phone || !userData.birthdate) {
        throw new Error("Nome, telefone e data de nascimento são obrigatórios");
      }

      // Converter tipos conforme necessário
      const userToCreate = {
        name: userData.name,
        phone: Number(String(userData.phone).replace(/[^0-9]/g, "")),
        birthdate: Number(String(userData.birthdate).replace(/[^0-9]/g, "")),
        is_active: Boolean(userData.is_active),
        is_admin: Boolean(userData.is_admin),
        is_montly_payer: Boolean(userData.is_montly_payer),
        playing_positions: Array.isArray(userData.playing_positions)
          ? userData.playing_positions
          : [],
        score: Number(userData.score) || 0,
      };

      console.log("Criando usuário:", userToCreate);

      const docRef = await addDoc(
        collection(db, this.collectionName),
        userToCreate
      );

      const createdUser = {
        id: docRef.id,
        ...userToCreate,
      };

      console.log("Usuário criado com sucesso:", createdUser);
      return createdUser;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error(
        error.message || "Erro ao criar usuário. Tente novamente."
      );
    }
  }
}

// Exportar instância única (Singleton)
export const userService = new UserService();
export default userService;
