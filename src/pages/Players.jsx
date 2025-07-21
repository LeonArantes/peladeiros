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
    p={4}
    bg="white"
    borderRadius="lg"
    border="1px solid"
    borderColor="gray.200"
    shadow="sm"
    mb={4}
  >
    <HStack spacing={4} align="start">
      {/* Avatar skeleton */}
      <SkeletonCircle size="12" />

      {/* Informações do jogador skeleton */}
      <VStack spacing={2} align="start" flex={1}>
        <VStack spacing={1} align="start">
          <Skeleton height="18px" width="200px" />
          <Skeleton height="14px" width="60px" />
        </VStack>
        <HStack spacing={2}>
          <Skeleton height="20px" width="50px" borderRadius="md" />
          <Skeleton height="20px" width="70px" borderRadius="md" />
        </HStack>
        <HStack spacing={4}>
          <Skeleton height="16px" width="80px" />
          <Skeleton height="16px" width="60px" />
        </HStack>
      </VStack>

      {/* Seta skeleton */}
      <Skeleton height="20px" width="20px" />
    </HStack>
  </Box>
);

/**
 * Componente que renderiza múltiplos skeletons
 */
const PlayersLoadingSkeleton = ({ count = 6 }) => (
  <VStack spacing={4} align="stretch">
    {Array.from({ length: count }, (_, index) => (
      <PlayerCardSkeleton key={index} />
    ))}
  </VStack>
);

const Players = () => {
  const [loading, setLoading] = useState(true);
  const [players, setPlayers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { user: currentUser } = useAuth();
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
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.xl" px={4} py={6}>
        {/* Header */}
        <HStack
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          mb={6}
        >
          <Heading size="lg" color="gray.800">
            Jogadores
          </Heading>

          <Button
            bg="black"
            color="white"
            size="lg"
            borderRadius="full"
            p={0}
            m={0}
            justifyContent="center"
            alignItems="center"
            _hover={{
              bg: "gray.800",
            }}
            onClick={() => navigate("/create-player")}
          >
            <FiPlus />
          </Button>
        </HStack>

        {/* Search Bar */}
        <Box mb={6}>
          <InputGroup size="lg">
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar jogadores por nome..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              bg="white"
              border="1px solid"
              borderColor="gray.300"
              _hover={{ borderColor: "gray.400" }}
              _focus={{
                borderColor: "blue.500",
                boxShadow: "0 0 0 1px #3182CE",
              }}
            />
            {searchQuery && (
              <InputRightElement>
                <IconButton
                  icon={<FiX />}
                  size="sm"
                  variant="ghost"
                  onClick={clearSearch}
                  aria-label="Limpar pesquisa"
                  _hover={{ bg: "gray.100" }}
                />
              </InputRightElement>
            )}
          </InputGroup>
        </Box>

        {/* Indicador de resultados */}
        {!loading && searchQuery && (
          <Text fontSize="sm" color="gray.600" mb={4}>
            {filteredPlayers.length === 0
              ? "Nenhum jogador encontrado"
              : filteredPlayers.length === 1
              ? "1 jogador encontrado"
              : `${filteredPlayers.length} jogadores encontrados`}
            {searchQuery && ` para "${searchQuery}"`}
          </Text>
        )}

        {loading ? (
          <PlayersLoadingSkeleton count={6} />
        ) : (
          <VStack spacing={4} align="stretch">
            {filteredPlayers.map((player) => (
              <PlayerCard key={player.id} player={player} />
            ))}

            {/* Estado vazio quando não há jogadores */}
            {players.length === 0 && (
              <Box textAlign="center" py={8}>
                <Text color="gray.500" fontSize="lg">
                  Nenhum jogador encontrado
                </Text>
                <Text color="gray.400" fontSize="sm" mt={2}>
                  Os jogadores aparecerão aqui quando estiverem disponíveis
                </Text>
              </Box>
            )}

            {/* Estado vazio quando a busca não retorna resultados */}
            {players.length > 0 &&
              filteredPlayers.length === 0 &&
              searchQuery && (
                <Box textAlign="center" py={8}>
                  <Text color="gray.500" fontSize="lg">
                    Nenhum jogador encontrado
                  </Text>
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Tente buscar com um nome diferente ou{" "}
                    <Text
                      as="span"
                      color="blue.500"
                      cursor="pointer"
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
