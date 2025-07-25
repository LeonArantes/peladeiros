import React, { useEffect, useState } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  CardHeader,
  Grid,
  GridItem,
  Badge,
  Button,
  Spinner,
  Center,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Switch,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  Tag,
  TagCloseButton,
  TagLabel,
  useToast,
  FormErrorMessage,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiPhone,
  FiCalendar,
  FiUser,
  FiTarget,
  FiShield,
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiAward,
  FiUsers,
  FiLogOut,
  FiAlertCircle,
} from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import userService from "../services/userService";
import financialService from "../services/financialService";
import { useAuth } from "../context/AuthContext";
import { usePlayerStats } from "../hooks/usePlayerStats";

const Profile = () => {
  const toast = useToast();
  const { user: currentUser, logout } = useAuth();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState([]);
  const [currentMonthPayments, setCurrentMonthPayments] = useState([]);
  const [monthlyPaymentLoading, setMonthlyPaymentLoading] = useState(false);

  // Usar hook personalizado para buscar estatísticas reais
  const {
    stats,
    loading: statsLoading,
    error: statsError,
    hasStats,
  } = usePlayerStats(currentUser?.id);

  const availablePositions = [
    "Goleiro",
    "Defesa",
    "Meio-Campo",
    "Ataque",
    "Lateral",
  ];

  // Verificar se o usuário atual é admin (pode editar seu próprio perfil)
  const isAdmin = userService.isAdmin(currentUser);

  // Obter mês atual no formato YYYY-MM
  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  };

  // Formatar nome do mês para exibição
  const formatMonthName = (monthStr) => {
    try {
      const [year, month] = monthStr.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1);
      return date.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric",
      });
    } catch (error) {
      console.error("Erro ao formatar nome do mês:", error);
      return monthStr;
    }
  };

  // Buscar mensalidades do mês atual
  const fetchCurrentMonthPayments = async () => {
    try {
      setMonthlyPaymentLoading(true);
      const currentMonth = getCurrentMonth();

      const monthlyFees = await financialService.getMonthlyFeesByMonth(
        currentMonth
      );
      setCurrentMonthPayments(monthlyFees);

      console.log(
        `Mensalidades carregadas para ${formatMonthName(currentMonth)}:`,
        monthlyFees.length
      );
    } catch (error) {
      console.error("Erro ao carregar mensalidades do mês:", error);
      setCurrentMonthPayments([]);
    } finally {
      setMonthlyPaymentLoading(false);
    }
  };

  // Verificar se o usuário atual está em dia com a mensalidade
  const isCurrentUserUpToDate = () => {
    if (!currentUser?.id || !player?.is_montly_payer) {
      return true; // Se não é mensalista, considera como "em dia"
    }

    const payment = currentMonthPayments.find(
      (payment) => String(payment.player_id) === String(currentUser.id)
    );

    return payment ? payment.is_paid : false;
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm();

  // Buscar dados do jogador
  const fetchPlayer = async () => {
    if (!currentUser?.id) return;

    try {
      setLoading(true);

      // Carregar dados do player e mensalidades em paralelo
      const [playerData] = await Promise.all([
        userService.findById(currentUser.id),
        fetchCurrentMonthPayments(), // Carregar mensalidades do mês atual
      ]);

      if (playerData) {
        setPlayer(playerData);
        setSelectedPositions(playerData.playing_positions || []);

        // Preencher formulário com dados existentes
        reset({
          name: playerData.name,
          phone: formatPhoneForDisplay(playerData.phone),
          birthdate: formatDateForDisplay(playerData.birthdate),
          is_active: playerData.is_active,
          is_admin: playerData.is_admin,
          is_montly_payer: playerData.is_montly_payer,
          score: playerData.score,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do seu perfil.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayer();
  }, [currentUser?.id]);

  // Formatação de telefone para exibição
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return "";
    const phoneStr = phone.toString();
    if (phoneStr.length === 11) {
      return `(${phoneStr.slice(0, 2)}) ${phoneStr.slice(
        2,
        7
      )}-${phoneStr.slice(7)}`;
    }
    return phoneStr;
  };

  // Formatação de data para exibição no formulário
  const formatDateForDisplay = (birthdate) => {
    if (!birthdate) return "";
    const dateStr = birthdate.toString();
    if (dateStr.length === 8) {
      return `${dateStr.slice(6, 8)}/${dateStr.slice(4, 6)}/${dateStr.slice(
        0,
        4
      )}`;
    }
    return dateStr;
  };

  // Formatação de telefone enquanto digita
  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(
        7,
        11
      )}`;
    }
  };

  // Formatação de data
  const formatDate = (value) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(
        4,
        8
      )}`;
    }
  };

  // Converter dd/mm/yyyy para YYYYMMDD
  const convertDateToYYYYMMDD = (dateString) => {
    const [day, month, year] = dateString.split("/");
    return `${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`;
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

  // Gerenciar posições
  const addPosition = (position) => {
    if (!selectedPositions.includes(position)) {
      setSelectedPositions([...selectedPositions, position]);
    }
  };

  const removePosition = (position) => {
    setSelectedPositions(selectedPositions.filter((p) => p !== position));
  };

  // Validações
  const validatePhone = (phone) => {
    const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
    return phoneRegex.test(phone) || "Formato inválido. Use: (11) 99999-9999";
  };

  const validateBirthDate = (date) => {
    const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!dateRegex.test(date)) {
      return "Use o formato dd/mm/yyyy";
    }

    const [day, month, year] = date.split("/").map(Number);
    const birthDate = new Date(year, month - 1, day);
    const today = new Date();

    if (
      birthDate.getDate() !== day ||
      birthDate.getMonth() !== month - 1 ||
      birthDate.getFullYear() !== year
    ) {
      return "Data inválida";
    }

    if (birthDate > today) {
      return "Data de nascimento não pode ser no futuro";
    }

    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 16) return "Idade mínima de 16 anos";
    if (age > 100) return "Data de nascimento inválida";

    return true;
  };

  // Atualizar perfil
  const onSubmit = async (data) => {
    setUpdating(true);
    try {
      const birthdate = convertDateToYYYYMMDD(data.birthdate);
      const phone = data.phone.replace(/\D/g, "");

      const userData = {
        ...data,
        phone,
        birthdate,
        playing_positions: selectedPositions,
      };

      await userService.update(currentUser.id, userData);

      toast({
        title: "Perfil atualizado!",
        description: "Suas informações foram atualizadas com sucesso.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Recarregar dados
      await fetchPlayer();
      onClose();
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Center minH="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="primary.900" />
          <Text color="gray.600">Carregando seu perfil...</Text>
        </VStack>
      </Center>
    );
  }

  if (!player) {
    return (
      <Center minH="100vh">
        <Text color="gray.500">Não foi possível carregar seu perfil</Text>
      </Center>
    );
  }

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
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          mb={{ base: 4, md: 6 }}
          direction={{ base: "row", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <VStack align="start" spacing={0}>
            <Heading size={{ base: "md", md: "lg" }} color="primary.900">
              Meu Perfil
            </Heading>
            <Text color="gray.600" fontSize={{ base: "xs", md: "sm" }}>
              {player.name} • {calculateAge(player.birthdate)} anos
            </Text>
          </VStack>

          <HStack spacing={{ base: 2, md: 3 }}>
            <Button
              leftIcon={<FiEdit size={16} />}
              size={{ base: "sm", md: "md" }}
              variant="outline"
              borderColor="primary.200"
              color="primary.900"
              borderRadius="lg"
              _hover={{
                bg: "primary.50",
                borderColor: "primary.300",
              }}
              onClick={onOpen}
            >
              Editar
            </Button>

            <Button
              leftIcon={<FiLogOut size={16} />}
              size={{ base: "sm", md: "md" }}
              bg="primary.900"
              color="white"
              borderRadius="lg"
              _hover={{
                bg: "primary.800",
              }}
              onClick={() => logout()}
            >
              Sair
            </Button>
          </HStack>
        </Flex>

        {/* Card de Alerta para Mensalista em Atraso */}
        {player?.is_montly_payer &&
          !monthlyPaymentLoading &&
          !isCurrentUserUpToDate() && (
            <Alert
              status="warning"
              borderRadius="lg"
              mb={{ base: 4, md: 6 }}
              border="1px solid"
              borderColor="orange.200"
              bg="orange.50"
            >
              <AlertIcon as={FiAlertCircle} color="orange.500" />
              <Box flex="1">
                <AlertTitle
                  fontSize={{ base: "sm", md: "md" }}
                  color="orange.800"
                >
                  Mensalidade Pendente! 💰
                </AlertTitle>
                <AlertDescription
                  fontSize={{ base: "xs", md: "sm" }}
                  color="orange.700"
                  mt={1}
                >
                  Você é mensalista e ainda não pagou a mensalidade de{" "}
                  <Text as="span" fontWeight="semibold">
                    {formatMonthName(getCurrentMonth())}
                  </Text>
                  . Entre em contato com a administração para regularizar seu
                  pagamento.
                </AlertDescription>
              </Box>
            </Alert>
          )}

        <Grid
          templateColumns={{ base: "1fr", lg: "2fr 1fr" }}
          gap={{ base: 4, md: 6 }}
        >
          {/* Informações do Perfil */}
          <GridItem>
            <VStack spacing={{ base: 4, md: 6 }} align="stretch">
              {/* Dados Pessoais */}
              <Card
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
              >
                <CardHeader p={{ base: 4, md: 6 }}>
                  <Heading size={{ base: "sm", md: "md" }} color="primary.900">
                    Informações Pessoais
                  </Heading>
                </CardHeader>
                <CardBody pt={0} p={{ base: 4, md: 6 }}>
                  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                    <HStack spacing={{ base: 2, md: 3 }}>
                      <FiUser size={16} color="gray.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Nome Completo
                        </Text>
                        <Text
                          fontWeight="semibold"
                          color="primary.900"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {player.name}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={{ base: 2, md: 3 }}>
                      <FiPhone size={16} color="gray.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Telefone
                        </Text>
                        <Text
                          fontWeight="semibold"
                          color="primary.900"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {formatPhoneForDisplay(player.phone)}
                        </Text>
                      </VStack>
                    </HStack>

                    <HStack spacing={{ base: 2, md: 3 }}>
                      <FiCalendar size={16} color="gray.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Data de Nascimento
                        </Text>
                        <Text
                          fontWeight="semibold"
                          color="primary.900"
                          fontSize={{ base: "sm", md: "md" }}
                        >
                          {formatDateForDisplay(player.birthdate)} (
                          {calculateAge(player.birthdate)} anos)
                        </Text>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>

              {/* Dados do Jogo */}
              <Card
                borderRadius="lg"
                boxShadow="sm"
                border="1px solid"
                borderColor="gray.200"
              >
                <CardHeader p={{ base: 4, md: 6 }}>
                  <Heading size={{ base: "sm", md: "md" }} color="primary.900">
                    Dados do Jogo
                  </Heading>
                </CardHeader>
                <CardBody pt={0} p={{ base: 4, md: 6 }}>
                  <VStack spacing={{ base: 3, md: 4 }} align="stretch">
                    <HStack spacing={{ base: 2, md: 3 }}>
                      <FiTarget size={16} color="primary.600" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Pontuação
                        </Text>
                        <Badge
                          bg="primary.100"
                          color="primary.800"
                          fontSize={{ base: "sm", md: "md" }}
                          px={3}
                          py={1}
                          borderRadius="lg"
                          fontWeight="semibold"
                        >
                          {player.score || 0} pontos
                        </Badge>
                      </VStack>
                    </HStack>

                    <HStack align="start" spacing={{ base: 2, md: 3 }}>
                      <FiShield size={16} color="gray.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Posições
                        </Text>
                        <Flex wrap="wrap" gap={2} mt={1}>
                          {player.playing_positions?.length > 0 ? (
                            player.playing_positions.map((position) => (
                              <Badge
                                key={position}
                                colorScheme="green"
                                variant="subtle"
                                borderRadius="md"
                                fontSize="xs"
                              >
                                {position}
                              </Badge>
                            ))
                          ) : (
                            <Text
                              fontSize={{ base: "xs", md: "sm" }}
                              color="gray.500"
                            >
                              Nenhuma posição cadastrada
                            </Text>
                          )}
                        </Flex>
                      </VStack>
                    </HStack>

                    <HStack spacing={{ base: 2, md: 3 }}>
                      <FiDollarSign size={16} color="gray.500" />
                      <VStack align="start" spacing={0} flex={1}>
                        <Text
                          fontSize={{ base: "xs", md: "sm" }}
                          color="gray.600"
                          fontWeight="medium"
                        >
                          Situação
                        </Text>
                        <VStack align="start" spacing={1}>
                          {/* Badge de status de mensalidade */}
                          {player.is_montly_payer && !monthlyPaymentLoading && (
                            <Badge
                              colorScheme={
                                isCurrentUserUpToDate() ? "green" : "orange"
                              }
                              variant="subtle"
                              borderRadius="md"
                              fontSize="xs"
                              display="flex"
                              alignItems="center"
                              gap={1}
                            >
                              {isCurrentUserUpToDate()
                                ? "Mensalista em dia"
                                : "Pendente"}
                            </Badge>
                          )}
                        </VStack>
                      </VStack>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </GridItem>

          {/* Minhas Estatísticas */}
          <GridItem>
            <Card
              borderRadius="lg"
              boxShadow="sm"
              border="1px solid"
              borderColor="gray.200"
            >
              <CardHeader p={{ base: 4, md: 6 }}>
                <Heading size={{ base: "sm", md: "md" }} color="primary.900">
                  Minhas Estatísticas
                </Heading>
                <Text fontSize={{ base: "xs", md: "sm" }} color="gray.600">
                  {hasStats
                    ? "Dados baseados em suas partidas registradas"
                    : "Nenhuma estatística disponível"}
                </Text>
              </CardHeader>
              <CardBody pt={0} p={{ base: 4, md: 6 }}>
                {statsLoading ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <Spinner size="lg" color="primary.900" />
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.500"
                      >
                        Carregando suas estatísticas...
                      </Text>
                    </VStack>
                  </Center>
                ) : statsError ? (
                  <Alert status="warning" borderRadius="lg">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize={{ base: "xs", md: "sm" }}>
                        Erro ao carregar estatísticas
                      </AlertTitle>
                      <AlertDescription fontSize="xs">
                        {statsError}
                      </AlertDescription>
                    </Box>
                  </Alert>
                ) : !hasStats ? (
                  <Center py={8}>
                    <VStack spacing={3}>
                      <FiTarget size={32} color="gray.300" />
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.500"
                        textAlign="center"
                      >
                        Você ainda não tem estatísticas completas.
                      </Text>
                      <Text fontSize="xs" color="gray.400" textAlign="center">
                        {stats.summary.matchesPlayed > 0
                          ? "Você participou de partidas, mas dados de vitórias/derrotas não estão disponíveis."
                          : "Participe de algumas divisões de times para ver suas estatísticas aqui!"}
                      </Text>
                    </VStack>
                  </Center>
                ) : (
                  <VStack spacing={4}>
                    <Grid
                      templateColumns="1fr 1fr"
                      gap={{ base: 3, md: 4 }}
                      w="full"
                    >
                      <Stat textAlign="center">
                        <StatLabel fontSize="xs">Meus Gols</StatLabel>
                        <StatNumber
                          color="green.500"
                          fontSize={{ base: "lg", md: "2xl" }}
                        >
                          {stats.summary.goalsFor}
                        </StatNumber>
                        <StatHelpText fontSize="xs">Gols próprios</StatHelpText>
                      </Stat>

                      <Stat textAlign="center">
                        <StatLabel fontSize="xs">Gols Contra</StatLabel>
                        <StatNumber
                          color="red.500"
                          fontSize={{ base: "lg", md: "2xl" }}
                        >
                          {stats.summary.goalsAgainst}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          Gols contra meu time
                        </StatHelpText>
                      </Stat>

                      <Stat textAlign="center">
                        <StatLabel fontSize="xs">Vitórias</StatLabel>
                        <StatNumber
                          color="primary.600"
                          fontSize={{ base: "lg", md: "2xl" }}
                        >
                          {stats.summary.wins}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {stats.summary.winRate}% dos jogos
                        </StatHelpText>
                      </Stat>

                      <Stat textAlign="center">
                        <StatLabel fontSize="xs">Derrotas</StatLabel>
                        <StatNumber
                          color="orange.500"
                          fontSize={{ base: "lg", md: "2xl" }}
                        >
                          {stats.summary.losses}
                        </StatNumber>
                        <StatHelpText fontSize="xs">
                          {stats.summary.matchesPlayed > 0
                            ? Math.round(
                                (stats.summary.losses /
                                  stats.summary.matchesPlayed) *
                                  100
                              )
                            : 0}
                          % dos jogos
                        </StatHelpText>
                      </Stat>
                    </Grid>

                    {stats.summary.teamGoalsFor > 0 && (
                      <>
                        <Divider />
                        <VStack spacing={3} w="full">
                          <HStack justify="space-between" w="full">
                            <HStack spacing={2}>
                              <FiTarget size={14} color="primary.600" />
                              <Text fontSize={{ base: "xs", md: "sm" }}>
                                Gols do Meu Time
                              </Text>
                            </HStack>
                            <Badge
                              colorScheme="cyan"
                              fontSize={{ base: "xs", md: "sm" }}
                              borderRadius="md"
                            >
                              {stats.summary.teamGoalsFor}
                            </Badge>
                          </HStack>
                        </VStack>
                      </>
                    )}

                    <Divider />

                    <VStack spacing={3} w="full">
                      <HStack justify="space-between" w="full">
                        <HStack spacing={2}>
                          <FiUsers size={14} color="primary.600" />
                          <Text fontSize={{ base: "xs", md: "sm" }}>
                            Partidas Jogadas
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme="purple"
                          fontSize={{ base: "xs", md: "sm" }}
                          borderRadius="md"
                        >
                          {stats.summary.matchesPlayed}
                        </Badge>
                      </HStack>

                      {stats.matches.draws > 0 && (
                        <HStack justify="space-between" w="full">
                          <HStack spacing={2}>
                            <Text fontSize={{ base: "xs", md: "sm" }}>
                              Empates
                            </Text>
                          </HStack>
                          <Badge
                            colorScheme="gray"
                            fontSize={{ base: "xs", md: "sm" }}
                            borderRadius="md"
                          >
                            {stats.matches.draws}
                          </Badge>
                        </HStack>
                      )}

                      <HStack justify="space-between" w="full">
                        <HStack spacing={2}>
                          <FiAward size={14} color="primary.600" />
                          <Text fontSize={{ base: "xs", md: "sm" }}>
                            Meu Aproveitamento
                          </Text>
                        </HStack>
                        <Badge
                          colorScheme={
                            stats.summary.winRate >= 60
                              ? "green"
                              : stats.summary.winRate >= 40
                              ? "yellow"
                              : "red"
                          }
                          fontSize={{ base: "xs", md: "sm" }}
                          borderRadius="md"
                        >
                          {stats.summary.winRate}%
                        </Badge>
                      </HStack>
                    </VStack>
                  </VStack>
                )}
              </CardBody>
            </Card>
          </GridItem>
        </Grid>

        {/* Modal de Edição */}
        <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
          <ModalOverlay />
          <ModalContent mx={4} borderRadius="lg">
            <ModalHeader color="primary.900">Editar Meu Perfil</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit(onSubmit)}>
                <VStack spacing={4} align="stretch">
                  {/* Nome */}
                  <FormControl isInvalid={errors.name}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Nome Completo
                    </FormLabel>
                    <Input
                      {...register("name", {
                        required: "Nome é obrigatório",
                        minLength: {
                          value: 2,
                          message: "Nome deve ter pelo menos 2 caracteres",
                        },
                      })}
                      placeholder="Digite o nome completo"
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                    />
                    <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Telefone */}
                  <FormControl isInvalid={errors.phone}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Telefone
                    </FormLabel>
                    <Input
                      {...register("phone", {
                        required: "Telefone é obrigatório",
                        validate: validatePhone,
                        onChange: (e) => {
                          e.target.value = formatPhone(e.target.value);
                        },
                      })}
                      placeholder="(11) 99999-9999"
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                    />
                    <FormErrorMessage>{errors.phone?.message}</FormErrorMessage>
                  </FormControl>

                  {/* Data de Nascimento */}
                  <FormControl isInvalid={errors.birthdate}>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Data de Nascimento
                    </FormLabel>
                    <Input
                      {...register("birthdate", {
                        required: "Data de nascimento é obrigatória",
                        validate: validateBirthDate,
                        onChange: (e) => {
                          e.target.value = formatDate(e.target.value);
                        },
                      })}
                      placeholder="dd/mm/yyyy"
                      maxLength={10}
                      borderRadius="lg"
                      _focus={{
                        borderColor: "primary.900",
                        boxShadow: "0 0 0 1px primary.900",
                      }}
                    />
                    <FormErrorMessage>
                      {errors.birthdate?.message}
                    </FormErrorMessage>
                  </FormControl>

                  {/* Score */}
                  <FormControl>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Pontuação
                    </FormLabel>
                    <Controller
                      name="score"
                      control={control}
                      render={({ field }) => (
                        <NumberInput {...field} min={0} max={1000}>
                          <NumberInputField
                            borderRadius="lg"
                            _focus={{
                              borderColor: "primary.900",
                              boxShadow: "0 0 0 1px primary.900",
                            }}
                          />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      )}
                    />
                  </FormControl>

                  {/* Posições */}
                  <FormControl>
                    <FormLabel color="primary.900" fontWeight="semibold">
                      Posições
                    </FormLabel>
                    <VStack align="start" spacing={3}>
                      <HStack spacing={2} w="full">
                        <Select
                          placeholder="Selecione uma posição"
                          borderRadius="lg"
                          w="full"
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                          onChange={(e) => {
                            if (e.target.value) {
                              addPosition(e.target.value);
                              e.target.value = "";
                            }
                          }}
                        >
                          {availablePositions
                            .filter((pos) => !selectedPositions.includes(pos))
                            .map((position) => (
                              <option key={position} value={position}>
                                {position}
                              </option>
                            ))}
                        </Select>
                      </HStack>

                      <Flex wrap="wrap" gap={2}>
                        {selectedPositions.map((position) => (
                          <Tag
                            key={position}
                            size="lg"
                            bg="primary.100"
                            color="primary.800"
                            borderRadius="lg"
                          >
                            <TagLabel>{position}</TagLabel>
                            <TagCloseButton
                              onClick={() => removePosition(position)}
                            />
                          </Tag>
                        ))}
                      </Flex>
                    </VStack>
                  </FormControl>

                  {/* Configurações - só para admins */}
                  {isAdmin && (
                    <VStack spacing={4}>
                      <FormControl display="flex" alignItems="center">
                        <FormLabel
                          htmlFor="is_active"
                          mb="0"
                          flex="1"
                          color="primary.900"
                          fontWeight="semibold"
                        >
                          Jogador Ativo
                        </FormLabel>
                        <Controller
                          name="is_active"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="is_active"
                              isChecked={field.value}
                              onChange={field.onChange}
                              colorScheme="green"
                            />
                          )}
                        />
                      </FormControl>

                      <FormControl display="flex" alignItems="center">
                        <FormLabel
                          htmlFor="is_montly_payer"
                          mb="0"
                          flex="1"
                          color="primary.900"
                          fontWeight="semibold"
                        >
                          Mensalista
                        </FormLabel>
                        <Controller
                          name="is_montly_payer"
                          control={control}
                          render={({ field }) => (
                            <Switch
                              id="is_montly_payer"
                              isChecked={field.value}
                              onChange={field.onChange}
                              colorScheme="green"
                            />
                          )}
                        />
                      </FormControl>
                    </VStack>
                  )}
                </VStack>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button
                variant="outline"
                mr={3}
                onClick={onClose}
                borderRadius="lg"
                flex={1}
              >
                Cancelar
              </Button>
              <Button
                bg="primary.900"
                color="white"
                onClick={handleSubmit(onSubmit)}
                isLoading={updating}
                loadingText="Salvando..."
                borderRadius="lg"
                flex={1}
                _hover={{ bg: "primary.800" }}
              >
                Salvar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Container>
    </Box>
  );
};

export default Profile;
