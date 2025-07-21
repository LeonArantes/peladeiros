import { createContext, useContext, useState, useEffect } from "react";
import userService from "../services/userService";
import storageService from "../services/storageService";

const AuthContext = createContext({});

/**
 * Provider de autenticação refatorado seguindo princípios SOLID
 * Usa injeção de dependência dos serviços
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há usuário logado no localStorage
  useEffect(() => {
    const checkAuth = () => {
      try {
        const userData = storageService.getUser();
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error);
        storageService.removeUser();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  /**
   * Realiza login do usuário
   * @param {Object} credentials - Credenciais do usuário (telefone, dataNascimento)
   * @param {Function} callback - Callback para sucesso
   */
  const login = async (credentials, callback) => {
    try {
      console.log("Tentando fazer login com:", credentials);

      const user = await userService.findByPhoneAndBirthdate(
        credentials.telefone,
        credentials.dataNascimento
      );

      if (user) {
        setUser(user);
        storageService.saveUser(user);

        console.log("Login realizado com sucesso:", user);

        if (callback) {
          callback();
        }
      } else {
        throw new Error("Usuário não encontrado. Verifique seus dados.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  /**
   * Realiza logout do usuário
   */
  const logout = () => {
    setUser(null);
    storageService.removeUser();
  };

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} - Se está autenticado
   */
  const isAuthenticated = () => {
    return user && user.isAuthenticated;
  };

  /**
   * Verifica se o usuário é mensalista
   * @returns {boolean} - Se é mensalista
   */
  const isMonthlyPayer = () => {
    return userService.isMonthlyPayer(user);
  };

  /**
   * Verifica se o usuário é admin
   * @returns {boolean} - Se é admin
   */
  const isAdmin = () => {
    return userService.isAdmin(user);
  };

  /**
   * Verifica se o usuário está ativo
   * @returns {boolean} - Se está ativo
   */
  const isActive = () => {
    return userService.isActive(user);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated,
    isMonthlyPayer,
    isAdmin,
    isActive,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
