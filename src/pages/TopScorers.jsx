import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
  Grid,
  Badge,
  Skeleton,
  Center,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiTarget, FiGift, FiRefreshCw, FiAward } from "react-icons/fi";
import { useTopScorers } from "../hooks/useTopScorers";
import { useNavigate } from "react-router-dom";

/**
 * Componente Skeleton para o card de artilheiro
 */
const ScorerCardSkeleton = () => (
  <Box
    p={4}
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    shadow="sm"
  >
    <HStack spacing={4} align="center" justify="space-between">
      <HStack spacing={3} flex={1}>
        <Skeleton height="24px" width="40px" borderRadius="md" />
        <Skeleton height="16px" width="150px" />
      </HStack>
      <HStack spacing={4}>
        <Skeleton height="16px" width="30px" />
        <Skeleton height="16px" width="30px" />
      </HStack>
    </HStack>
  </Box>
);

/**
 * Componente que renderiza múltiplos skeletons
 */
const TopScorersLoadingSkeleton = ({ count = 10 }) => (
  <VStack spacing={3} align="stretch">
    {Array.from({ length: count }, (_, index) => (
      <ScorerCardSkeleton key={index} />
    ))}
  </VStack>
);

/**
 * Card individual do artilheiro - versão simplificada
 */
const ScorerCard = ({ scorer, onClick }) => {
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  // Definir cor da posição baseada no ranking
  const getPositionColor = (position) => {
    if (position === 1) return "yellow"; // Ouro
    if (position === 2) return "gray"; // Prata
    if (position === 3) return "orange"; // Bronze
    return "blue"; // Demais posições
  };

  // Definir ícone da posição
  const getPositionIcon = (position) => {
    if (position <= 3) return FiAward;
    return null;
  };

  const PositionIcon = getPositionIcon(scorer.position);
  const positionColor = getPositionColor(scorer.position);

  return (
    <Box
      p={4}
      bg={cardBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      shadow="sm"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        shadow: "md",
        borderColor: "gray.300",
        transform: "translateY(-1px)",
      }}
      transition="all 0.2s"
    >
      <HStack spacing={4} align="center" justify="space-between">
        {/* Rank e Nome */}
        <HStack spacing={3} flex={1}>
          {/* Posição no ranking */}
          <HStack spacing={1} minW="60px">
            <Badge
              colorScheme={positionColor}
              variant="solid"
              fontSize="sm"
              px={2}
              py={1}
              borderRadius="md"
            >
              #{scorer.position}
            </Badge>
          </HStack>

          {/* Nome do jogador */}
          <Text
            fontWeight="semibold"
            fontSize="md"
            color="gray.800"
            noOfLines={1}
          >
            {scorer.playerName}
          </Text>
        </HStack>

        {/* Estatísticas */}
        <HStack spacing={6} minW="120px">
          {/* Gols */}
          <VStack spacing={0} align="center" minW="40px">
            <Text fontSize="lg" fontWeight="bold" color="green.500">
              {scorer.goalsFor}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {scorer.goalsFor === 1 ? "gol" : "gols"}
            </Text>
          </VStack>

          {/* Partidas */}
          <VStack spacing={0} align="center" minW="40px">
            <Text fontSize="lg" fontWeight="bold" color="blue.500">
              {scorer.matchesPlayed}
            </Text>
            <Text fontSize="xs" color="gray.500">
              {scorer.matchesPlayed === 1 ? "jogo" : "jogos"}
            </Text>
          </VStack>
        </HStack>
      </HStack>
    </Box>
  );
};

/**
 * Header da tabela
 */
const TableHeader = () => (
  <Box
    p={4}
    bg="gray.100"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    mb={2}
  >
    <HStack spacing={4} align="center" justify="space-between">
      {/* Headers da esquerda */}
      <HStack spacing={3} flex={1}>
        <Text fontSize="sm" fontWeight="bold" color="gray.600" minW="60px">
          Rank
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="gray.600">
          Jogador
        </Text>
      </HStack>

      {/* Headers da direita */}
      <HStack spacing={6} minW="120px">
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.600"
          textAlign="center"
          minW="40px"
        >
          Gols
        </Text>
        <Text
          fontSize="sm"
          fontWeight="bold"
          color="gray.600"
          textAlign="center"
          minW="40px"
        >
          Jogos
        </Text>
      </HStack>
    </HStack>
  </Box>
);

/**
 * Componente principal da página TopScorers
 */
export default function TopScorers() {
  const navigate = useNavigate();
  const { topScorers, loading, error, refetch, hasData, isEmpty } =
    useTopScorers(20);

  const handleScorerClick = (scorer) => {
    // Navegar para detalhes do jogador se tiver playerId
    if (scorer.playerId) {
      navigate(`/player/${scorer.playerId}`);
    }
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.xl" px={4} py={6}>
        {/* Header */}
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <VStack spacing={1} align="start">
              <HStack spacing={3}>
                <FiGift size={28} color="#D69E2E" />
                <Heading size="xl" color="gray.800">
                  Artilheiros
                </Heading>
              </HStack>
              <Text color="gray.600" fontSize="md">
                Ranking dos jogadores que mais marcaram gols a favor
              </Text>
            </VStack>

            <Button
              leftIcon={<FiRefreshCw />}
              variant="outline"
              onClick={handleRefresh}
              isLoading={loading}
              loadingText="Atualizando..."
              size="md"
            >
              Atualizar
            </Button>
          </Flex>

          {/* Conteúdo principal */}
          {loading && <TopScorersLoadingSkeleton count={10} />}

          {error && (
            <Center py={8}>
              <Alert status="error" borderRadius="lg" maxW="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Erro ao carregar artilheiros</AlertTitle>
                  <AlertDescription fontSize="sm">{error}</AlertDescription>
                </Box>
              </Alert>
            </Center>
          )}

          {isEmpty && (
            <Center py={12}>
              <VStack spacing={4}>
                <Box color="gray.400">
                  <FiTarget size={48} />
                </Box>
                <VStack spacing={2}>
                  <Text fontSize="lg" fontWeight="medium" color="gray.600">
                    Nenhum artilheiro encontrado
                  </Text>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    Os artilheiros aparecerão aqui quando houver gols
                    registrados nas partidas
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FiRefreshCw />}
                  variant="outline"
                  onClick={handleRefresh}
                  size="sm"
                >
                  Tentar novamente
                </Button>
              </VStack>
            </Center>
          )}

          {hasData && !loading && (
            <VStack spacing={0} align="stretch">
              {/* Header da tabela */}
              <TableHeader />

              {/* Lista de artilheiros */}
              <VStack spacing={2} align="stretch">
                {topScorers.map((scorer) => (
                  <ScorerCard
                    key={scorer.playerId}
                    scorer={scorer}
                    onClick={() => handleScorerClick(scorer)}
                  />
                ))}
              </VStack>
            </VStack>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
