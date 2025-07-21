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
        <Spinner color="black" />
      </Center>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Header com contador */}
      <Flex justify="space-between" align="center">
        <Text fontSize="lg" fontWeight="semibold" color="gray.800">
          Lista de Confirmados
        </Text>
        <Badge
          colorScheme={isListFull ? "red" : "green"}
          variant="subtle"
          fontSize="sm"
          px={3}
          py={1}
          borderRadius="full"
        >
          {confirmedCount}/{maxPlayers}
        </Badge>
      </Flex>

      {/* Estatísticas */}
      <HStack spacing={4} justify="center">
        <Badge colorScheme="green" variant="outline">
          {confirmedCount} Confirmados
        </Badge>
        <Badge colorScheme="blue" variant="outline">
          {maxPlayers - confirmedCount} Vagas Livres
        </Badge>
        {waitingCount > 0 && (
          <Badge colorScheme="orange" variant="outline">
            {waitingCount} Em Espera
          </Badge>
        )}
      </HStack>

      {/* Botão de ação */}
      {canJoin && match?.status !== "Finalizada" ? (
        <Button
          leftIcon={<FiUserPlus />}
          colorScheme="green"
          isLoading={isJoining}
          loadingText="Confirmando..."
          onClick={joinMatch}
          size="md"
        >
          Confirmar Presença
        </Button>
      ) : canLeave && match?.status !== "Finalizada" ? (
        <Button
          leftIcon={<FiUserMinus />}
          colorScheme="red"
          variant="outline"
          isLoading={isLeaving}
          loadingText="Saindo..."
          onClick={leaveMatch}
          size="md"
        >
          Sair da Lista
        </Button>
      ) : isListFull ? (
        <Button
          leftIcon={<FiUserPlus />}
          colorScheme="gray"
          isDisabled
          size="md"
        >
          Lista Lotada
        </Button>
      ) : null}

      {/* Lista Principal - Vagas Confirmadas */}
      <VStack spacing={3} align="stretch">
        <Text fontSize="md" fontWeight="semibold" color="gray.700" mb={2}>
          🏆 Vagas Confirmadas ({maxPlayers})
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

      {/* Divisor */}
      <Divider />

      {/* Lista de Espera */}
      <VStack spacing={3} align="stretch">
        <Text fontSize="md" fontWeight="semibold" color="orange.600" mb={2}>
          ⏳ Lista de Espera (mínimo {minWaitingSlots})
        </Text>

        {waitingSlots.map((slot) => (
          <SlotCard
            key={slot.position}
            slot={slot}
            isUserAdmin={isUserAdmin}
            onRemove={() => slot.player && openRemoveDialog(slot.player)}
            status="waiting"
          />
        ))}
      </VStack>

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
        p={4}
        bg="gray.50"
        borderRadius="lg"
        border="2px dashed"
        borderColor="gray.300"
        opacity={0.7}
      >
        <HStack spacing={3}>
          {/* Posição */}
          <Box
            w={8}
            h={8}
            bg="gray.200"
            color="gray.500"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize="sm"
            fontWeight="bold"
          >
            {position}
          </Box>

          {/* Informações da vaga */}
          <VStack spacing={0} align="start" flex={1}>
            <Text fontWeight="medium" color="gray.500">
              Vaga Disponível
            </Text>
            <Text fontSize="xs" color="gray.400">
              {status === "confirmed"
                ? "Confirme sua presença"
                : "Aguardando liberação"}
            </Text>
          </VStack>

          <Spacer />

          {/* Status da vaga */}
          <Badge colorScheme="gray" variant="outline">
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
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px"
      borderColor={status === "confirmed" ? "green.200" : "orange.200"}
      boxShadow="sm"
    >
      <HStack spacing={3}>
        {/* Posição */}
        <Box
          w={8}
          h={8}
          bg={status === "confirmed" ? "green.100" : "orange.100"}
          color={status === "confirmed" ? "green.600" : "orange.600"}
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="sm"
          fontWeight="bold"
        >
          {position}
        </Box>

        <VStack spacing={0} align="start" flex={1}>
          <HStack spacing={2}>
            <Text fontWeight="semibold" color="gray.800">
              {userData?.name || `Usuário ${userData?.phone || player.userId}`}
            </Text>
            {isMonthlyPayer && (
              <Badge colorScheme="orange" variant="subtle" fontSize="xs">
                Mensalista
              </Badge>
            )}
          </HStack>
          <Text fontSize="xs" color="gray.500">
            Confirmado em {format(joinedAt, "dd/MM HH:mm:ss", { locale: ptBR })}
          </Text>
        </VStack>

        <Spacer />

        {/* Ações para admin */}
        {isUserAdmin && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={onRemove}
            aria-label="Remover jogador"
          >
            <FiUserMinus />
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
  >
    <AlertDialogOverlay>
      <AlertDialogContent>
        <AlertDialogHeader fontSize="lg" fontWeight="bold">
          Remover da Lista
        </AlertDialogHeader>

        <AlertDialogBody>
          Tem certeza que deseja remover {playerName} da lista desta pelada?
        </AlertDialogBody>

        <AlertDialogFooter>
          <Button ref={cancelRef} onClick={onClose}>
            Cancelar
          </Button>
          <Button colorScheme="red" onClick={onConfirm} ml={3}>
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialogOverlay>
  </AlertDialog>
);

export default ConfirmedPlayersList;
