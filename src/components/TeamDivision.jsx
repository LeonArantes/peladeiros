import React, { useState } from "react";
import {
  VStack,
  HStack,
  Text,
  Box,
  Grid,
  GridItem,
  Button,
  Badge,
  Card,
  CardBody,
  CardHeader,
  Spinner,
  Center,
  Icon,
  Flex,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  IconButton,
  Divider,
  Image,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiPlus,
  FiTrash2,
  FiShuffle,
  FiCheck,
  FiX,
  FiEdit3,
  FiCircle,
} from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTeamDivision } from "../hooks/useTeamDivision";
import userService from "../services/userService";

// Importar escudos dos times
import teamBlackShield from "../assets/images/team_black.jpg";
import teamWhiteShield from "../assets/images/team_white.jpg";

/**
 * Componente principal para divisão de times
 */
const TeamDivision = ({ match, attendanceList }) => {
  const {
    division,
    loading,
    creating,
    showCreateForm,
    confirmedPlayers,
    hasDivision,
    createDivision,
    deleteDivision,
    toggleCreateForm,
    canEditDivision,
    generateBalancedDivision,
  } = useTeamDivision(match, attendanceList);

  if (loading) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Spinner color="black" />
          <Text color="gray.600">Carregando escalação...</Text>
        </VStack>
      </Center>
    );
  }

  if (confirmedPlayers.length === 0) {
    return (
      <Center py={8}>
        <VStack spacing={4}>
          <Icon as={FiUsers} boxSize={12} color="gray.400" />
          <Text fontSize="lg" color="gray.500" textAlign="center">
            Nenhum jogador confirmado
          </Text>
          <Text fontSize="sm" color="gray.400" textAlign="center">
            Aguarde jogadores confirmarem presença para criar a escalação
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch" p={0}>
      <Flex justify="space-between" align="center" p={0}>
        {hasDivision && !showCreateForm && canEditDivision() && (
          <HStack spacing={2}>
            <Button
              leftIcon={<FiEdit3 />}
              variant="outline"
              size="sm"
              onClick={() => toggleCreateForm(true)}
            >
              Editar
            </Button>
            <DeleteButton onDelete={deleteDivision} />
          </HStack>
        )}

        {!hasDivision && !showCreateForm && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="green"
            size="sm"
            onClick={() => toggleCreateForm(true)}
          >
            Criar Escalação
          </Button>
        )}
      </Flex>

      {/* Exibir divisão existente */}
      {hasDivision && !showCreateForm && (
        <DivisionDisplay division={division} />
      )}

      {/* Formulário de Criação/Edição */}
      {showCreateForm && (
        <CreateDivisionForm
          confirmedPlayers={confirmedPlayers}
          onCreateDivision={createDivision}
          onCancel={() => toggleCreateForm(false)}
          generateBalancedDivision={generateBalancedDivision}
          creating={creating}
          existingDivision={division}
        />
      )}

      {/* Estado vazio */}
      {!hasDivision && !showCreateForm && (
        <Center py={8}>
          <VStack spacing={4}>
            <Icon as={FiShuffle} boxSize={10} color="gray.400" />
            <Text color="gray.500" textAlign="center">
              Nenhuma escalação criada ainda
            </Text>
            <Text fontSize="sm" color="gray.400" textAlign="center">
              Crie a divisão dos times para organizar a partida
            </Text>
          </VStack>
        </Center>
      )}
    </VStack>
  );
};

/**
 * Componente para exibir a divisão criada
 */
const DivisionDisplay = ({ division }) => {
  return (
    <Card variant="outline" borderColor="green.200" bg="white">
      <CardHeader pb={2}>
        <Flex justify="space-between" align="center">
          <HStack spacing={2}>
            <Badge colorScheme="green" variant="solid">
              ESCALAÇÃO OFICIAL
            </Badge>
            <Text fontSize="sm" color="gray.600">
              por {division.creatorData?.name || "Usuário"}
            </Text>
          </HStack>

          <Text fontSize="xs" color="gray.500">
            {format(
              division.updatedAt || division.createdAt,
              "dd/MM/yyyy HH:mm",
              {
                locale: ptBR,
              }
            )}
          </Text>
        </Flex>
      </CardHeader>

      <CardBody pt={0}>
        <TeamsDisplay
          teamBlack={division.teamBlackData}
          teamWhite={division.teamWhiteData}
        />
      </CardBody>
    </Card>
  );
};

