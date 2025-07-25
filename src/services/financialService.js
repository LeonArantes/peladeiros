import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  startAfter,
  limit,
} from "firebase/firestore";
import { db } from "../config/firebase";

/**
 * Serviço para gerenciar operações financeiras da pelada
 * Segue o princípio SRP - responsabilidade única de gerenciar finanças
 */
class FinancialService {
  constructor() {
    this.transactionsCollection = "transactions";
    this.monthlyFeesCollection = "monthly_fees";
    this.walletSettingsCollection = "wallet_settings";
  }

  /**
   * Cria uma nova transação
   * @param {Object} transactionData - Dados da transação
   * @returns {Promise<Object>} - Transação criada com ID
   */
  async createTransaction(transactionData) {
    try {
      // Validar dados obrigatórios
      if (!transactionData.type || !transactionData.amount) {
        throw new Error("Tipo e valor são obrigatórios");
      }

      if (!["entrada", "saida"].includes(transactionData.type)) {
        throw new Error("Tipo deve ser 'entrada' ou 'saida'");
      }

      if (transactionData.amount <= 0) {
        throw new Error("Valor deve ser maior que zero");
      }

      const transactionToCreate = {
        type: transactionData.type,
        amount: Number(transactionData.amount),
        description: transactionData.description || "",
        category: transactionData.category || "outros",
        date: transactionData.date || new Date().toISOString().split("T")[0],
        player_id: transactionData.player_id || null,
        player_name: transactionData.player_name || null,
        created_by: transactionData.created_by || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      console.log("Criando transação:", transactionToCreate);

      const docRef = await addDoc(
        collection(db, this.transactionsCollection),
        transactionToCreate
      );

      const createdTransaction = {
        id: docRef.id,
        ...transactionToCreate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log("Transação criada com sucesso:", createdTransaction);
      return createdTransaction;
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      throw new Error(
        error.message || "Erro ao criar transação. Tente novamente."
      );
    }
  }

  /**
   * Busca todas as transações ordenadas por data (mais recentes primeiro)
   * @returns {Promise<Array>} - Lista de transações
   */
  async getAllTransactions() {
    try {
      console.log("Buscando todas as transações...");

      const transactionsRef = collection(db, this.transactionsCollection);
      const q = query(transactionsRef, orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);

      const transactions = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`${transactions.length} transações encontradas`);
      return transactions;
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
      throw new Error("Erro ao carregar transações. Tente novamente.");
    }
  }

  /**
   * Busca transações com paginação
   * @param {number} limit - Número de transações por página (padrão: 10)
   * @param {Object} lastDoc - Último documento da página anterior (para cursor)
   * @returns {Promise<Object>} - Objeto com transações e informações de paginação
   */
  async getTransactionsPaginated(_limit = 10, lastDoc = null) {
    try {
      console.log("Buscando transações paginadas:", {
        _limit,
        hasLastDoc: !!lastDoc,
      });

      const transactionsRef = collection(db, this.transactionsCollection);
      let q = query(
        transactionsRef,
        orderBy("date", "desc"),
        orderBy("created_at", "desc") // Fallback para garantir ordem consistente
      );

      // Se há último documento, começar após ele
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      // Aplicar limite + 1 para verificar se há mais páginas
      q = query(q, limit(_limit + 1));

      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;

      // Separar transações e verificar se há próxima página
      const transactions = docs.slice(0, _limit).map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const hasNextPage = docs.length > _limit;
      const nextPageLastDoc = hasNextPage ? docs[_limit - 1] : null;

      const result = {
        transactions,
        hasNextPage,
        lastDoc: nextPageLastDoc,
        currentPageSize: transactions.length,
      };

      console.log(
        `${transactions.length} transações carregadas, hasNextPage: ${hasNextPage}`
      );
      return result;
    } catch (error) {
      console.error("Erro ao buscar transações paginadas:", error);
      throw new Error("Erro ao carregar transações. Tente novamente.");
    }
  }

  /**
   * Calcula o saldo atual baseado nas transações
   * @returns {Promise<Object>} - Objeto com estatísticas financeiras
   */
  async getFinancialStats() {
    try {
      console.log("Calculando estatísticas financeiras...");

      const transactions = await this.getAllTransactions();

      const totalEntradas = transactions
        .filter((t) => t.type === "entrada")
        .reduce((sum, t) => sum + t.amount, 0);

      const totalSaidas = transactions
        .filter((t) => t.type === "saida")
        .reduce((sum, t) => sum + t.amount, 0);

      const saldoAtual = totalEntradas - totalSaidas;

      const stats = {
        totalEntradas,
        totalSaidas,
        saldoAtual,
        totalTransacoes: transactions.length,
      };

      console.log("Estatísticas calculadas:", stats);
      return stats;
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
      throw new Error("Erro ao calcular estatísticas. Tente novamente.");
    }
  }

  /**
   * Busca transação por ID
   * @param {string} transactionId - ID da transação
   * @returns {Promise<Object|null>} - Dados da transação ou null
   */
  async getTransactionById(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("ID da transação é obrigatório");
      }

      console.log("Buscando transação por ID:", transactionId);

      const transactionRef = doc(
        db,
        this.transactionsCollection,
        transactionId
      );
      const transactionSnap = await getDoc(transactionRef);

      if (!transactionSnap.exists()) {
        console.log("Transação não encontrada");
        return null;
      }

      const transaction = {
        id: transactionSnap.id,
        ...transactionSnap.data(),
      };

      console.log("Transação encontrada:", transaction);
      return transaction;
    } catch (error) {
      console.error("Erro ao buscar transação:", error);
      throw new Error("Erro ao buscar transação. Tente novamente.");
    }
  }

  /**
   * Atualiza uma transação
   * @param {string} transactionId - ID da transação
   * @param {Object} transactionData - Dados a serem atualizados
   * @returns {Promise<Object>} - Transação atualizada
   */
  async updateTransaction(transactionId, transactionData) {
    try {
      if (!transactionId) {
        throw new Error("ID da transação é obrigatório");
      }

      const updateData = {
        ...transactionData,
        updated_at: serverTimestamp(),
      };

      console.log("Atualizando transação:", { transactionId, updateData });

      const transactionRef = doc(
        db,
        this.transactionsCollection,
        transactionId
      );
      await updateDoc(transactionRef, updateData);

      // Buscar dados atualizados
      const updatedTransaction = await this.getTransactionById(transactionId);

      console.log("Transação atualizada com sucesso:", updatedTransaction);
      return updatedTransaction;
    } catch (error) {
      console.error("Erro ao atualizar transação:", error);
      throw new Error("Erro ao atualizar transação. Tente novamente.");
    }
  }

  /**
   * Remove uma transação
   * @param {string} transactionId - ID da transação
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteTransaction(transactionId) {
    try {
      if (!transactionId) {
        throw new Error("ID da transação é obrigatório");
      }

      console.log("Removendo transação:", transactionId);

      const transactionRef = doc(
        db,
        this.transactionsCollection,
        transactionId
      );
      await deleteDoc(transactionRef);

      console.log("Transação removida com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao remover transação:", error);
      throw new Error("Erro ao remover transação. Tente novamente.");
    }
  }

  // ==================== MONTHLY FEES METHODS ====================

  /**
   * Cria uma taxa mensal para um jogador
   * @param {Object} monthlyFeeData - Dados da taxa mensal
   * @returns {Promise<Object>} - Taxa mensal criada com ID
   */
  async createMonthlyFee(monthlyFeeData) {
    try {
      // Validar dados obrigatórios
      if (
        !monthlyFeeData.player_id ||
        !monthlyFeeData.player_name ||
        !monthlyFeeData.month_reference ||
        !monthlyFeeData.fee_value
      ) {
        throw new Error(
          "Player ID, nome, mês de referência e valor são obrigatórios"
        );
      }

      if (monthlyFeeData.fee_value <= 0) {
        throw new Error("Valor da taxa deve ser maior que zero");
      }

      // Verificar se já existe taxa para este jogador neste mês
      const existingFeeQuery = query(
        collection(db, this.monthlyFeesCollection),
        where("player_id", "==", monthlyFeeData.player_id),
        where("month_reference", "==", monthlyFeeData.month_reference)
      );

      const existingFeeSnapshot = await getDocs(existingFeeQuery);

      if (!existingFeeSnapshot.empty) {
        throw new Error(
          `Taxa mensal para ${monthlyFeeData.player_name} em ${monthlyFeeData.month_reference} já existe`
        );
      }

      const monthlyFeeToCreate = {
        player_id: monthlyFeeData.player_id,
        player_name: monthlyFeeData.player_name,
        month_reference: monthlyFeeData.month_reference, // "2025-01"
        fee_value: Number(monthlyFeeData.fee_value),
        is_paid: false,
        paid_date: null,
        transaction_id: null, // ID da transação quando for pago
        created_by: monthlyFeeData.created_by || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      console.log("Criando taxa mensal:", monthlyFeeToCreate);

      const docRef = await addDoc(
        collection(db, this.monthlyFeesCollection),
        monthlyFeeToCreate
      );

      const createdMonthlyFee = {
        id: docRef.id,
        ...monthlyFeeToCreate,
        created_at: new Date(),
        updated_at: new Date(),
      };

      console.log("Taxa mensal criada com sucesso:", createdMonthlyFee);
      return createdMonthlyFee;
    } catch (error) {
      console.error("Erro ao criar taxa mensal:", error);
      throw new Error(
        error.message || "Erro ao criar taxa mensal. Tente novamente."
      );
    }
  }

  /**
   * Busca todas as taxas mensais com filtros opcionais
   * @param {Object} filters - Filtros opcionais (month_reference, player_id, is_paid)
   * @returns {Promise<Array>} - Lista de taxas mensais
   */
  async getMonthlyFees(filters = {}) {
    try {
      console.log("Buscando taxas mensais com filtros:", filters);

      let q = collection(db, this.monthlyFeesCollection);

      // Aplicar filtros se fornecidos
      const constraints = [];

      if (filters.month_reference) {
        constraints.push(
          where("month_reference", "==", filters.month_reference)
        );
      }

      if (filters.player_id) {
        constraints.push(where("player_id", "==", filters.player_id));
      }

      if (typeof filters.is_paid === "boolean") {
        constraints.push(where("is_paid", "==", filters.is_paid));
      }

      // Ordenar por mês de referência (mais recente primeiro) e depois por nome do jogador
      constraints.push(orderBy("month_reference", "desc"));
      constraints.push(orderBy("player_name", "asc"));

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);

      const monthlyFees = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log(`${monthlyFees.length} taxas mensais encontradas`);
      return monthlyFees;
    } catch (error) {
      console.error("Erro ao buscar taxas mensais:", error);
      throw new Error("Erro ao carregar taxas mensais. Tente novamente.");
    }
  }

  /**
   * Busca taxas mensais de um mês específico
   * @param {string} monthReference - Mês no formato "YYYY-MM"
   * @returns {Promise<Array>} - Lista de taxas mensais do mês
   */
  async getMonthlyFeesByMonth(monthReference) {
    try {
      if (!monthReference) {
        throw new Error("Mês de referência é obrigatório");
      }

      console.log("Buscando taxas mensais do mês:", monthReference);

      return await this.getMonthlyFees({ month_reference: monthReference });
    } catch (error) {
      console.error("Erro ao buscar taxas do mês:", error);
      throw new Error("Erro ao carregar taxas do mês. Tente novamente.");
    }
  }

  /**
   * Atualiza o status de pagamento de uma taxa mensal
   * @param {string} monthlyFeeId - ID da taxa mensal
   * @param {boolean} isPaid - Status de pagamento
   * @param {Object} transactionData - Dados da transação (quando marcar como pago)
   * @returns {Promise<Object>} - Taxa mensal atualizada
   */
  async updateMonthlyFeePaymentStatus(
    monthlyFeeId,
    isPaid,
    transactionData = null
  ) {
    try {
      if (!monthlyFeeId) {
        throw new Error("ID da taxa mensal é obrigatório");
      }

      console.log("Atualizando status de pagamento:", { monthlyFeeId, isPaid });

      // Buscar a taxa mensal atual
      const monthlyFee = await this.getMonthlyFeeById(monthlyFeeId);
      if (!monthlyFee) {
        throw new Error("Taxa mensal não encontrada");
      }

      let updateData = {
        is_paid: isPaid,
        paid_date: isPaid ? new Date().toISOString().split("T")[0] : null,
        updated_at: serverTimestamp(),
      };

      let transactionId = null;

      // Se está marcando como pago, criar transação de entrada automaticamente
      if (isPaid && transactionData) {
        const transaction = await this.createTransaction({
          type: "entrada",
          amount: monthlyFee.fee_value,
          description:
            transactionData.description ||
            `Mensalidade ${monthlyFee.player_name} - ${this.formatMonthName(
              monthlyFee.month_reference
            )}`,
          category: "mensalidade",
          player_name: monthlyFee.player_name,
          player_id: monthlyFee.player_id,
          created_by: transactionData.created_by || null,
        });

        transactionId = transaction.id;
        updateData.transaction_id = transactionId;
      }

      // Se está desmarcando como pago, remover a transação associada
      if (!isPaid && monthlyFee.transaction_id) {
        try {
          await this.deleteTransaction(monthlyFee.transaction_id);
          updateData.transaction_id = null;
        } catch (error) {
          console.warn("Erro ao remover transação associada:", error);
          // Continuar mesmo se não conseguir remover a transação
        }
      }

      // Atualizar a taxa mensal
      const monthlyFeeRef = doc(db, this.monthlyFeesCollection, monthlyFeeId);
      await updateDoc(monthlyFeeRef, updateData);

      // Buscar dados atualizados
      const updatedMonthlyFee = await this.getMonthlyFeeById(monthlyFeeId);

      console.log("Status de pagamento atualizado:", updatedMonthlyFee);
      return { monthlyFee: updatedMonthlyFee, transactionId };
    } catch (error) {
      console.error("Erro ao atualizar status de pagamento:", error);
      throw new Error(
        "Erro ao atualizar status de pagamento. Tente novamente."
      );
    }
  }

  /**
   * Busca taxa mensal por ID
   * @param {string} monthlyFeeId - ID da taxa mensal
   * @returns {Promise<Object|null>} - Dados da taxa mensal ou null
   */
  async getMonthlyFeeById(monthlyFeeId) {
    try {
      if (!monthlyFeeId) {
        throw new Error("ID da taxa mensal é obrigatório");
      }

      console.log("Buscando taxa mensal por ID:", monthlyFeeId);

      const monthlyFeeRef = doc(db, this.monthlyFeesCollection, monthlyFeeId);
      const monthlyFeeSnap = await getDoc(monthlyFeeRef);

      if (!monthlyFeeSnap.exists()) {
        console.log("Taxa mensal não encontrada");
        return null;
      }

      const monthlyFee = {
        id: monthlyFeeSnap.id,
        ...monthlyFeeSnap.data(),
      };

      console.log("Taxa mensal encontrada:", monthlyFee);
      return monthlyFee;
    } catch (error) {
      console.error("Erro ao buscar taxa mensal:", error);
      throw new Error("Erro ao buscar taxa mensal. Tente novamente.");
    }
  }

  /**
   * Remove uma taxa mensal
   * @param {string} monthlyFeeId - ID da taxa mensal
   * @returns {Promise<boolean>} - Sucesso da operação
   */
  async deleteMonthlyFee(monthlyFeeId) {
    try {
      if (!monthlyFeeId) {
        throw new Error("ID da taxa mensal é obrigatório");
      }

      console.log("Removendo taxa mensal:", monthlyFeeId);

      // Buscar a taxa mensal para ver se tem transação associada
      const monthlyFee = await this.getMonthlyFeeById(monthlyFeeId);

      if (monthlyFee && monthlyFee.transaction_id) {
        // Remover transação associada
        try {
          await this.deleteTransaction(monthlyFee.transaction_id);
        } catch (error) {
          console.warn("Erro ao remover transação associada:", error);
          // Continuar mesmo se não conseguir remover a transação
        }
      }

      const monthlyFeeRef = doc(db, this.monthlyFeesCollection, monthlyFeeId);
      await deleteDoc(monthlyFeeRef);

      console.log("Taxa mensal removida com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao remover taxa mensal:", error);
      throw new Error("Erro ao remover taxa mensal. Tente novamente.");
    }
  }

  /**
   * Cria taxas mensais em lote para múltiplos jogadores
   * @param {Array} playersData - Array com dados dos jogadores
   * @param {string} monthReference - Mês de referência
   * @param {number} feeValue - Valor da taxa
   * @param {string} createdBy - ID do usuário que criou
   * @returns {Promise<Array>} - Array de taxas criadas
   */
  async createBulkMonthlyFees(
    playersData,
    monthReference,
    feeValue,
    createdBy = null
  ) {
    try {
      if (!Array.isArray(playersData) || playersData.length === 0) {
        throw new Error("Lista de jogadores é obrigatória");
      }

      if (!monthReference || !feeValue) {
        throw new Error("Mês de referência e valor são obrigatórios");
      }

      console.log("Criando taxas mensais em lote:", {
        players: playersData.length,
        monthReference,
        feeValue,
      });

      const createdFees = [];
      const errors = [];

      // Criar taxas uma por uma para ter controle de erro individual
      for (const playerData of playersData) {
        try {
          const monthlyFee = await this.createMonthlyFee({
            player_id: playerData.id,
            player_name: playerData.name,
            month_reference: monthReference,
            fee_value: feeValue,
            created_by: createdBy,
          });

          createdFees.push(monthlyFee);
        } catch (error) {
          console.error(`Erro ao criar taxa para ${playerData.name}:`, error);
          errors.push({
            player: playerData.name,
            error: error.message,
          });
        }
      }

      console.log(`${createdFees.length} taxas criadas com sucesso`);

      if (errors.length > 0) {
        console.warn("Erros durante criação em lote:", errors);
      }

      return { createdFees, errors };
    } catch (error) {
      console.error("Erro ao criar taxas em lote:", error);
      throw new Error("Erro ao criar taxas em lote. Tente novamente.");
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Formata nome do mês para exibição
   * @param {string} monthReference - Mês no formato "YYYY-MM"
   * @returns {string} - Nome do mês formatado
   */
  formatMonthName(monthReference) {
    try {
      const [year, month] = monthReference.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar nome do mês:", error);
      return monthReference;
    }
  }
}

export const financialService = new FinancialService();
export default financialService;
