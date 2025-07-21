import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import attendanceService from "../services/attendanceService";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

/**
 * Hook customizado para gerenciar lista de presença
 * Separa a lógica de negócio da interface do usuário
 */
export const useAttendance = (matchId, maxPlayers = 14) => {
  const { user } = useAuth();
  const toast = useToast();

  // Estados
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Estados derivados
  const userInList = attendanceList.find((item) => item.userId === user?.id);
  const isListFull = attendanceList.length >= maxPlayers + 4;
  const confirmedCount = Math.min(attendanceList.length, maxPlayers);
  const waitingCount = Math.max(0, attendanceList.length - maxPlayers);

  /**
   * Observa mudanças na lista de presença
   */
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = attendanceService.observeMatchAttendance(
      matchId,
      (list) => {
        // Adicionar status e posição correta para cada item
        const listWithStatus = list.map((item, index) => ({
          ...item,
          position: index + 1,
          status: index < maxPlayers ? "confirmed" : "waiting",
        }));

        setAttendanceList(listWithStatus);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [matchId, maxPlayers]);

  /**
   * Adiciona usuário atual à lista
   */
  const joinMatch = useCallback(async () => {
    if (!user || !matchId || userInList) return;

    setIsJoining(true);
    try {
      await attendanceService.addUserToMatch(matchId, user.id);

      toast({
        title: "Presença confirmada!",
        description: "Você foi adicionado à lista da pelada",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      const message =
        error.message === "Usuário já está na lista"
          ? "Você já está confirmado nesta pelada"
          : "Não foi possível confirmar sua presença";

      toast({
        title: "Erro ao confirmar",
        description: message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsJoining(false);
    }
  }, [user, matchId, userInList, toast]);

  /**
   * Remove usuário atual da lista
   */
  const leaveMatch = useCallback(async () => {
    if (!user || !matchId || !userInList) return;

    setIsLeaving(true);
    try {
      await attendanceService.removeUserFromMatch(matchId, user.id);

      toast({
        title: "Saiu da lista",
        description: "Você foi removido da lista da pelada",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Não foi possível sair da lista",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLeaving(false);
    }
  }, [user, matchId, userInList, toast]);

  /**
   * Remove outro usuário da lista (apenas para admins)
   */
  const removeUser = useCallback(
    async (userId) => {
      if (!user || !matchId) return;

      try {
        await attendanceService.removeUserFromMatch(matchId, userId);

        toast({
          title: "Jogador removido",
          description: "O jogador foi removido da lista",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Erro ao remover",
          description: "Não foi possível remover o jogador",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    },
    [user, matchId, toast]
  );

  return {
    // Estados
    attendanceList,
    loading,
    isJoining,
    isLeaving,

    // Estados derivados
    userInList,
    isListFull,
    confirmedCount,
    waitingCount,

    // Ações
    joinMatch,
    leaveMatch,
    removeUser,

    // Verificações
    canJoin: !userInList && !isListFull,
    canLeave: !!userInList,
    isUserAdmin: userService.isAdmin(user),
  };
};