/**
 * Componente para exibir os times lado a lado
 */
const TeamsDisplay = ({ teamBlack, teamWhite }) => {
  return (
    <Grid templateColumns="1fr" gap={4} w="full">
      {/* Time Preto */}
      <GridItem>
        <VStack spacing={3}>
          <Box
            bg="white"
            color="gray.800"
            py={3}
            px={4}
            borderRadius="md"
            w="full"
            textAlign="center"
            position="relative"
          >
            <HStack justify="center" spacing={3}>
              <Image
                src={teamBlackShield}
                alt="Escudo Time Preto"
                objectFit="contain"
                w="24px"
              />
              <VStack spacing={0}>
                <Text fontWeight="bold" fontSize="lg">
                  TIME PRETO
                </Text>
                <Text fontSize="sm">{teamBlack.length} jogadores</Text>
              </VStack>
            </HStack>
          </Box>

          <VStack spacing={2} w="full">
            {teamBlack.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={index + 1}
                color="blackAlpha"
              />
            ))}
          </VStack>
        </VStack>
      </GridItem>
      <Divider orientation="vertical" />
      {/* Time Branco */}
      <GridItem>
        <VStack spacing={3}>
          <Box
            bg="white"
            color="gray.800"
            py={3}
            px={4}
            borderRadius="md"
            w="full"
            textAlign="center"
            position="relative"
          >
            <HStack justify="center" spacing={3}>
              <Image
                src={teamWhiteShield}
                alt="Escudo Time Branco"
                objectFit="contain"
                w="24px"
              />
              <VStack spacing={0}>
                <Text fontWeight="bold" fontSize="lg">
                  TIME BRANCO
                </Text>
                <Text fontSize="sm">{teamWhite.length} jogadores</Text>
              </VStack>
            </HStack>
          </Box>

          <VStack spacing={2} w="full">
            {teamWhite.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={index + 1}
                color="white"
              />
            ))}
          </VStack>
        </VStack>
      </GridItem>
    </Grid>
  );
};

/**
 * Card individual do jogador
 */
const PlayerCard = ({ player, position, color }) => {
  const formatPositions = (positions) => {
    if (!positions || positions.length === 0) return "Não informado";
    return positions.join(", ");
  };

  return (
    <Box
      bg={color === "white" ? "white" : "black"}
      border="1px solid"
      borderColor={color === "white" ? "gray.800" : "black"}
      p={3}
      borderRadius="md"
      w="full"
      boxShadow="sm"
    >
      <HStack spacing={3} justify="space-between">
        <VStack spacing={1} align="start" flex={1}>
          <Text
            fontSize="sm"
            fontWeight="medium"
            color={color === "white" ? "gray.800" : "white"}
          >
            {player.name}
          </Text>
          <Text
            fontSize="xs"
            color={color === "white" ? "gray.600" : "gray.300"}
          >
            {formatPositions(player.playing_positions)}
          </Text>
          <HStack spacing={2}>
            <Badge
              size="sm"
              colorScheme={color === "white" ? "blue" : "orange"}
              variant="solid"
            >
              Score: {player.score || 0}
            </Badge>
          </HStack>
        </VStack>
        <Text
          fontSize="xs"
          color={color === "white" ? "gray.800" : "white"}
          fontWeight="bold"
        >
          #{position}
        </Text>
      </HStack>
    </Box>
  );
};

/**
 * Formulário para criar/editar divisão
 */
