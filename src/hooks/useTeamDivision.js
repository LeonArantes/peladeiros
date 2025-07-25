import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";
import teamDivisionService from "../services/teamDivisionService";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";

/**
 * Hook customizado para gerenciar divisão única de times
 * Separa a lógica de negócio da interface do usuário
 */
export const useTeamDivision = (match, attendanceList = []) => {
  const { user } = useAuth();
  const toast = useToast();
  const matchId = match?.id;

  // Estados
  const [division, setDivision] = useState(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(true);

  // Estados derivados
  const isAdmin = userService.isAdmin(user);
  const confirmedPlayers = attendanceList.filter(
    (player, index) => index < match?.max_players
  );

  /**
   * Observa mudanças na divisão da partida
   */
  useEffect(() => {
    if (!matchId) return;

    const unsubscribe = teamDivisionService.observeMatchDivision(
      matchId,
      (divisionData) => {
        setDivision(divisionData);
        setLoading(false);

        // Se não há divisão, mostrar formulário de criação automaticamente
        if (!divisionData && confirmedPlayers.length > 0) {
          setShowCreateForm(true);
        } else {
          setShowCreateForm(false);
        }
      }
    );

    return unsubscribe;
  }, [matchId, confirmedPlayers.length]);

  /**
   * Cria ou atualiza a divisão de times
   */
  const createDivision = useCallback(
    async (teamBlack, teamWhite) => {
      if (!user || !matchId) return;

      // Validações
      if (teamBlack.length === 0 || teamWhite.length === 0) {
        toast({
          title: "Erro na divisão",
          description: "Ambos os times devem ter pelo menos 1 jogador",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      const totalPlayers = teamBlack.length + teamWhite.length;
      if (totalPlayers !== confirmedPlayers.length) {
        toast({
          title: "Erro na divisão",
          description: "Todos os jogadores confirmados devem estar nos times",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }

      setCreating(true);
      try {
        await teamDivisionService.createOrUpdateDivision({
          matchId,
          createdBy: user.id,
          teamBlack,
          teamWhite,
        });

        toast({
          title: division ? "Escalação atualizada!" : "Escalação criada!",
          description: division
            ? "A divisão dos times foi atualizada com sucesso"
            : "Nova escalação foi criada com sucesso",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        setShowCreateForm(false);
      } catch (error) {
        console.error("Erro ao criar/atualizar divisão:", error);
        toast({
          title: "Erro na escalação",
          description: "Não foi possível salvar a escalação",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setCreating(false);
      }
    },
    [user, matchId, confirmedPlayers.length, division, toast]
  );

  /**
   * Remove a divisão
   */
  const deleteDivision = useCallback(async () => {
    if (!user || !matchId) return;

    try {
      await teamDivisionService.deleteDivision(matchId, user.id);

      toast({
        title: "Escalação removida",
        description: "A escalação foi removida com sucesso",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setShowCreateForm(true);
    } catch (error) {
      console.error("Erro ao deletar divisão:", error);
      toast({
        title: "Erro ao remover",
        description: error.message || "Não foi possível remover a escalação",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user, matchId, toast]);

  /**
   * Verifica se o usuário pode deletar/editar uma divisão
   */
  const canEditDivision = useCallback(() => {
    if (!user || !division) return false;
    return division.createdBy === user.id || isAdmin;
  }, [user, division, isAdmin]);

  /**
   * Gera divisão automática balanceada
   */
  const generateBalancedDivision = useCallback(() => {
    if (confirmedPlayers.length === 0) return { teamBlack: [], teamWhite: [] };

    // Separar jogadores por posição
    const goalkeepers = confirmedPlayers.filter((p) =>
      p.userData?.playing_positions?.includes("Goleiro")
    );

    const fieldPlayers = confirmedPlayers.filter(
      (p) => !p.userData?.playing_positions?.includes("Goleiro")
    );

    // Ordenar jogadores por score (do maior para o menor)
    const sortedGoalkeepers = goalkeepers.sort(
      (a, b) => (b.userData?.score || 0) - (a.userData?.score || 0)
    );

    const sortedFieldPlayers = fieldPlayers.sort(
      (a, b) => (b.userData?.score || 0) - (a.userData?.score || 0)
    );

    const teamBlack = [];
    const teamWhite = [];

    // 1. Distribuir goleiros (SEMPRE um para cada lado se possível)
    if (sortedGoalkeepers.length >= 2) {
      // Se há 2 ou mais goleiros, distribui os 2 melhores
      teamBlack.push(sortedGoalkeepers[0].userId);
      teamWhite.push(sortedGoalkeepers[1].userId);

      // Se há mais goleiros, distribui alternadamente
      for (let i = 2; i < sortedGoalkeepers.length; i++) {
        if (teamBlack.length <= teamWhite.length) {
          teamBlack.push(sortedGoalkeepers[i].userId);
        } else {
          teamWhite.push(sortedGoalkeepers[i].userId);
        }
      }
    } else if (sortedGoalkeepers.length === 1) {
      // Se há apenas 1 goleiro, coloca no time com menos jogadores
      teamBlack.push(sortedGoalkeepers[0].userId);
    }

    // 2. Distribuir jogadores de linha por score balanceado
    let teamBlackScore = teamBlack.reduce((sum, playerId) => {
      const player = confirmedPlayers.find((p) => p.userId === playerId);
      return sum + (player?.userData?.score || 0);
    }, 0);

    let teamWhiteScore = teamWhite.reduce((sum, playerId) => {
      const player = confirmedPlayers.find((p) => p.userId === playerId);
      return sum + (player?.userData?.score || 0);
    }, 0);

    // Distribuir jogadores de linha tentando balancear scores
    for (const player of sortedFieldPlayers) {
      const playerScore = player.userData?.score || 0;

      // Calcular qual time ficaria mais balanceado com este jogador
      const blackScoreWithPlayer = teamBlackScore + playerScore;
      const whiteScoreWithPlayer = teamWhiteScore + playerScore;

      // Verificar também o número de jogadores
      const blackCount = teamBlack.length;
      const whiteCount = teamWhite.length;

      // Decisão de colocação baseada em:
      // 1. Diferença de jogadores (não pode ter diferença maior que 1)
      // 2. Balanceamento de score
      if (blackCount < whiteCount) {
        teamBlack.push(player.userId);
        teamBlackScore = blackScoreWithPlayer;
      } else if (whiteCount < blackCount) {
        teamWhite.push(player.userId);
        teamWhiteScore = whiteScoreWithPlayer;
      } else {
        // Times com mesmo número de jogadores, decidir por score
        const currentDiff = Math.abs(teamBlackScore - teamWhiteScore);
        const diffWithPlayerInBlack = Math.abs(
          blackScoreWithPlayer - teamWhiteScore
        );
        const diffWithPlayerInWhite = Math.abs(
          teamBlackScore - whiteScoreWithPlayer
        );

        if (diffWithPlayerInBlack <= diffWithPlayerInWhite) {
          teamBlack.push(player.userId);
          teamBlackScore = blackScoreWithPlayer;
        } else {
          teamWhite.push(player.userId);
          teamWhiteScore = whiteScoreWithPlayer;
        }
      }
    }

    return { teamBlack, teamWhite };
  }, [confirmedPlayers]);

  /**
   * Controla a exibição do formulário de criação
   */
  const toggleCreateForm = useCallback((show) => {
    setShowCreateForm(show);
  }, []);

  return {
    // Estados
    division,
    loading,
    creating,
    showCreateForm,

    // Estados derivados
    isAdmin,
    confirmedPlayers,
    hasDivision: !!division,

    // Ações
    createDivision,
    deleteDivision,
    toggleCreateForm,

    // Utilitários
    canEditDivision,
    generateBalancedDivision,
  };
};
