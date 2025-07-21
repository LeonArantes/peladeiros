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
  const borderColor = useColorModeValue("gray.100", "gray.100");

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
      borderRadius="md"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      mb={0}
      overflow="hidden"
    >
      <CardBody p={6}>
        <VStack spacing={4} align="stretch">
          {/* Header com dia da semana */}

          {match.status === "Finalizada" ? (
            <>
              <Flex align="center" gap={2}>
                <FiCalendar size={20} color="#38A169" />
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {format(matchDate, "dd/MM/yyyy (EEEE)", { locale: ptBR })}
                </Text>
              </Flex>
              {loadingScore ? (
                <Box
                  bg="white"
                  borderRadius="xl"
                  p={4}
                  border="1px"
                  borderColor="gray.200"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH="20"
                >
                  <VStack spacing={2}>
                    <Spinner size="sm" color="blue.500" />
                    <Text fontSize="xs" color="gray.500">
                      Carregando placar...
                    </Text>
                  </VStack>
                </Box>
              ) : scoreError ? (
                <Box
                  bg="white"
                  borderRadius="xl"
                  p={4}
                  border="1px"
                  borderColor="orange.200"
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  minH="20"
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
              <Flex align="center" gap={2}>
                <FiCalendar size={20} color="#38A169" />
                <Text fontSize="lg" fontWeight="bold" color="gray.800">
                  {format(matchDate, "EEEE", { locale: ptBR })}
                </Text>
              </Flex>
              {/* Horário e Local */}
              <HStack spacing={4}>
                <HStack spacing={2}>
                  <FiMapPin size={18} color="gray.600" />
                  <Text fontSize="md" color="gray.600">
                    {match.local || "Local não informado"}
                  </Text>
                </HStack>
                <HStack spacing={2}>
                  <FiClock size={18} color="gray.600" />
                  <Text fontSize="md" color="gray.600">
                    {format(matchDate, "dd/MM HH:mm")}
                  </Text>
                </HStack>
              </HStack>

              {/* Informações da partida */}
              <HStack justify="space-between" mt={4}>
                {/* Formato */}
                <VStack spacing={1} align="center">
                  <HStack spacing={1}>
                    <FiUsers size={18} color="#38A169" />
                    <Text fontSize="xs" color="gray.500">
                      Formato
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {match.players_per_team || 0}x{match.players_per_team || 0}
                  </Text>
                </VStack>

                {/* Confirmados */}
                <VStack spacing={1} align="center">
                  <HStack spacing={1}>
                    <Box w={3} h={3} bg="green.500" borderRadius="full" />
                    <Text fontSize="xs" color="gray.500">
                      Confirmados
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {currentPlayers}
                  </Text>
                </VStack>
                <VStack spacing={1} align="center">
                  <HStack spacing={1}>
                    <FiCalendar size={18} color="#38A169" />
                    <Text fontSize="xs" color="gray.500">
                      Lista abre
                    </Text>
                  </HStack>
                  <Text fontSize="md" fontWeight="semibold" color="gray.800">
                    {registrationDate
                      ? format(registrationDate, "dd/MM/yyyy")
                      : "--/--/----"}
                  </Text>
                </VStack>
              </HStack>

              {/* Vagas restantes */}
              <Flex justify="center" align="center" mt={2}>
                <HStack spacing={2}>
                  <Box
                    w={8}
                    h={8}
                    bg={vagasRestantes > 0 ? "orange.100" : "red.100"}
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="bold"
                      color={vagasRestantes > 0 ? "orange.600" : "red.600"}
                    >
                      {Math.max(0, vagasRestantes)}
                    </Text>
                  </Box>
                  <Text fontSize="sm" color="gray.600">
                    {vagasRestantes > 0 ? "Vagas restantes" : "Lista lotada"}
                  </Text>
                </HStack>
              </Flex>
            </>
          )}

          <Button
            variant="outline"
            leftIcon={<FiEye />}
            size="md"
            borderRadius="lg"
            color="gray.600"
            borderColor="gray.300"
            _hover={{
              bg: "gray.50",
              borderColor: "gray.400",
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