const CreateDivisionForm = ({
  confirmedPlayers,
  onCreateDivision,
  onCancel,
  generateBalancedDivision,
  creating,
  existingDivision,
}) => {
  const [teamBlack, setTeamBlack] = useState(existingDivision?.teamBlack || []);
  const [teamWhite, setTeamWhite] = useState(existingDivision?.teamWhite || []);

  const isEditing = !!existingDivision;

  const handleGenerateBalanced = () => {
    const balanced = generateBalancedDivision();
    setTeamBlack(balanced.teamBlack);
    setTeamWhite(balanced.teamWhite);
  };

  const handlePlayerMove = (playerId, fromTeam, toTeam) => {
    if (fromTeam === "black") {
      setTeamBlack((prev) => prev.filter((id) => id !== playerId));
      if (toTeam === "white") {
        setTeamWhite((prev) => [...prev, playerId]);
      }
    } else if (fromTeam === "white") {
      setTeamWhite((prev) => prev.filter((id) => id !== playerId));
      if (toTeam === "black") {
        setTeamBlack((prev) => [...prev, playerId]);
      }
    } else {
      // Adicionar de "available"
      if (toTeam === "black") {
        setTeamBlack((prev) => [...prev, playerId]);
      } else {
        setTeamWhite((prev) => [...prev, playerId]);
      }
    }
  };

  const handleSubmit = () => {
    onCreateDivision(teamBlack, teamWhite);
  };

  const getAvailablePlayers = () => {
    const assignedPlayers = [...teamBlack, ...teamWhite];
    return confirmedPlayers.filter(
      (player) => !assignedPlayers.includes(player.userId)
    );
  };

  return (
    <Card
      variant="outline"
      p={0}
      borderRadius="none"
      m={0}
      spacing={0}
      border="none"
      shadow="none"
    >
      <CardHeader p={0}>
        <Flex justify="space-between" align="center" p={0}>
          <Text fontSize="md" fontWeight="semibold">
            {isEditing ? "Editar Escalação" : "Criar Escalação"}
          </Text>
          <HStack spacing={2}>
            <Button
              leftIcon={<FiShuffle />}
              size="sm"
              variant="outline"
              onClick={handleGenerateBalanced}
            >
              Gerar Automático
            </Button>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody p={0} border="none">
        <VStack spacing={4}>
          {/* Exibir times em criação */}
          <CreateTeamsDisplay
            teamBlack={teamBlack}
            teamWhite={teamWhite}
            availablePlayers={getAvailablePlayers()}
            confirmedPlayers={confirmedPlayers}
            onPlayerMove={handlePlayerMove}
          />

          {/* Botões de ação */}
          <HStack spacing={4} w="full" justify="center">
            <Button
              leftIcon={<FiCheck />}
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={creating}
              loadingText={isEditing ? "Salvando..." : "Criando..."}
              isDisabled={teamBlack.length === 0 || teamWhite.length === 0}
            >
              {isEditing ? "Salvar" : "Criar"}
            </Button>
            <Button leftIcon={<FiX />} variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );
};

/**
 * Componente para criar divisão
 */
const CreateTeamsDisplay = ({
  teamBlack,
  teamWhite,
  availablePlayers,
  confirmedPlayers,
  onPlayerMove,
}) => {
  const getPlayerData = (playerId) => {
    return confirmedPlayers.find((p) => p.userId === playerId);
  };

  return (
    <VStack spacing={4} w="full" p={0} pt={4}>
      {/* Jogadores disponíveis */}
      {availablePlayers.length > 0 && (
        <Box w="full">
          <Text fontSize="sm" fontWeight="medium" mb={2} color="gray.700">
            Jogadores Disponíveis ({availablePlayers.length})
          </Text>
          <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={2}>
            {availablePlayers.map((player) => (
              <DraggablePlayer
                key={player.userId}
                player={player}
                onMoveToBlack={() =>
                  onPlayerMove(player.userId, "available", "black")
                }
                onMoveToWhite={() =>
                  onPlayerMove(player.userId, "available", "white")
                }
              />
            ))}
          </Grid>
        </Box>
      )}

      {/* Times sendo criados */}
      <Grid templateColumns="1fr" gap={5} w="full">
        <GridItem>
          <VStack spacing={2}>
            <HStack spacing={2} align="center">
              <Image
                src={teamBlackShield}
                alt="Escudo Time Preto"
                objectFit="contain"
                w="24px"
              />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                TIME PRETO ({teamBlack.length})
              </Text>
            </HStack>
            <Box
              minH="48px"
              p={3}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="md"
              w="full"
            >
              <VStack spacing={2}>
                {teamBlack.map((playerId) => {
                  const player = getPlayerData(playerId);
                  return player ? (
                    <AssignedPlayer
                      key={playerId}
                      player={player}
                      onRemove={() => onPlayerMove(playerId, "black", null)}
                      onMoveToOtherTeam={() =>
                        onPlayerMove(playerId, "black", "white")
                      }
                      color="black"
                    />
                  ) : null;
                })}
              </VStack>
            </Box>
          </VStack>
        </GridItem>

        <GridItem>
          <VStack spacing={2}>
            <HStack spacing={2} align="center">
              <Image
                src={teamWhiteShield}
                alt="Escudo Time Branco"
                objectFit="contain"
                w="24px"
              />
              <Text fontSize="sm" fontWeight="medium" color="gray.700">
                TIME BRANCO ({teamWhite.length})
              </Text>
            </HStack>
            <Box
              minH="48px"
              p={3}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="md"
              w="full"
            >
              <VStack spacing={2}>
                {teamWhite.map((playerId) => {
                  const player = getPlayerData(playerId);
                  return player ? (
                    <AssignedPlayer
                      key={playerId}
                      player={player}
                      onRemove={() => onPlayerMove(playerId, "white", null)}
                      onMoveToOtherTeam={() =>
                        onPlayerMove(playerId, "white", "black")
                      }
                    />
                  ) : null;
                })}
              </VStack>
            </Box>
          </VStack>
        </GridItem>
      </Grid>
    </VStack>
  );
};

