import {
  Box,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Button,
  Flex,
  Badge,
  useColorModeValue,
  Spinner,
} from "@chakra-ui/react";
import { FiCalendar, FiClock, FiMapPin, FiUsers, FiEye } from "react-icons/fi";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import MatchScoreCard from "./MatchScoreCard";
import { useMatchScore } from "../hooks/useMatchScore";

const MatchCard = ({ match, onViewDetails }) => {
  const cardBg = useColorModeValue("white", "gray.800");

  // Usar hook personalizado para buscar placar real
  const {
    score: realScore,
    loading: loadingScore,
    error: scoreError,
  } = useMatchScore(match?.id, match?.status === "Finalizada");

  // Verificações de segurança para evitar erros
  if (!match || !match.date) {
    return null;
  }

  // Converter data do Firebase para Date
  const matchDate = match.date.toDate
    ? match.date.toDate()
    : new Date(match.date);

  // Calcular vagas restantes
  const maxPlayers = match.max_players || 0;
  const currentPlayers = match.current_players || 0;
  const vagasRestantes = maxPlayers - currentPlayers;

  // Formatar data de abertura da lista
  const registrationDate = match.registration_start_date?.toDate
    ? match.registration_start_date.toDate()
    : match.registration_start_date
    ? new Date(match.registration_start_date)
    : null;

  // Remover o useEffect antigo pois agora usamos o hook

  return (
    <Card
      bg={cardBg}
      borderRadius="lg"
      boxShadow="sm"
      border="1px"
      borderColor="gray.200"
      mb={0}
      overflow="hidden"
    >
      <CardBody p={{ base: 4, md: 6 }}>
        <VStack spacing={{ base: 3, md: 4 }} align="stretch">
          {/* Header com dia da semana */}

          {match.status === "Finalizada" ? (
            <>
              <Flex align="center" gap={2}>
                <FiCalendar
                  style={{ width: 16, height: 16 }}
                  color="primary.900"
                />
                <Text
                  fontSize={{ base: "md", md: "lg" }}
                  fontWeight="bold"
                  color="primary.900"
                >
                  {format(matchDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                </Text>
              </Flex>
              {loadingScore ? (
                <Box
                  bg="white"
                  borderRadius="lg"
                  p={{ base: 3, md: 4 }}
                  border="1px"
                  borderColor="gray.200"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH={{ base: "16", md: "20" }}
                >
                  <VStack spacing={2}>
                    <Spinner size="sm" color="primary.900" />
                    <Text fontSize="xs" color="gray.500">
                      Carregando placar...
                    </Text>
                  </VStack>
                </Box>
              ) : scoreError ? (
                <Box
                  bg="white"
                  borderRadius="lg"
                  p={{ base: 3, md: 4 }}
                  border="1px"
                  borderColor="orange.200"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH={{ base: "16", md: "20" }}
                >
                  <VStack spacing={2}>
                    <Text fontSize="sm" color="orange.600" textAlign="center">
                      ⚠️ Erro ao carregar placar
                    </Text>
                    <Text fontSize="xs" color="gray.500" textAlign="center">
                      Exibindo 0 × 0
                    </Text>
                  </VStack>
                </Box>
              ) : (
                <MatchScoreCard score={realScore} />
              )}
            </>
          ) : (
            <>
              {/* Header - Dia da semana */}
              <Flex justify="space-between" align="center">
                <HStack spacing={2}>
                  <FiCalendar
                    style={{ width: 16, height: 16 }}
                    color="primary.900"
                  />
                  <Text
                    fontSize={{ base: "md", md: "lg" }}
                    fontWeight="bold"
                    color="primary.900"
                  >
                    {format(matchDate, "EEEE HH:mm", { locale: ptBR })}
                  </Text>
                </HStack>

                <Badge
                  colorScheme={vagasRestantes > 0 ? "green" : "red"}
                  fontSize="xs"
                  px={2}
                  py={0.5}
                  borderRadius="full"
                >
                  {vagasRestantes > 0 ? `${vagasRestantes} vagas` : "Lotado"}
                </Badge>
              </Flex>

              {/* Data e Horário - Seção Principal */}
              <Box
                bg="gray.50"
                borderRadius="md"
                p={{ base: 2.5, md: 3 }}
                border="1px solid"
                borderColor="gray.200"
              >
                <VStack spacing={1.5} align="stretch">
                  <HStack spacing={2}>
                    <FiMapPin
                      style={{ width: 14, height: 14 }}
                      color="gray.600"
                    />
                    <Text
                      fontSize={{ base: "sm", md: "sm" }}
                      color="gray.700"
                      fontWeight="medium"
                      noOfLines={1}
                    >
                      {match.local || "Local não informado"}
                    </Text>
                  </HStack>

                  {/* <HStack spacing={2}>
                    <FiClock
                      style={{ width: 14, height: 14 }}
                      color="gray.600"
                    />
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      color="primary.900"
                      fontWeight="semibold"
                    >
                      {format(matchDate, "dd/MM/yyyy 'às' HH:mm")}
                    </Text>
                  </HStack> */}

                  <Text fontSize="xs" color="gray.500" fontWeight="medium">
                    Lista abre:{" "}
                    <b>
                      {registrationDate
                        ? format(registrationDate, "dd/MM 'às' HH:mm")
                        : "Não informado"}
                    </b>
                  </Text>
                </VStack>
              </Box>

              {/* Informações da Partida - Grid Compacto */}
              <Box
                display="grid"
                gridTemplateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }}
                gap={{ base: 3, md: 4 }}
                py={{ base: 1, md: 2 }}
              >
                {/* Formato do Jogo */}
                <VStack spacing={1.5} align="center">
                  <Box
                    w={8}
                    h={8}
                    bg="primary.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiUsers
                      style={{ width: 16, height: 16 }}
                      color="primary.900"
                    />
                  </Box>
                  <VStack spacing={0} align="center">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Formato
                    </Text>
                    <Text
                      fontSize={{ base: "sm", md: "md" }}
                      fontWeight="bold"
                      color="primary.900"
                    >
                      {match.players_per_team || 0}x
                      {match.players_per_team || 0}
                    </Text>
                  </VStack>
                </VStack>

                {/* Jogadores Confirmados */}
                <VStack spacing={1.5} align="center">
                  <Box
                    w={8}
                    h={8}
                    bg="green.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="md" fontWeight="bold" color="green.600">
                      {currentPlayers}
                    </Text>
                  </Box>
                  <VStack spacing={0} align="center">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Confirmados
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      de {maxPlayers} vagas
                    </Text>
                  </VStack>
                </VStack>

                {/* Lista de Inscrição */}
                {/* <VStack
                  spacing={1.5}
                  align="center"
                  gridColumn={{ base: "1 / -1", md: "auto" }}
                >
                  <Box
                    w={8}
                    h={8}
                    bg="blue.100"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <FiCalendar
                      style={{ width: 16, height: 16 }}
                      color="blue.600"
                    />
                  </Box>
                  <VStack spacing={0} align="center">
                    <Text fontSize="xs" color="gray.500" fontWeight="medium">
                      Lista abre em
                    </Text>
                    <Text
                      fontSize={{ base: "xs", md: "sm" }}
                      fontWeight="semibold"
                      color="blue.600"
                      textAlign="center"
                    >
                      {registrationDate
                        ? format(registrationDate, "dd/MM 'às' HH:mm")
                        : "Não informado"}
                    </Text>
                  </VStack> */}
                {/* </VStack> */}
              </Box>
            </>
          )}

          <Button
            variant="outline"
            leftIcon={<FiEye size={16} />}
            size={{ base: "sm", md: "md" }}
            borderRadius="lg"
            color="primary.900"
            borderColor="primary.200"
            bg="transparent"
            _hover={{
              bg: "primary.50",
              borderColor: "primary.300",
            }}
            _active={{
              bg: "primary.100",
            }}
            onClick={() => onViewDetails && onViewDetails(match)}
          >
            Ver Detalhes
          </Button>
        </VStack>
      </CardBody>
    </Card>
  );
};

export default MatchCard;
