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
  const [generationSeed, setGenerationSeed] = useState(0);

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

        // Se não há divisão, mostrar formulário de criação automaticamente apenas para admins
        if (!divisionData && confirmedPlayers.length > 0 && isAdmin) {
          setShowCreateForm(true);
        } else {
          setShowCreateForm(false);
        }
      }
    );

    return unsubscribe;
  }, [matchId, confirmedPlayers.length, isAdmin]);

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
   * Verifica se o usuário pode criar uma nova divisão
   */
  const canCreateDivision = useCallback(() => {
    if (!user) return false;
    return isAdmin;
  }, [user, isAdmin]);

  /**
   * Shuffle array usando Fisher-Yates com seed para consistência
   */
  const shuffleWithSeed = useCallback((array, seed) => {
    const shuffled = [...array];
    let random = seed;

    for (let i = shuffled.length - 1; i > 0; i--) {
      random = (random * 9301 + 49297) % 233280;
      const j = Math.floor((random / 233280) * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled;
  }, []);

  /**
   * Agrupa jogadores por posição
   */
  const groupPlayersByPosition = useCallback((players) => {
    const positions = {
      Goleiro: [],
      Defesa: [],
      "Meio-Campo": [],
      Ataque: [],
      Lateral: [],
    };

    players.forEach((player) => {
      const playerPositions = player.userData?.playing_positions || [];

      // Se o jogador tem múltiplas posições, prioritiza na seguinte ordem:
      // Goleiro > Defesa > Meio-Campo > Ataque > Lateral
      const priorityOrder = [
        "Goleiro",
        "Defesa",
        "Meio-Campo",
        "Ataque",
        "Lateral",
      ];

      let assignedPosition = null;
      for (const priority of priorityOrder) {
        if (playerPositions.includes(priority)) {
          assignedPosition = priority;
          break;
        }
      }

      // Se não tem posição definida, coloca como Meio-Campo (posição versátil)
      if (!assignedPosition) {
        assignedPosition = "Meio-Campo";
      }

      positions[assignedPosition].push(player);
    });

    return positions;
  }, []);

  /**
   * Distribui jogadores de uma posição entre os times de forma balanceada
   */
  const distributePositionPlayers = useCallback(
    (players, teamBlack, teamWhite, seed) => {
      if (players.length === 0) return;

      // Ordena por score e adiciona pequena variação baseada no seed
      const sortedPlayers = players.sort((a, b) => {
        const scoreA = a.userData?.score || 0;
        const scoreB = b.userData?.score || 0;

        // Se scores são muito próximos (diferença <= 5), adiciona randomização
        if (Math.abs(scoreA - scoreB) <= 5) {
          const hashA = (a.userId.charCodeAt(0) * seed) % 100;
          const hashB = (b.userId.charCodeAt(0) * seed) % 100;
          return hashB - hashA;
        }

        return scoreB - scoreA;
      });

      // Cria pares de jogadores com scores similares quando possível
      const pairs = [];
      const remaining = [];

      for (let i = 0; i < sortedPlayers.length - 1; i += 2) {
        const player1 = sortedPlayers[i];
        const player2 = sortedPlayers[i + 1];

        const score1 = player1.userData?.score || 0;
        const score2 = player2.userData?.score || 0;

        // Se a diferença de score é pequena, forma um par
        if (Math.abs(score1 - score2) <= 10) {
          pairs.push([player1, player2]);
        } else {
          remaining.push(player1);
          remaining.push(player2);
        }
      }

      // Se sobrou um jogador ímpar
      if (sortedPlayers.length % 2 === 1) {
        remaining.push(sortedPlayers[sortedPlayers.length - 1]);
      }

      // Distribui os pares alternadamente entre os times
      pairs.forEach((pair, index) => {
        if ((index + seed) % 2 === 0) {
          teamBlack.push(pair[0].userId);
          teamWhite.push(pair[1].userId);
        } else {
          teamWhite.push(pair[0].userId);
          teamBlack.push(pair[1].userId);
        }
      });

      // Distribui jogadores restantes baseado no balanceamento dos times
      remaining.forEach((player) => {
        const blackCount = teamBlack.length;
        const whiteCount = teamWhite.length;

        // Calcula score atual dos times
        const blackScore = teamBlack.reduce((sum, playerId) => {
          const p = confirmedPlayers.find((cp) => cp.userId === playerId);
          return sum + (p?.userData?.score || 0);
        }, 0);

        const whiteScore = teamWhite.reduce((sum, playerId) => {
          const p = confirmedPlayers.find((cp) => cp.userId === playerId);
          return sum + (p?.userData?.score || 0);
        }, 0);

        const playerScore = player.userData?.score || 0;

        // Decide onde colocar baseado no balanceamento
        if (blackCount < whiteCount) {
          teamBlack.push(player.userId);
        } else if (whiteCount < blackCount) {
          teamWhite.push(player.userId);
        } else {
          // Times iguais, decide por score
          const diffBlack = Math.abs(blackScore + playerScore - whiteScore);
          const diffWhite = Math.abs(blackScore - (whiteScore + playerScore));

          if (diffBlack <= diffWhite) {
            teamBlack.push(player.userId);
          } else {
            teamWhite.push(player.userId);
          }
        }
      });
    },
    [confirmedPlayers]
  );

  /**
   * Gera divisão automática balanceada por posições
   */
  const generateBalancedDivision = useCallback(() => {
    if (confirmedPlayers.length === 0) return { teamBlack: [], teamWhite: [] };

    // Incrementa o seed para gerar variações diferentes
    const currentSeed = generationSeed + 1;
    setGenerationSeed(currentSeed);

    const teamBlack = [];
    const teamWhite = [];

    // Agrupa jogadores por posição
    const playersByPosition = groupPlayersByPosition(confirmedPlayers);

    // Distribui jogadores por posição, priorizando goleiros
    const positionOrder = [
      "Goleiro",
      "Defesa",
      "Meio-Campo",
      "Ataque",
      "Lateral",
    ];

    positionOrder.forEach((position) => {
      const positionPlayers = playersByPosition[position];

      if (position === "Goleiro") {
        // Tratamento especial para goleiros - sempre um para cada lado se possível
        if (positionPlayers.length >= 2) {
          const shuffledGK = shuffleWithSeed(positionPlayers, currentSeed);
          teamBlack.push(shuffledGK[0].userId);
          teamWhite.push(shuffledGK[1].userId);

          // Distribui goleiros extras alternadamente
          for (let i = 2; i < shuffledGK.length; i++) {
            if (teamBlack.length <= teamWhite.length) {
              teamBlack.push(shuffledGK[i].userId);
            } else {
              teamWhite.push(shuffledGK[i].userId);
            }
          }
        } else if (positionPlayers.length === 1) {
          // Um goleiro só - coloca no time preto por padrão
          teamBlack.push(positionPlayers[0].userId);
        }
      } else {
        // Distribui outras posições de forma balanceada
        distributePositionPlayers(
          positionPlayers,
          teamBlack,
          teamWhite,
          currentSeed
        );
      }
    });

    return { teamBlack, teamWhite };
  }, [
    confirmedPlayers,
    generationSeed,
    groupPlayersByPosition,
    distributePositionPlayers,
    shuffleWithSeed,
  ]);

  /**
   * Reseta o seed de geração para voltar às primeiras variações
   */
  const resetGenerationSeed = useCallback(() => {
    setGenerationSeed(0);
  }, []);

  /**
   * Controla a exibição do formulário de criação
   */
  const toggleCreateForm = useCallback(
    (show) => {
      // Se está tentando mostrar o formulário, verificar permissões
      if (show) {
        // Se há divisão existente, verificar se pode editar
        if (division && !canEditDivision()) {
          return;
        }
        // Se não há divisão, verificar se pode criar
        if (!division && !canCreateDivision()) {
          return;
        }
      }
      setShowCreateForm(show);
    },
    [division, canEditDivision, canCreateDivision]
  );

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
    resetGenerationSeed,
    canCreateDivision,
  };
};
