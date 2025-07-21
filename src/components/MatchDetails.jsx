import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Heading,
  Divider,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Select,
  RadioGroup,
  Radio,
  Stack,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Image,
  Spinner,
  Center,
  Icon,
} from "@chakra-ui/react";
import {
  FiPlus,
  FiTrash2,
  FiTarget,
  FiUsers,
  FiEdit,
  FiSave,
  FiCheck,
  FiFlag,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import userService from "../services/userService";
import goalService from "../services/goalService";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../config/firebase";

// Importar escudos dos times
import teamBlackShield from "../assets/images/team_black.jpg";
import teamWhiteShield from "../assets/images/team_white.jpg";

const MatchDetails = ({ match, division, onMatchUpdate }) => {
  const { user } = useAuth();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();
  const {
    isOpen: isFinishOpen,
    onOpen: onFinishOpen,
    onClose: onFinishClose,
  } = useDisclosure();

  // Estados
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finishingMatch, setFinishingMatch] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("black");
  const [goalType, setGoalType] = useState("favor"); // favor ou contra
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [showAllPlayers, setShowAllPlayers] = useState(false); // Novo estado para mostrar todos os jogadores

  // Verificar se é admin
  const isAdmin = userService.isAdmin(user);

  // Carregar gols do Firebase quando o componente monta
  useEffect(() => {
    const fetchGoals = async () => {
      if (!match?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const matchGoals = await goalService.findByMatchId(match.id);
        setGoals(matchGoals);
      } catch (error) {
        console.error("Erro ao carregar gols:", error);
        toast({
          title: "Erro ao carregar gols",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [match?.id, toast]);

  // Calcular placar baseado nos gols
  const calculateScore = () => {
    let blackScore = 0;
    let whiteScore = 0;

    goals.forEach((goal) => {
      if (goal.team === "black") {
        if (goal.type === "favor") {
          blackScore++;
        } else {
          whiteScore++; // Gol contra do time preto conta para o branco
        }
      } else {
        if (goal.type === "favor") {
          whiteScore++;
        } else {
          blackScore++; // Gol contra do time branco conta para o preto
        }
      }
    });

    return { blackScore, whiteScore };
  };

  // Obter jogadores do time selecionado ou todos os jogadores
  const getAvailablePlayers = () => {
    if (!division) return [];

    if (showAllPlayers) {
      // Retornar todos os jogadores de ambos os times, ordenados por time original
      const allPlayers = [
        ...(division.teamBlackData || []).map((player) => ({
          ...player,
          originalTeam: "black",
        })),
        ...(division.teamWhiteData || []).map((player) => ({
          ...player,
          originalTeam: "white",
        })),
      ];

      // Ordenar por time original (preto primeiro, depois branco) e depois por nome
      return allPlayers.sort((a, b) => {
        if (a.originalTeam !== b.originalTeam) {
          return a.originalTeam === "black" ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
    } else {
      // Retornar apenas jogadores do time selecionado, ordenados por nome
      const teamPlayers =
        selectedTeam === "black"
          ? (division.teamBlackData || []).map((player) => ({
              ...player,
              originalTeam: "black",
            }))
          : (division.teamWhiteData || []).map((player) => ({
              ...player,
              originalTeam: "white",
            }));

      return teamPlayers.sort((a, b) => a.name.localeCompare(b.name));
    }
  };

  // Função auxiliar para obter jogadores do time (mantida para compatibilidade)
  const getTeamPlayers = (team) => {
    if (!division) return [];

    if (team === "black") {
      return division.teamBlackData || [];
    } else {
      return division.teamWhiteData || [];
    }
  };

  // Adicionar gol
  const addGoal = async () => {
    if (!selectedPlayer) {
      toast({
        title: "Selecione um jogador",
        description: "É necessário selecionar o jogador que fez o gol.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const playerData = [
      ...(division?.teamBlackData || []),
      ...(division?.teamWhiteData || []),
    ].find((p) => p.id === selectedPlayer);

    const goalData = {
      matchId: match?.id,
      playerId: selectedPlayer,
      playerName: playerData?.name || "Jogador",
      team: selectedTeam,
      type: goalType,
    };

    try {
      setSaving(true);
      const createdGoal = await goalService.create(goalData);

      // Adicionar o gol criado à lista local
      setGoals((prevGoals) => [...prevGoals, createdGoal]);

      // Resetar formulário
      setSelectedPlayer("");
      setGoalType("favor");
      setShowAllPlayers(false);
      onClose();

      toast({
        title: "Gol registrado!",
        description: `Gol ${goalType === "favor" ? "a favor" : "contra"} de ${
          playerData?.name
        } adicionado ao ${
          selectedTeam === "black" ? "Time Preto" : "Time Branco"
        }.`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao salvar gol:", error);
      toast({
        title: "Erro ao registrar gol",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para fechar modal e resetar estados
  const handleCloseModal = () => {
    setSelectedPlayer("");
    setGoalType("favor");
    setShowAllPlayers(false);
    onClose();
  };

  // Remover gol
  const removeGoal = async (goalId) => {
    try {
      setSaving(true);
      await goalService.delete(goalId);

      // Remover o gol da lista local
      setGoals((prevGoals) => prevGoals.filter((goal) => goal.id !== goalId));
      onDeleteClose();

      toast({
        title: "Gol removido",
        description: "O gol foi removido da partida.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao remover gol:", error);
      toast({
        title: "Erro ao remover gol",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setSaving(false);
    }
  };

  // Confirmar remoção
  const confirmDelete = (goal) => {
    setGoalToDelete(goal);
    onDeleteOpen();
  };

  // Finalizar partida
  const finishMatch = async () => {
    try {
      setFinishingMatch(true);

      await updateDoc(doc(db, "match", match.id), {
        status: "Finalizada",
      });

      // Atualizar o estado local da partida se callback foi fornecido
      if (onMatchUpdate) {
        onMatchUpdate({
          ...match,
          status: "Finalizada",
        });
      }

      onFinishClose();

      toast({
        title: "Partida finalizada!",
        description: "A pelada foi marcada como finalizada com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erro ao finalizar partida:", error);
      toast({
        title: "Erro ao finalizar partida",
        description: "Não foi possível finalizar a partida. Tente novamente.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setFinishingMatch(false);
    }
  };

  // Confirmar finalização da partida
  const confirmFinishMatch = () => {
    onFinishOpen();
  };

  // Filtrar gols por time
  const getGoalsByTeam = (team) => {
    return goals.filter((goal) => goal.team === team);
  };

  const { blackScore, whiteScore } = calculateScore();

  // Se não há divisão, mostrar mensagem
  if (!division) {
    return (
      <Box textAlign="center" py={8}>
        <VStack spacing={4}>
          <Icon as={FiUsers} boxSize={12} color="gray.400" />
          <Text color="gray.500" fontSize="lg">
            Crie a divisão dos times primeiro
          </Text>
          <Text color="gray.400" fontSize="sm">
            Para registrar o placar é necessário ter os times definidos
          </Text>
        </VStack>
      </Box>
    );
  }

  // Se não há match ID, mostrar erro
  if (!match?.id) {
    return (
      <Box textAlign="center" py={8}>
        <VStack spacing={4}>
          <FiTarget size={48} color="gray.400" />
          <Text color="gray.500" fontSize="lg">
            Informações da partida não encontradas
          </Text>
          <Text color="gray.400" fontSize="sm">
            Não é possível carregar os gols sem as informações da partida
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header com placar */}
      <Card>
        <CardHeader>
          <HStack justify="space-between" align="center">
            <Heading size="md">Placar da Partida</Heading>
            <HStack spacing={3}>
              {isAdmin && (
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="green"
                  size="sm"
                  onClick={onOpen}
                  isDisabled={saving || finishingMatch}
                >
                  Adicionar Gol
                </Button>
              )}
              {isAdmin && match?.status !== "Finalizada" && (
                <Button
                  leftIcon={<FiFlag />}
                  colorScheme="orange"
                  size="sm"
                  onClick={confirmFinishMatch}
                  isLoading={finishingMatch}
                  isDisabled={saving || finishingMatch}
                >
                  Finalizar Partida
                </Button>
              )}
            </HStack>
          </HStack>

          {/* Mostrar status da partida se finalizada */}
          {match?.status === "Finalizada" && (
            <Box mt={3}>
              <Badge
                colorScheme="orange"
                variant="solid"
                p={2}
                borderRadius="md"
              >
                <HStack spacing={2}>
                  <FiCheck />
                  <Text fontSize="sm">Partida Finalizada</Text>
                </HStack>
              </Badge>
            </Box>
          )}
        </CardHeader>
        <CardBody>
          <Grid templateColumns="1fr auto 1fr" gap={4} alignItems="center">
            {/* Time Preto */}
            <VStack>
              <HStack spacing={3}>
                <Image
                  src={teamBlackShield}
                  alt="Time Preto"
                  w="32px"
                  h="32px"
                  objectFit="contain"
                />
                <Text fontWeight="bold" fontSize="lg">
                  TIME PRETO
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                {blackScore}
              </Text>
            </VStack>

            {/* VS */}
            <Text fontSize="2xl" fontWeight="bold" color="gray.400">
              X
            </Text>

            {/* Time Branco */}
            <VStack>
              <HStack spacing={3}>
                <Image
                  src={teamWhiteShield}
                  alt="Time Branco"
                  w="32px"
                  h="32px"
                  objectFit="contain"
                />
                <Text fontWeight="bold" fontSize="lg">
                  TIME BRANCO
                </Text>
              </HStack>
              <Text fontSize="3xl" fontWeight="bold" color="gray.800">
                {whiteScore}
              </Text>
            </VStack>
          </Grid>
        </CardBody>
      </Card>

      {/* Lista de gols */}
      {loading ? (
        <Center py={8}>
          <VStack spacing={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.500">Carregando gols da partida...</Text>
          </VStack>
        </Center>
      ) : goals.length > 0 ? (
        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr" }} gap={6}>
          {/* Gols Time Preto */}
          <Card>
            <CardHeader>
              <HStack spacing={3}>
                <Image
                  src={teamBlackShield}
                  alt="Time Preto"
                  w="24px"
                  h="24px"
                  objectFit="contain"
                />
                <Heading size="sm">Gols Time Preto</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {getGoalsByTeam("black").length === 0 ? (
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Nenhum gol registrado
                  </Text>
                ) : (
                  getGoalsByTeam("black").map((goal) => (
                    <HStack
                      key={goal.id}
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{goal.playerName}</Text>
                        <Badge
                          colorScheme={goal.type === "favor" ? "green" : "red"}
                          size="sm"
                        >
                          {goal.type === "favor" ? "A favor" : "Gol contra"}
                        </Badge>
                      </VStack>
                      {isAdmin && (
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(goal)}
                          isLoading={saving}
                          isDisabled={saving}
                        />
                      )}
                    </HStack>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Gols Time Branco */}
          <Card>
            <CardHeader>
              <HStack spacing={3}>
                <Image
                  src={teamWhiteShield}
                  alt="Time Branco"
                  w="24px"
                  h="24px"
                  objectFit="contain"
                />
                <Heading size="sm">Gols Time Branco</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3} align="stretch">
                {getGoalsByTeam("white").length === 0 ? (
                  <Text color="gray.500" fontSize="sm" textAlign="center">
                    Nenhum gol registrado
                  </Text>
                ) : (
                  getGoalsByTeam("white").map((goal) => (
                    <HStack
                      key={goal.id}
                      justify="space-between"
                      p={3}
                      bg="gray.50"
                      borderRadius="md"
                    >
                      <VStack align="start" spacing={0}>
                        <Text fontWeight="medium">{goal.playerName}</Text>
                        <Badge
                          colorScheme={goal.type === "favor" ? "green" : "red"}
                          size="sm"
                        >
                          {goal.type === "favor" ? "A favor" : "Gol contra"}
                        </Badge>
                      </VStack>
                      {isAdmin && (
                        <IconButton
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => confirmDelete(goal)}
                          isLoading={saving}
                          isDisabled={saving}
                        />
                      )}
                    </HStack>
                  ))
                )}
              </VStack>
            </CardBody>
          </Card>
        </Grid>
      ) : (
        <Card>
          <CardBody>
            <VStack spacing={4} py={8}>
              <FiTarget size={48} color="gray.400" />
              <Text color="gray.500" fontSize="lg">
                Nenhum gol registrado
              </Text>
              <Text color="gray.400" fontSize="sm" textAlign="center">
                {isAdmin
                  ? "Adicione gols para registrar o placar da partida"
                  : "Aguarde os administradores registrarem os gols"}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Modal para adicionar gol */}
      <Modal isOpen={isOpen} onClose={handleCloseModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Registrar Gol</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {/* Seleção do time */}
              <FormControl>
                <FormLabel>Time que marcou o gol</FormLabel>
                <RadioGroup value={selectedTeam} onChange={setSelectedTeam}>
                  <Stack direction="row" spacing={8}>
                    <Radio value="black">Time Preto</Radio>
                    <Radio value="white">Time Branco</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>

              {/* Checkbox para mostrar todos os jogadores */}
              <FormControl display="flex" alignItems="center">
                <input
                  type="checkbox"
                  id="showAllPlayers"
                  checked={showAllPlayers}
                  onChange={(e) => {
                    setShowAllPlayers(e.target.checked);
                    setSelectedPlayer(""); // Limpar seleção ao trocar
                  }}
                  style={{ marginRight: "8px" }}
                />
                <FormLabel htmlFor="showAllPlayers" mb="0" fontSize="sm">
                  Mostrar jogadores de ambos os times
                </FormLabel>
              </FormControl>

              {/* Explicação quando checkbox está marcado */}
              {showAllPlayers && (
                <Box
                  p={3}
                  bg="blue.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="blue.200"
                >
                  <Text fontSize="xs" color="blue.700">
                    <strong>Modo avançado:</strong> Use esta opção quando um
                    jogador trocou de time durante a partida. O gol será
                    registrado para o time selecionado acima, independente do
                    time original do jogador.
                  </Text>
                </Box>
              )}

              {/* Seleção do jogador */}
              <FormControl>
                <FormLabel>
                  Jogador
                  {!showAllPlayers && (
                    <Text fontSize="xs" color="gray.600" ml={1} as="span">
                      (apenas do{" "}
                      {selectedTeam === "black" ? "Time Preto" : "Time Branco"})
                    </Text>
                  )}
                </FormLabel>
                <Select
                  placeholder="Selecione o jogador"
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                >
                  {showAllPlayers ? (
                    // Renderizar com separadores quando mostrando todos os jogadores
                    <>
                      {/* Jogadores do Time Preto */}
                      {getAvailablePlayers().filter(
                        (p) => p.originalTeam === "black"
                      ).length > 0 && (
                        <>
                          <option
                            disabled
                            style={{
                              fontWeight: "bold",
                              backgroundColor: "#f7fafc",
                            }}
                          >
                            ═══ TIME PRETO ═══
                          </option>
                          {getAvailablePlayers()
                            .filter((p) => p.originalTeam === "black")
                            .map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.name}
                              </option>
                            ))}
                        </>
                      )}

                      {/* Jogadores do Time Branco */}
                      {getAvailablePlayers().filter(
                        (p) => p.originalTeam === "white"
                      ).length > 0 && (
                        <>
                          <option
                            disabled
                            style={{
                              fontWeight: "bold",
                              backgroundColor: "#f7fafc",
                            }}
                          >
                            ═══ TIME BRANCO ═══
                          </option>
                          {getAvailablePlayers()
                            .filter((p) => p.originalTeam === "white")
                            .map((player) => (
                              <option key={player.id} value={player.id}>
                                {player.name}
                              </option>
                            ))}
                        </>
                      )}
                    </>
                  ) : (
                    // Renderizar normalmente quando mostrando apenas um time
                    getAvailablePlayers().map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name}
                      </option>
                    ))
                  )}
                </Select>

                {/* Contador de jogadores disponíveis */}
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {showAllPlayers ? (
                    <>
                      {getAvailablePlayers().length} jogadores totais (
                      {
                        getAvailablePlayers().filter(
                          (p) => p.originalTeam === "black"
                        ).length
                      }{" "}
                      do Time Preto,{" "}
                      {
                        getAvailablePlayers().filter(
                          (p) => p.originalTeam === "white"
                        ).length
                      }{" "}
                      do Time Branco)
                    </>
                  ) : (
                    <>
                      {getAvailablePlayers().length}{" "}
                      {getAvailablePlayers().length === 1
                        ? "jogador disponível"
                        : "jogadores disponíveis"}
                    </>
                  )}
                </Text>
              </FormControl>

              {/* Tipo do gol */}
              <FormControl>
                <FormLabel>Tipo do Gol</FormLabel>
                <RadioGroup value={goalType} onChange={setGoalType}>
                  <Stack spacing={4}>
                    <Radio value="favor">
                      <VStack align="start" spacing={0}>
                        <Text>Gol a favor</Text>
                        <Text fontSize="xs" color="gray.600">
                          Gol normal para o{" "}
                          {selectedTeam === "black"
                            ? "Time Preto"
                            : "Time Branco"}
                        </Text>
                      </VStack>
                    </Radio>
                    <Radio value="contra">
                      <VStack align="start" spacing={0}>
                        <Text>Gol contra</Text>
                        <Text fontSize="xs" color="gray.600">
                          Gol contra o{" "}
                          {selectedTeam === "black"
                            ? "Time Preto"
                            : "Time Branco"}{" "}
                          (conta para o adversário)
                        </Text>
                      </VStack>
                    </Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={handleCloseModal}>
              Cancelar
            </Button>
            <Button colorScheme="green" onClick={addGoal} isLoading={saving}>
              Registrar Gol
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmação para deletar */}
      <AlertDialog isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Remover Gol</AlertDialogHeader>
            <AlertDialogBody>
              Tem certeza que deseja remover o gol de{" "}
              <strong>{goalToDelete?.playerName}</strong>?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onDeleteClose} isDisabled={saving}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={() => removeGoal(goalToDelete?.id)}
                ml={3}
                isLoading={saving}
                isDisabled={saving}
              >
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Dialog de confirmação para finalizar partida */}
      <AlertDialog isOpen={isFinishOpen} onClose={onFinishClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Finalizar Partida</AlertDialogHeader>
            <AlertDialogBody>
              <VStack spacing={3} align="start">
                <Text>
                  Tem certeza que deseja marcar esta pelada como{" "}
                  <strong>finalizada</strong>?
                </Text>
                <Box
                  p={3}
                  bg="orange.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="orange.200"
                >
                  <Text fontSize="sm" color="orange.800">
                    <strong>Atenção:</strong> Mesmo após finalizada,
                    administradores ainda poderão registrar ou editar gols da
                    partida.
                  </Text>
                </Box>

                {/* Mostrar placar atual */}
                <Box p={3} bg="gray.50" borderRadius="md" w="full">
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Placar atual da partida:
                  </Text>
                  <HStack justify="center" spacing={4}>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.500">
                        TIME PRETO
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {calculateScore().blackScore}
                      </Text>
                    </VStack>
                    <Text fontSize="xl" color="gray.400">
                      X
                    </Text>
                    <VStack spacing={1}>
                      <Text fontSize="xs" color="gray.500">
                        TIME BRANCO
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold">
                        {calculateScore().whiteScore}
                      </Text>
                    </VStack>
                  </HStack>
                </Box>
              </VStack>
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onFinishClose} isDisabled={finishingMatch}>
                Cancelar
              </Button>
              <Button
                colorScheme="orange"
                onClick={finishMatch}
                ml={3}
                isLoading={finishingMatch}
                isDisabled={finishingMatch}
                leftIcon={<FiFlag />}
              >
                Finalizar Partida
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </VStack>
  );
};

export default MatchDetails;