/**
 * Jogador disponível para ser adicionado
 */
const DraggablePlayer = ({ player, onMoveToBlack, onMoveToWhite }) => {
  const formatPositions = (positions) => {
    if (!positions || positions.length === 0) return "Não informado";
    return positions.join(", ");
  };

  return (
    <Box
      bg="white"
      border="1px solid"
      borderColor="gray.200"
      p={3}
      borderRadius="md"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
    >
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <VStack spacing={0} align="start" flex={1}>
            <Text fontSize="sm" fontWeight="medium">
              {player.userData?.name}
            </Text>
            <Text fontSize="xs" color="gray.600">
              {formatPositions(player.userData?.playing_positions)}
            </Text>
          </VStack>
          <Badge size="sm" colorScheme="blue" variant="solid">
            {player.userData?.score || 0}
          </Badge>
        </HStack>
        <HStack spacing={1} justify="center">
          <IconButton
            icon={
              <Box
                w="14px"
                h="14px"
                bg="gray.800"
                borderRadius="full"
                border="1px solid white"
              />
            }
            size="xs"
            variant="outline"
            onClick={onMoveToBlack}
            title="Adicionar ao Time Preto"
            _hover={{ bg: "gray.100" }}
          />
          <IconButton
            icon={
              <Box
                w="14px"
                h="14px"
                bg="white"
                borderRadius="full"
                border="2px solid"
                borderColor="gray.800"
              />
            }
            size="xs"
            variant="outline"
            onClick={onMoveToWhite}
            title="Adicionar ao Time Branco"
            _hover={{ bg: "gray.100" }}
          />
        </HStack>
      </VStack>
    </Box>
  );
};

/**
 * Jogador já atribuído a um time
 */
const AssignedPlayer = ({ player, onRemove, onMoveToOtherTeam, color }) => {
  const formatPositions = (positions) => {
    if (!positions || positions.length === 0) return "Não informado";
    return positions.join(", ");
  };

  return (
    <Box
      bg={color !== "black" ? "white" : "black"}
      border="1px solid"
      borderColor={color !== "black" ? "gray.800" : "black"}
      p={3}
      borderRadius="md"
      color={color !== "black" ? "gray.800" : "white"}
      w="full"
    >
      <HStack justify="space-between" align="start">
        <VStack spacing={1} align="start" flex={1}>
          <Text fontSize="sm" fontWeight="medium">
            {player.userData?.name}
          </Text>
          <Text
            fontSize="xs"
            color={color !== "black" ? "gray.600" : "gray.300"}
          >
            {formatPositions(player.userData?.playing_positions)}
          </Text>
          <Badge
            size="sm"
            colorScheme={color !== "black" ? "blue" : "orange"}
            variant="solid"
          >
            Score: {player.userData?.score || 0}
          </Badge>
        </VStack>
        <HStack spacing={1}>
          <IconButton
            icon={
              <FiShuffle color={color !== "black" ? "gray.800" : "white"} />
            }
            size="xs"
            variant="ghost"
            onClick={onMoveToOtherTeam}
            title="Trocar de time"
            _hover={{ bg: color !== "black" ? "white" : "black" }}
          />
          <IconButton
            icon={<FiX />}
            size="xs"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            title="Remover do time"
          />
        </HStack>
      </HStack>
    </Box>
  );
};

/**
 * Botão de deletar com confirmação
 */
const DeleteButton = ({ onDelete }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <>
      <IconButton
        icon={<FiTrash2 />}
        size="sm"
        variant="outline"
        colorScheme="red"
        onClick={onOpen}
        title="Remover escalação"
      />

      <AlertDialog isOpen={isOpen} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Remover Escalação</AlertDialogHeader>
            <AlertDialogBody>
              Tem certeza que deseja remover a escalação? Esta ação não pode ser
              desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose}>Cancelar</Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Remover
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default TeamDivision;
