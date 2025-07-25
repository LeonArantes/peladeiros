import {
  Box,
  Button,
  Container,
  Heading,
  HStack,
  Text,
  VStack,
  Skeleton,
  SkeletonCircle,
  Spacer,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import userService from "../services/userService";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import PlayerCard from "../components/PlayerCard";
import { FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

/**
 * Componente Skeleton que imita a estrutura do PlayerCard
 */
const PlayerCardSkeleton = () => (
  <Box
    p={{ base: 3, md: 4 }}
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    boxShadow="sm"
    mb={{ base: 3, md: 4 }}
  >
    <HStack spacing={{ base: 3, md: 4 }} align="start">
      {/* Avatar skeleton */}
      <SkeletonCircle size={{ base: "10", md: "12" }} flexShrink={0} />

      {/* Informações do jogador skeleton */}
      <VStack spacing={{ base: 1, md: 2 }} align="start" flex={1} minW={0}>
        <VStack spacing={1} align="start" w="full">
          <Skeleton height="16px" width={{ base: "120px", md: "160px" }} />
          <Skeleton height="12px" width="50px" />
        </VStack>
        <HStack spacing={{ base: 1, md: 2 }} wrap="wrap" w="full">
          <Skeleton height="18px" width="45px" borderRadius="md" />
          <Skeleton height="18px" width="70px" borderRadius="md" />
        </HStack>
        <HStack spacing={{ base: 3, md: 4 }} w="full">
          <Skeleton height="14px" width="60px" />
          <Skeleton height="14px" width="30px" />
        </HStack>
      </VStack>

      {/* Seta skeleton */}
      <Skeleton height="16px" width="16px" flexShrink={0} />
    </HStack>
  </Box>
);

/**
 * Componente que renderiza múltiplos skeletons
 */
const PlayersLoadingSkeleton = ({ count = 6 }) => (
  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
    {Array.from({ length: count }, (_, index) => (
      <PlayerCardSkeleton key={index} />
    ))}
  </VStack>
);

const Players = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser, isAdmin } = useAuth();
  const userIsAdmin = isAdmin();
  const navigate = useNavigate();

  const fetchPlayers = async () => {
    try {
      const allPlayers = await userService.findAll();
      // Filtrar o usuário logado da lista
      const otherPlayers = allPlayers.filter(
        (player) => player.id !== currentUser?.id
      );
      setPlayers(otherPlayers);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, [currentUser?.id]);

  // Filtrar jogadores com base na pesquisa
  const filteredPlayers = players.filter((player) =>
    player.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Limpar pesquisa
  const clearSearch = () => {
    setSearchQuery("");
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
        <HStack
          w="100%"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={{ base: 4, md: 6 }}
        >
          <Box flex="1" mr={{ base: 3, md: 4 }}>
            <Heading
              size={{ base: "lg", md: "xl" }}
              color="primary.900"
              mb={{ base: 1, md: 2 }}
              lineHeight="shorter"
            >
              Jogadores
            </Heading>
            <Text
              color="gray.600"
              fontSize={{ base: "sm", md: "md" }}
              lineHeight="base"
            >
              Visualize e gerencie todos os jogadores
            </Text>
          </Box>

          {userIsAdmin && (
            <Button
              bg="primary.900"
              color="white"
              size={{ base: "md", md: "lg" }}
              borderRadius="full"
              w={{ base: "48px", md: "56px" }}
              h={{ base: "48px", md: "56px" }}
              minW="auto"
              p={0}
              display="flex"
              justifyContent="center"
              alignItems="center"
              _hover={{
                bg: "primary.800",
                transform: "scale(1.05)",
              }}
              _active={{
                transform: "scale(0.95)",
              }}
              transition="all 0.2s"
              onClick={() => navigate("/create-player")}
            >
              <FiPlus size={{ base: 20, md: 24 }} />
            </Button>
          )}
        </HStack>

        {/* Search Bar */}
        <Box mb={{ base: 4, md: 6 }}>
          <InputGroup size={{ base: "md", md: "lg" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" size={16} />
            </InputLeftElement>
            <Input
              placeholder="Buscar jogadores por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="lg"
              fontSize={{ base: "sm", md: "md" }}
              _hover={{
                borderColor: "gray.300",
              }}
              _focus={{
                borderColor: "primary.900",
                boxShadow: "0 0 0 1px primary.900",
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  icon={<FiX size={14} />}
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  aria-label="Limpar pesquisa"
                  borderRadius="lg"
                  _hover={{ bg: "gray.100" }}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </Box>

        {/* Indicador de resultados */}
        {!loading && searchQuery && (
          <Text
            fontSize={{ base: "xs", md: "sm" }}
            color="gray.600"
            mb={{ base: 3, md: 4 }}
            fontWeight="medium"
          >
            {filteredPlayers.length === 0
              ? "Nenhum jogador encontrado"
              : filteredPlayers.length === 1
              ? "1 jogador encontrado"
              : `${filteredPlayers.length} jogadores encontrados`}
            {searchQuery && (
              <Text as="span" color="primary.900" fontWeight="semibold">
                {` para "${searchQuery}"`}
              </Text>
            )}
          </Text>
        )}

        {loading ? (
          <PlayersLoadingSkeleton count={6} />
        ) : (
          <VStack spacing={{ base: 3, md: 4 }} align="stretch">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}

            {/* Estado vazio quando não há jogadores */}
            {players.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text
                  color="gray.500"
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="medium"
                >
                  Nenhum jogador encontrado
                </Text>
                <Text
                  color="gray.400"
                  fontSize={{ base: "sm", md: "md" }}
                  mt={2}
                >
                  Os jogadores aparecerão aqui quando estiverem disponíveis
                </Text>
              </Box>
            )}

            {/* Estado vazio quando a busca não retorna resultados */}
            {players.length > 0 &&
              filteredPlayers.length === 0 &&
              searchQuery && (
                <Box textAlign="center" py={8}>
                  <Text
                    color="gray.500"
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="medium"
                  >
                    Nenhum jogador encontrado
                  </Text>
                  <Text
                    color="gray.400"
                    fontSize={{ base: "sm", md: "md" }}
                    mt={2}
                  >
                    Tente buscar com um nome diferente ou{" "}
                    <Text
                      as="span"
                      color="primary.900"
                      cursor="pointer"
                      fontWeight="semibold"
                      onClick={clearSearch}
                      _hover={{ textDecoration: "underline" }}
                    >
                      limpe a pesquisa
                    </Text>{" "}
                    para ver todos os jogadores
                  </Text>
                </Box>
              )}
          </VStack>
        )}
      </Container>
    </Box>
  );
};

export default Players;
