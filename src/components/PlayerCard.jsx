import {
  Badge,
  Box,
  HStack,
  Spacer,
  Text,
  VStack,
  Flex,
} from "@chakra-ui/react";
import { useAuth } from "../context/AuthContext";
import { FiChevronRight, FiTarget, FiUser, FiShield } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const PlayerCard = ({ player }) => {
  const navigate = useNavigate();

  // Formatação das posições
  const formatPositions = (positions) => {
    if (!positions || positions.length === 0) return "Sem posição";
    if (positions.length === 1) return positions[0];
    if (positions.length === 2) return positions.join(" / ");
    return `${positions[0]} +${positions.length - 1}`;
  };

  // Calcular idade
  const calculateAge = (birthdate) => {
    if (!birthdate) return "N/A";
    const dateStr = birthdate.toString();
    if (dateStr.length === 8) {
      const year = parseInt(dateStr.slice(0, 4));
      const month = parseInt(dateStr.slice(4, 6)) - 1;
      const day = parseInt(dateStr.slice(6, 8));

      const birth = new Date(year, month, day);
      const today = new Date();
      const age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();

      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birth.getDate())
      ) {
        return age - 1;
      }
      return age;
    }
    return "N/A";
  };

  return (
    <Box
      p={4}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      shadow="sm"
      cursor="pointer"
      onClick={() => navigate(`/player/${player?.id}`)}
      _hover={{
        shadow: "md",
        borderColor: "gray.300",
        transform: "translateY(-1px)",
      }}
      transition="all 0.2s"
    >
      <HStack spacing={4} align="start">
        {/* Avatar */}
        <Box
          w={12}
          h={12}
          bg="gray.600"
          color="white"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize="lg"
          fontWeight="bold"
        >
          {player?.name?.charAt(0)?.toUpperCase()}
        </Box>

        {/* Informações principais */}
        <VStack spacing={2} align="start" flex={1}>
          <VStack spacing={0} align="start">
            <Text fontWeight="semibold" fontSize="md" color="gray.800">
              {player?.name}
            </Text>
            <Text fontSize="sm" color="gray.600">
              {calculateAge(player?.birthdate)} anos
            </Text>
          </VStack>

          {/* Badges de status */}
          <HStack spacing={2} wrap="wrap">
            <Badge
              colorScheme={player?.is_active ? "green" : "red"}
              variant="solid"
              fontSize="xs"
            >
              {player?.is_active ? "Ativo" : "Inativo"}
            </Badge>

            <Badge
              colorScheme={player?.is_montly_payer ? "blue" : "gray"}
              variant={player?.is_montly_payer ? "solid" : "outline"}
              fontSize="xs"
            >
              {player?.is_montly_payer ? "Mensalista" : "Avulso"}
            </Badge>

            {player?.is_admin && (
              <Badge colorScheme="purple" variant="solid" fontSize="xs">
                Admin
              </Badge>
            )}
          </HStack>

          {/* Informações do jogo */}
          <HStack spacing={4} fontSize="sm" color="gray.600">
            <HStack spacing={1}>
              <FiShield size={14} />
              <Text>{formatPositions(player?.playing_positions)}</Text>
            </HStack>

            <HStack spacing={1}>
              <FiTarget size={14} />
              <Text fontWeight="medium" color="blue.600">
                {player?.score || 0} pts
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Seta */}
        <Flex align="center" h="full">
          <FiChevronRight size={20} color="gray.400" />
        </Flex>
      </HStack>
    </Box>
  );
};

export default PlayerCard;
