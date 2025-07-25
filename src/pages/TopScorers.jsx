import {
  Box,
  Container,
  Heading,
  VStack,
  HStack,
  Text,
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
    p={{ base: 3, md: 4 }}
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    boxShadow="sm"
  >
    <HStack spacing={{ base: 3, md: 4 }} align="center" justify="space-between">
      <HStack spacing={{ base: 2, md: 3 }} flex={1}>
        <Skeleton height="24px" width="40px" borderRadius="lg" />
        <Skeleton height="16px" width={{ base: "120px", md: "150px" }} />
      </HStack>
      <HStack spacing={{ base: 2, md: 4 }}>
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
  <VStack spacing={{ base: 2, md: 3 }} align="stretch">
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

  const positionColor = getPositionColor(scorer.position);

  return (
    <Box
      p={{ base: 3, md: 4 }}
      bg={cardBg}
      borderRadius="lg"
      border="1px solid"
      borderColor={borderColor}
      boxShadow="sm"
      cursor="pointer"
      onClick={onClick}
      _hover={{
        boxShadow: "md",
        borderColor: "primary.200",
        transform: "translateY(-1px)",
      }}
      transition="all 0.2s"
    >
      <HStack
        spacing={{ base: 3, md: 4 }}
        align="center"
        justify="space-between"
      >
        {/* Rank e Nome */}
        <HStack spacing={{ base: 2, md: 3 }} flex={1} minW={0}>
          {/* Posição no ranking */}
          <HStack
            spacing={1}
            minW={{ base: "50px", md: "60px" }}
            flexShrink={0}
          >
            <Badge
              colorScheme={positionColor}
              variant="solid"
              fontSize={{ base: "xs", md: "sm" }}
              px={2}
              py={1}
              borderRadius="lg"
            >
              #{scorer.position}
            </Badge>
          </HStack>

          {/* Nome do jogador */}
          <Text
            fontWeight="semibold"
            fontSize={{ base: "sm", md: "md" }}
            color="primary.900"
            noOfLines={1}
            flex={1}
          >
            {scorer.playerName}
          </Text>
        </HStack>

        {/* Estatísticas */}
        <HStack
          spacing={{ base: 3, md: 6 }}
          minW={{ base: "80px", md: "120px" }}
          flexShrink={0}
        >
          {/* Gols */}
          <VStack spacing={0} align="center" minW="30px">
            <Text
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              color="green.500"
            >
              {scorer.goalsFor}
            </Text>
            <Text
              fontSize="xs"
              color="gray.500"
              display={{ base: "none", md: "block" }}
            >
              {scorer.goalsFor === 1 ? "gol" : "gols"}
            </Text>
          </VStack>

          {/* Partidas */}
          <VStack spacing={0} align="center" minW="30px">
            <Text
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              color="primary.600"
            >
              {scorer.matchesPlayed}
            </Text>
            <Text
              fontSize="xs"
              color="gray.500"
              display={{ base: "none", md: "block" }}
            >
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
    p={{ base: 3, md: 4 }}
    bg="gray.100"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    mb={2}
  >
    <HStack spacing={{ base: 3, md: 4 }} align="center" justify="space-between">
      {/* Headers da esquerda */}
      <HStack spacing={{ base: 2, md: 3 }} flex={1}>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="bold"
          color="gray.600"
          minW={{ base: "50px", md: "60px" }}
        >
          Rank
        </Text>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="bold"
          color="gray.600"
        >
          Jogador
        </Text>
      </HStack>

      {/* Headers da direita */}
      <HStack spacing={{ base: 3, md: 6 }} minW={{ base: "80px", md: "120px" }}>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="bold"
          color="gray.600"
          textAlign="center"
          minW="30px"
        >
          Gols
        </Text>
        <Text
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="bold"
          color="gray.600"
          textAlign="center"
          minW="30px"
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
    <Box minH="100vh" bg="gray.50" pb={{ base: "24", md: "80px" }}>
      <Container
        maxW={{
          base: "full",
          sm: "container.sm",
          md: "container.md",
          lg: "container.xl",
        }}
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 6 }}
      >
        {/* Header */}
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          <Flex
            justify="space-between"
            align={{ base: "start", md: "center" }}
            wrap="wrap"
            gap={{ base: 3, md: 4 }}
            direction={{ base: "column", md: "row" }}
          >
            <VStack spacing={1} align="start">
              <HStack spacing={3}>
                <Heading
                  size={{ base: "lg", md: "xl" }}
                  color="primary.900"
                  lineHeight="shorter"
                >
                  Artilheiros
                </Heading>
              </HStack>
              <Text
                color="gray.600"
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="base"
              >
                Ranking dos jogadores que mais marcaram gols a favor
              </Text>
            </VStack>

            <Button
              leftIcon={<FiRefreshCw size={16} />}
              variant="outline"
              onClick={handleRefresh}
              isLoading={loading}
              loadingText="Atualizando..."
              size={{ base: "sm", md: "md" }}
              borderColor="primary.200"
              color="primary.900"
              borderRadius="lg"
              _hover={{
                bg: "primary.50",
                borderColor: "primary.300",
              }}
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
                  <AlertTitle fontSize={{ base: "sm", md: "md" }}>
                    Erro ao carregar artilheiros
                  </AlertTitle>
                  <AlertDescription fontSize={{ base: "xs", md: "sm" }}>
                    {error}
                  </AlertDescription>
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
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="medium"
                    color="gray.600"
                  >
                    Nenhum artilheiro encontrado
                  </Text>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    color="gray.500"
                    textAlign="center"
                    maxW="md"
                  >
                    Os artilheiros aparecerão aqui quando houver gols
                    registrados nas partidas
                  </Text>
                </VStack>
                <Button
                  leftIcon={<FiRefreshCw size={16} />}
                  variant="outline"
                  onClick={handleRefresh}
                  size="sm"
                  borderColor="primary.200"
                  color="primary.900"
                  borderRadius="lg"
                  _hover={{
                    bg: "primary.50",
                    borderColor: "primary.300",
                  }}
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
              <VStack spacing={{ base: 2, md: 3 }} align="stretch">
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
