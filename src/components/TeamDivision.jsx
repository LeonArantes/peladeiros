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
          <Spinner color="primary.900" />
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
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.500"
            textAlign="center"
          >
            Nenhum jogador confirmado
          </Text>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            color="gray.400"
            textAlign="center"
          >
            Aguarde jogadores confirmarem presença para criar a escalação
          </Text>
        </VStack>
      </Center>
    );
  }

  return (
    <VStack spacing={{ base: 4, md: 6 }} align="stretch" p={0}>
      <Flex
        justify="space-between"
        align="center"
        p={0}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 3, sm: 0 }}
      >
        {hasDivision && !showCreateForm && canEditDivision() && (
          <HStack spacing={2}>
            <Button
              leftIcon={<FiEdit3 size={14} />}
              variant="outline"
              size={{ base: "sm", md: "md" }}
              borderColor="primary.200"
              color="primary.900"
              borderRadius="lg"
              _hover={{
                bg: "primary.50",
                borderColor: "primary.300",
              }}
              onClick={() => toggleCreateForm(true)}
            >
              Editar
            </Button>
            <DeleteButton onDelete={deleteDivision} />
          </HStack>
        )}

        {!hasDivision && !showCreateForm && (
          <Button
            leftIcon={<FiPlus size={14} />}
            bg="primary.900"
            color="white"
            size={{ base: "sm", md: "md" }}
            borderRadius="lg"
            _hover={{
              bg: "primary.800",
            }}
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
            <Text
              color="gray.500"
              textAlign="center"
              fontSize={{ base: "md", md: "lg" }}
            >
              Nenhuma escalação criada ainda
            </Text>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              color="gray.400"
              textAlign="center"
            >
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
    <Card
      variant="outline"
      borderColor="gray.200"
      bg="white"
      borderRadius="lg"
      boxShadow="sm"
    >
      <CardHeader pb={2} p={{ base: 4, md: 6 }}>
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: "column", sm: "row" }}
          gap={{ base: 2, sm: 0 }}
        >
          <HStack spacing={2}>
            <Badge
              colorScheme="green"
              variant="solid"
              fontSize="xs"
              px={2}
              py={1}
              borderRadius="md"
            >
              ESCALAÇÃO OFICIAL
            </Badge>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
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

      <CardBody pt={0} p={{ base: 4, md: 6 }}>
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
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={{ base: 4, md: 6 }}
      w="full"
    >
      {/* Time Preto */}
      <GridItem>
        <VStack spacing={3}>
          <Box
            bg="white"
            color="gray.900"
            py={{ base: 3, md: 4 }}
            px={{ base: 3, md: 4 }}
            borderRadius="lg"
            w="full"
            textAlign="center"
            position="relative"
          >
            <HStack justify="center" spacing={3}>
              <Image
                src={teamBlackShield}
                alt="Escudo Time Preto"
                objectFit="contain"
                w={{ base: "20px", md: "24px" }}
              />
              <VStack spacing={0}>
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  TIME PRETO
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }}>
                  {teamBlack.length} jogadores
                </Text>
              </VStack>
            </HStack>
          </Box>

          <VStack spacing={2} w="full">
            {teamBlack.map((player, index) => (
              <PlayerCard
                key={player.id}
                player={player}
                position={index + 1}
                color="black"
              />
            ))}
          </VStack>
        </VStack>
      </GridItem>

      <Divider
        orientation={{ base: "horizontal", md: "vertical" }}
        borderColor="gray.200"
      />

      {/* Time Branco */}
      <GridItem>
        <VStack spacing={3}>
          <Box
            bg="white"
            color="gray.900"
            py={{ base: 3, md: 4 }}
            px={{ base: 3, md: 4 }}
            borderRadius="lg"
            w="full"
            textAlign="center"
            position="relative"
          >
            <HStack justify="center" spacing={3}>
              <Image
                src={teamWhiteShield}
                alt="Escudo Time Branco"
                objectFit="contain"
                w={{ base: "20px", md: "24px" }}
              />
              <VStack spacing={0}>
                <Text fontWeight="bold" fontSize={{ base: "md", md: "lg" }}>
                  TIME BRANCO
                </Text>
                <Text fontSize={{ base: "xs", md: "sm" }}>
                  {teamWhite.length} jogadores
                </Text>
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
      bg={color === "white" ? "white" : "gray.900"}
      border="1px solid"
      borderColor={color === "white" ? "gray.300" : "gray.900"}
      p={{ base: 3, md: 3 }}
      borderRadius="lg"
      w="full"
      boxShadow="sm"
    >
      <HStack spacing={3} justify="space-between">
        <VStack spacing={0} align="start" flex={1} minW={0}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            color={color === "white" ? "primary.900" : "white"}
            noOfLines={1}
          >
            {player.name}
            {player.is_montly_payer && (
              <Text as="span" ml={1} color="orange.500">
                💰
              </Text>
            )}
          </Text>
          <Text
            fontSize="xs"
            color={color === "white" ? "gray.600" : "gray.300"}
            noOfLines={1}
          >
            {formatPositions(player.playing_positions)}
          </Text>
        </VStack>
        <Badge
          size="sm"
          colorScheme={color === "white" ? "blue" : "orange"}
          variant="solid"
          fontSize="xs"
        >
          {player.score || 0}
        </Badge>
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
      borderRadius="lg"
      borderColor="gray.200"
      boxShadow="sm"
    >
      <CardHeader p={{ base: 4, md: 6 }}>
        <Flex
          justify="space-between"
          align="center"
          direction={{ base: "row", sm: "row" }}
          gap={{ base: 3, sm: 0 }}
        >
          <Text
            fontSize={{ base: "md", md: "lg" }}
            fontWeight="semibold"
            color="primary.900"
          >
            {isEditing ? "Editar Escalação" : "Criar Escalação"}
          </Text>
          <Button
            leftIcon={<FiShuffle size={14} />}
            size={{ base: "sm", md: "md" }}
            variant="outline"
            borderColor="primary.200"
            color="primary.900"
            borderRadius="lg"
            _hover={{
              bg: "primary.50",
              borderColor: "primary.300",
            }}
            onClick={handleGenerateBalanced}
          >
            Auto
          </Button>
        </Flex>
      </CardHeader>

      <CardBody p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 4, md: 5 }}>
          {/* Exibir times em criação */}
          <CreateTeamsDisplay
            teamBlack={teamBlack}
            teamWhite={teamWhite}
            availablePlayers={getAvailablePlayers()}
            confirmedPlayers={confirmedPlayers}
            onPlayerMove={handlePlayerMove}
          />

          {/* Botões de ação */}
          <HStack
            spacing={{ base: 3, md: 4 }}
            w="full"
            justify="center"
            direction={{ base: "column", sm: "row" }}
          >
            <Button
              leftIcon={<FiCheck size={16} />}
              bg="primary.900"
              color="white"
              onClick={handleSubmit}
              isLoading={creating}
              loadingText={isEditing ? "Salvando..." : "Criando..."}
              isDisabled={teamBlack.length === 0 || teamWhite.length === 0}
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
              flex={{ base: 1, sm: "auto" }}
              _hover={{
                bg: "primary.800",
              }}
            >
              {isEditing ? "Salvar" : "Criar"}
            </Button>
            <Button
              leftIcon={<FiX size={16} />}
              variant="outline"
              onClick={onCancel}
              size={{ base: "sm", md: "md" }}
              borderRadius="lg"
              flex={{ base: 1, sm: "auto" }}
              borderColor="gray.300"
              _hover={{
                bg: "gray.50",
              }}
            >
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
    <VStack spacing={{ base: 4, md: 5 }} w="full">
      {/* Jogadores disponíveis */}
      {availablePlayers.length > 0 && (
        <Box w="full">
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            mb={3}
            color="primary.900"
          >
            Jogadores Disponíveis ({availablePlayers.length})
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              sm: "repeat(auto-fit, minmax(200px, 1fr))",
            }}
            gap={{ base: 2, md: 3 }}
          >
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
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={{ base: 4, md: 6 }}
        w="full"
      >
        <GridItem>
          <VStack spacing={3}>
            <HStack spacing={2} align="center">
              <Image
                src={teamBlackShield}
                alt="Escudo Time Preto"
                objectFit="contain"
                w={{ base: "20px", md: "24px" }}
              />
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="semibold"
                color="primary.900"
              >
                TIME PRETO ({teamBlack.length})
              </Text>
            </HStack>
            <Box
              minH="64px"
              p={{ base: 3, md: 4 }}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              w="full"
              bg="gray.50"
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
          <VStack spacing={3}>
            <HStack spacing={2} align="center">
              <Image
                src={teamWhiteShield}
                alt="Escudo Time Branco"
                objectFit="contain"
                w={{ base: "20px", md: "24px" }}
              />
              <Text
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="semibold"
                color="primary.900"
              >
                TIME BRANCO ({teamWhite.length})
              </Text>
            </HStack>
            <Box
              minH="64px"
              p={{ base: 3, md: 4 }}
              border="1px dashed"
              borderColor="gray.300"
              borderRadius="lg"
              w="full"
              bg="gray.50"
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
      p={{ base: 3, md: 3 }}
      borderRadius="lg"
      cursor="pointer"
      _hover={{ bg: "gray.50" }}
    >
      <VStack spacing={2} align="stretch">
        <HStack justify="space-between">
          <VStack spacing={0} align="start" flex={1} minW={0}>
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="semibold"
              color="primary.900"
              noOfLines={1}
            >
              {player.userData?.name}
              {player.userData?.is_montly_payer && (
                <Text as="span" ml={1} color="orange.500">
                  💰
                </Text>
              )}
            </Text>
            <Text fontSize="xs" color="gray.600" noOfLines={1}>
              {formatPositions(player.userData?.playing_positions)}
            </Text>
          </VStack>
          <Badge size="sm" colorScheme="blue" variant="solid" fontSize="xs">
            {player.userData?.score || 0}
          </Badge>
        </HStack>
        <HStack spacing={2} justify="center">
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            border="1px solid"
            justifyContent="center"
            flex={1}
            p={2}
            borderRadius="md"
            bg="gray.800"
            color="white"
            fontWeight="semibold"
            onClick={onMoveToBlack}
          >
            <Box
              w="12px"
              h="12px"
              bg="gray.800"
              borderRadius="full"
              border="1px solid white"
            />
            Preto
          </Box>
          <Box
            display="flex"
            alignItems="center"
            gap={2}
            border="1px solid"
            justifyContent="center"
            flex={1}
            p={2}
            borderRadius="md"
            fontWeight="semibold"
            onClick={onMoveToWhite}
          >
            <Box
              w="12px"
              h="12px"
              bg="white"
              borderRadius="full"
              border="2px solid"
              borderColor="gray.800"
            />
            Branco
          </Box>
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
      bg={color !== "black" ? "white" : "gray.900"}
      border="1px solid"
      borderColor={color !== "black" ? "gray.300" : "gray.900"}
      p={{ base: 3, md: 3 }}
      borderRadius="lg"
      color={color !== "black" ? "primary.900" : "white"}
      w="full"
    >
      <HStack justify="space-between" align="start">
        <VStack spacing={1} align="start" flex={1} minW={0}>
          <Text
            fontSize={{ base: "sm", md: "md" }}
            fontWeight="semibold"
            noOfLines={1}
          >
            {player.userData?.name}
            {player.userData?.is_montly_payer && (
              <Text as="span" ml={1} color="orange.500">
                💰
              </Text>
            )}
          </Text>
          <Text
            fontSize="xs"
            color={color !== "black" ? "gray.600" : "gray.300"}
            noOfLines={1}
          >
            {formatPositions(player.userData?.playing_positions)}
          </Text>
          <Badge
            size="sm"
            colorScheme={color !== "black" ? "blue" : "orange"}
            variant="solid"
            fontSize="xs"
          >
            {player.userData?.score || 0}
          </Badge>
        </VStack>
        <HStack spacing={1}>
          <IconButton
            icon={<FiShuffle size={12} />}
            size="sm"
            variant="ghost"
            onClick={onMoveToOtherTeam}
            title="Trocar de time"
            borderRadius="md"
            _hover={{ bg: color !== "black" ? "gray.100" : "gray.800" }}
            bg={color !== "black" ? "gray.100" : "white"}
          />
          <IconButton
            icon={<FiX size={12} />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            title="Remover do time"
            _hover={{ bg: color !== "black" ? "gray.100" : "gray.800" }}
            bg={color !== "black" ? "gray.100" : "gray.100"}
            borderRadius="md"
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
      <Button
        leftIcon={<FiTrash2 size={14} />}
        size={{ base: "sm", md: "md" }}
        variant="outline"
        colorScheme="red"
        borderRadius="lg"
        onClick={onOpen}
        title="Remover escalação"
      >
        Deletar
      </Button>
      <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent mx={4} borderRadius="lg">
            <AlertDialogHeader
              fontSize="lg"
              fontWeight="bold"
              color="primary.900"
            >
              Remover Escalação
            </AlertDialogHeader>
            <AlertDialogBody color="gray.700">
              Tem certeza que deseja remover a escalação? Esta ação não pode ser
              desfeita.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={onClose} variant="outline" borderRadius="lg">
                Cancelar
              </Button>
              <Button
                bg="red.500"
                color="white"
                onClick={handleDelete}
                ml={3}
                borderRadius="lg"
                _hover={{
                  bg: "red.600",
                }}
              >
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
