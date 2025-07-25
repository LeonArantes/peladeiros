import React, { useRef, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Avatar,
  Badge,
  Flex,
  Spacer,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Spinner,
  Center,
  Divider,
} from "@chakra-ui/react";
import { FiUserPlus, FiUserMinus, FiUser, FiUserCheck } from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAttendance } from "../hooks/useAttendance";

/**
 * Componente para exibir e gerenciar lista de presença
 * Refatorado seguindo princípios SOLID - responsabilidade única de UI
 */
const ConfirmedPlayersList = ({ match }) => {
  const maxPlayers = match?.max_players;
  const {
    attendanceList,
    loading,
    isJoining,
    isLeaving,
    userInList,
    isListFull,
    confirmedCount,
    waitingCount,
    canJoin,
    canLeave,
    isUserAdmin,
    joinMatch,
    leaveMatch,
    removeUser,
  } = useAttendance(match.id, maxPlayers);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  // Estado para o usuário sendo removido
  const [playerToRemove, setPlayerToRemove] = useState(null);

  const openRemoveDialog = (player) => {
    setPlayerToRemove(player);
    onOpen();
  };

  const confirmRemovePlayer = async () => {
    if (!playerToRemove) return;

    try {
      await removeUser(playerToRemove.userId);
    } finally {
      onClose();
      setPlayerToRemove(null);
    }
  };

  // Separar jogadores confirmados e em espera
  const confirmedPlayers = attendanceList.slice(0, maxPlayers);
  const waitingPlayers = attendanceList.slice(maxPlayers);

  // Criar array completo com vagas vazias para a lista principal
  const fullSlots = Array.from({ length: maxPlayers }, (_, index) => {
    const player = confirmedPlayers[index];
    return {
      position: index + 1,
      player: player || null,
      isEmpty: !player,
    };
  });

  // Garantir que a lista de espera tenha pelo menos 4 slots
  const minWaitingSlots = 4;
  const waitingSlots = Array.from(
    { length: Math.max(minWaitingSlots, waitingPlayers.length) },
    (_, index) => {
      const player = waitingPlayers[index];
      return {
        position: maxPlayers + index + 1,
        player: player || null,
        isEmpty: !player,
      };
    }
  );

  if (loading) {
    return (
      <Center py={8}>
        <Spinner color="primary.900" />
      </Center>
    );
  }

  return (
    <VStack spacing={{ base: 4, md: 5 }} align="stretch">
      {/* Header com contador */}
      <Flex
        justify="space-between"
        align="center"
        direction={{ base: "row", sm: "row" }}
        gap={{ base: 2, sm: 2 }}
      >
        <Text
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="semibold"
          color="primary.900"
        >
          Lista de Confirmados
        </Text>
        <Badge
          colorScheme={isListFull ? "red" : "green"}
          variant="solid"
          fontSize="xs"
          px={3}
          py={1}
          borderRadius="full"
        >
          {confirmedCount}/{maxPlayers}
        </Badge>
      </Flex>

      {/* Estatísticas */}
      <HStack spacing={{ base: 2, md: 3 }} justify="center" flexWrap="wrap">
        <Badge colorScheme="green" variant="outline" fontSize="xs">
          {confirmedCount} Confirmados
        </Badge>
        <Badge colorScheme="blue" variant="outline" fontSize="xs">
          {maxPlayers - confirmedCount} Vagas
        </Badge>
        {waitingCount > 0 && (
          <Badge colorScheme="orange" variant="outline" fontSize="xs">
            {waitingCount} Espera
          </Badge>
        )}
      </HStack>

      {/* Botão de ação */}
      {canJoin && match?.status !== "Finalizada" ? (
        <Button
          leftIcon={<FiUserPlus size={16} />}
          bg="primary.900"
          color="white"
          isLoading={isJoining}
          loadingText="Confirmando..."
          onClick={joinMatch}
          size={{ base: "sm", md: "md" }}
          borderRadius="lg"
          _hover={{
            bg: "primary.800",
          }}
        >
          Confirmar Presença
        </Button>
      ) : canLeave && match?.status !== "Finalizada" ? (
        <Button
          leftIcon={<FiUserMinus size={16} />}
          variant="outline"
          borderColor="red.300"
          color="red.600"
          isLoading={isLeaving}
          loadingText="Saindo..."
          onClick={leaveMatch}
          size={{ base: "sm", md: "md" }}
          borderRadius="lg"
          _hover={{
            bg: "red.50",
            borderColor: "red.400",
          }}
        >
          Sair da Lista
        </Button>
      ) : isListFull ? (
        <Button
          leftIcon={<FiUserPlus size={16} />}
          variant="outline"
          borderColor="gray.300"
          color="gray.500"
          isDisabled
          size={{ base: "sm", md: "md" }}
          borderRadius="lg"
        >
          Lista Lotada
        </Button>
      ) : null}

      {/* Lista Principal - Vagas Confirmadas */}
      <VStack spacing={{ base: 2, md: 3 }} align="stretch">
        <Text
          fontSize={{ base: "sm", md: "md" }}
          fontWeight="semibold"
          color="primary.900"
          mb={1}
        >
          🏆 Confirmados ({maxPlayers})
        </Text>

        {fullSlots.map((slot) => (
          <SlotCard
            key={slot.position}
            slot={slot}
            isUserAdmin={isUserAdmin}
            onRemove={() => slot.player && openRemoveDialog(slot.player)}
            status="confirmed"
          />
        ))}
      </VStack>

      {/* Lista de Espera */}
      {(waitingCount > 0 || canJoin) && (
        <>
          <Divider borderColor="gray.200" />

          <VStack spacing={{ base: 2, md: 3 }} align="stretch">
            <Text
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="semibold"
              color="orange.600"
              mb={1}
            >
              ⏳ Lista de Espera
            </Text>

            {waitingSlots
              .slice(0, Math.max(2, waitingPlayers.length))
              .map((slot) => (
                <SlotCard
                  key={slot.position}
                  slot={slot}
                  isUserAdmin={isUserAdmin}
                  onRemove={() => slot.player && openRemoveDialog(slot.player)}
                  status="waiting"
                />
              ))}
          </VStack>
        </>
      )}

      {/* Dialog de confirmação de remoção */}
      <RemovePlayerDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={confirmRemovePlayer}
        playerName={playerToRemove?.userData?.name || "este jogador"}
        cancelRef={cancelRef}
      />
    </VStack>
  );
};

