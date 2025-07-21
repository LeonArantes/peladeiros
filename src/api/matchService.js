import { collection, getDocs, query, addDoc } from "firebase/firestore";
import { db } from "../config/firebase";

export const findMatchs = async () => {
  try {
    console.log("Buscando matchs");

    const matchsRef = collection(db, "match");
    const q = query(matchsRef);

    // Executar a query
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("Nenhum match encontrado");
      return [];
    }

    // Se encontrou o customer, retornar os dados
    const matchDoc = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Matchs encontrados:", matchDoc);
    return matchDoc;
  } catch (error) {
    console.log("Erro ao buscar matchs:", error);
    throw new Error("Erro ao buscar matchs. Tente novamente.");
  }
};

/**
 * Cria uma nova partida no Firebase Firestore
 * @param {Object} matchData - Dados da partida para criar
 * @returns {Promise<string>} - Retorna o ID da partida criada
 */
export const createMatch = async (matchData) => {
  try {
    console.log("Criando nova partida:", matchData);
    const matchsRef = collection(db, "match");
    const docRef = await addDoc(matchsRef, matchData);

    console.log("Partida criada com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar partida:", error);
    throw new Error("Erro ao criar partida. Tente novamente.");
  }
};
