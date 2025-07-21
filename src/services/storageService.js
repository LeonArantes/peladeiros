/**
 * Serviço para gerenciar armazenamento local
 * Segue o princípio SRP - responsabilidade única de gerenciar storage
 */
class StorageService {
  constructor() {
    this.USER_KEY = "peladaUser";
  }

  /**
   * Salva dados do usuário no localStorage
   * @param {Object} userData - Dados do usuário
   */
  saveUser(userData) {
    try {
      localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
      console.log("Usuário salvo no localStorage");
    } catch (error) {
      console.error("Erro ao salvar usuário no localStorage:", error);
      throw new Error("Erro ao salvar dados de login");
    }
  }

  /**
   * Recupera dados do usuário do localStorage
   * @returns {Object|null} - Dados do usuário ou null
   */
  getUser() {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.isAuthenticated) {
          return parsedUser;
        }
      }
      return null;
    } catch (error) {
      console.error("Erro ao recuperar usuário do localStorage:", error);
      return null;
    }
  }

  /**
   * Remove dados do usuário do localStorage
   */
  removeUser() {
    try {
      localStorage.removeItem(this.USER_KEY);
      console.log("Usuário removido do localStorage");
    } catch (error) {
      console.error("Erro ao remover usuário do localStorage:", error);
    }
  }

  /**
   * Verifica se há dados de usuário salvos
   * @returns {boolean} - Se há dados salvos
   */
  hasUser() {
    return this.getUser() !== null;
  }

  /**
   * Limpa todo o localStorage (para logout completo)
   */
  clearAll() {
    try {
      localStorage.clear();
      console.log("localStorage limpo");
    } catch (error) {
      console.error("Erro ao limpar localStorage:", error);
    }
  }
}

// Exportar instância única (Singleton)
export const storageService = new StorageService();
export default storageService;