/**
 * Componente para exibir um slot (vaga ocupada ou vazia)
 */
const SlotCard = ({ slot, isUserAdmin, onRemove, status }) => {
  const { position, player, isEmpty } = slot;

  if (isEmpty) {
    return (
      <Box
        p={{ base: 3, md: 3 }}
        bg="gray.50"
        borderRadius="lg"
        border="1px dashed"
        borderColor="gray.300"
        opacity={0.6}
      >
        <HStack spacing={3}>
          {/* Posição */}
          <Box
            w={7}
            h={7}
            bg="gray.200"
            color="gray.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="xs"
            fontWeight="bold"
          >
            {position}
          </Box>

          {/* Informações da vaga */}
          <VStack spacing={0} align="start" flex={1}>
            <Text fontWeight="medium" color="gray.500" fontSize="sm">
              Vaga Disponível
            </Text>
            <Text fontSize="xs" color="gray.400">
              {status === "confirmed"
                ? "Aguardando confirmação"
                : "Lista de espera"}
            </Text>
          </VStack>

          <Badge colorScheme="gray" variant="outline" fontSize="xs">
            Livre
          </Badge>
        </HStack>
      </Box>
    );
  }

  // Vaga ocupada
  const { userData, isMonthlyPayer, joinedAt } = player;

  return (
    <Box
      p={{ base: 3, md: 3 }}
      bg="white"
      borderRadius="lg"
      border="1px"
      borderColor={status === "confirmed" ? "green.200" : "orange.200"}
      boxShadow="sm"
    >
      <HStack spacing={3}>
        {/* Posição */}
        <Box
          w={7}
          h={7}
          bg={status === "confirmed" ? "green.100" : "orange.100"}
          color={status === "confirmed" ? "green.600" : "orange.600"}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="xs"
          fontWeight="bold"
        >
          {position}
        </Box>

        <VStack spacing={0} align="start" flex={1} minW={0}>
          <HStack spacing={2} w="full">
            <Text
              fontWeight="semibold"
              color="primary.900"
              fontSize={{ base: "sm", md: "md" }}
              noOfLines={1}
              flex={1}
            >
              {userData?.name || `Usuário ${userData?.phone || player.userId}`}
              {isMonthlyPayer && (
                <Text as="span" ml={1} color="orange.500">
                  💰
                </Text>
              )}
            </Text>
          </HStack>
          <Text fontSize="xs" color="gray.500">
            {format(joinedAt, "dd/MM HH:mm:ss", { locale: ptBR })}
          </Text>
        </VStack>

        {/* Ações para admin */}
        {isUserAdmin && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            aria-label="Remover jogador"
            borderRadius="md"
          >
            <FiUserMinus size={14} />
          </Button>
        )}
      </HStack>
    </Box>
  );
};

/**
 * Dialog para confirmação de remoção
 */
const RemovePlayerDialog = ({
  isOpen,
  onClose,
  onConfirm,
  playerName,
  cancelRef,
}) => (
  <AlertDialog
    isOpen={isOpen}
    leastDestructiveRef={cancelRef}
    onClose={onClose}
    isCentered
  >
    <AlertDialogOverlay>
      <AlertDialogContent mx={4} borderRadius="lg">
        <AlertDialogHeader fontSize="lg" fontWeight="bold" color="primary.900">
          Remover da Lista
        </AlertDialogHeader>

        <AlertDialogBody color="gray.700">
          Tem certeza que deseja remover <strong>{playerName}</strong> da lista
          desta partida?
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button
            ref={cancelRef}
            onClick={onClose}
            variant="outline"
            borderRadius="lg"
          >
            Cancelar
          </Button>
          <Button
            bg="red.500"
            color="white"
            onClick={onConfirm}
            ml={3}
            borderRadius="lg"
            _hover={{
              bg: "red.600",
            }}
          >
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default ConfirmedPlayersList;
