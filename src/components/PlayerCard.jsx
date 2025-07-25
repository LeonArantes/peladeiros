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
      p={{ base: 3, md: 4 }}
      bg="white"
      borderRadius="lg"
      border="1px solid"
      borderColor="gray.200"
      boxShadow="sm"
      cursor="pointer"
      onClick={() => navigate(`/player/${player?.id}`)}
      _hover={{
        boxShadow: "md",
        borderColor: "primary.200",
        transform: "translateY(-1px)",
      }}
      transition="all 0.2s"
    >
      <HStack spacing={{ base: 3, md: 4 }} align="start">
        {/* Avatar */}
        <Box
          w={{ base: 10, md: 12 }}
          h={{ base: 10, md: 12 }}
          bg="primary.900"
          color="white"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontSize={{ base: "md", md: "lg" }}
          fontWeight="bold"
          flexShrink={0}
        >
          {player?.name?.charAt(0)?.toUpperCase()}
        </Box>

        {/* Informações principais */}
        <VStack spacing={{ base: 1, md: 2 }} align="start" flex={1} minW={0}>
          <VStack spacing={0} align="start" w="full">
            <Text
              fontWeight="semibold"
              fontSize={{ base: "sm", md: "md" }}
              color="primary.900"
              noOfLines={1}
            >
              {player?.name}
            </Text>
            <Text fontSize={{ base: "xs", md: "sm" }} color="gray.500">
              {calculateAge(player?.birthdate)} anos
            </Text>
          </VStack>

          {/* Badges de status - layout responsivo */}
          <HStack spacing={{ base: 1, md: 2 }} wrap="wrap" w="full">
            <Badge
              colorScheme={player?.is_active ? "green" : "gray"}
              variant={player?.is_active ? "subtle" : "outline"}
              fontSize="xs"
              borderRadius="md"
              px={2}
              py={1}
            >
              {player?.is_active ? "Ativo" : "Inativo"}
            </Badge>

            {player?.is_montly_payer && (
              <Badge
                bg="primary.100"
                color="primary.800"
                variant="subtle"
                fontSize="xs"
                borderRadius="md"
                px={2}
                py={1}
              >
                Mensalista
              </Badge>
            )}

            {player?.is_admin && (
              <Badge
                colorScheme="purple"
                variant="subtle"
                fontSize="xs"
                borderRadius="md"
                px={2}
                py={1}
              >
                Admin
              </Badge>
            )}
          </HStack>

          {/* Informações do jogo */}
          <HStack
            spacing={{ base: 3, md: 4 }}
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.600"
            w="full"
          >
            <HStack spacing={1} minW={0}>
              <FiShield size={12} color="gray.500" />
              <Text noOfLines={1} fontWeight="medium">
                {formatPositions(player?.playing_positions)}
              </Text>
            </HStack>

            <HStack spacing={1}>
              <FiTarget size={12} color="primary.600" />
              <Text fontWeight="semibold" color="primary.600">
                {player?.score || 0}
              </Text>
            </HStack>
          </HStack>
        </VStack>

        {/* Seta */}
        <Flex align="center" h="full" flexShrink={0}>
          <FiChevronRight size={16} color="gray.400" />
        </Flex>
      </HStack>
    </Box>
  );
};

export default PlayerCard;
