import {
  Box,
  Button,
  Card,
  CardBody,
  Container,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Select,
  VStack,
  Heading,
  Text,
  HStack,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Center,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createMatch } from "../api/matchService";
import { useAuth } from "../context/AuthContext";

const CreateMatch = () => {
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm();

  const navigate = useNavigate();
  const toast = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const { isAdmin } = useAuth();
  const userIsAdmin = isAdmin();

  // Verificar se o usuário é admin ao carregar a página
  useEffect(() => {
    if (!userIsAdmin) {
      toast({
        title: "Acesso negado",
        description: "Apenas administradores podem criar partidas.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      navigate("/");
    }
  }, [userIsAdmin, navigate, toast]);

  // Se não for admin, mostrar mensagem de erro
  if (!userIsAdmin) {
    return (
      <Box minH="100vh" bg="gray.50" pb={{ base: "24", md: "80px" }}>
        <Container maxW="container.md" px={4} py={6}>
          <Center>
            <Alert status="error" borderRadius="lg" maxW="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Acesso Negado!</AlertTitle>
                <AlertDescription>
                  Apenas administradores podem criar partidas.
                </AlertDescription>
              </Box>
            </Alert>
          </Center>
        </Container>
      </Box>
    );
  }

  // Observar mudanças na data da pelada
  const watchedDate = watch("date");

  // Calcular automaticamente data e horário de início da lista (3 dias antes às 18h)
  useEffect(() => {
    if (watchedDate) {
      const matchDate = new Date(watchedDate);

      // Calcular 3 dias antes
      const registrationStartDate = new Date(matchDate);
      registrationStartDate.setDate(matchDate.getDate() - 2);

      // Formatar data para o input (YYYY-MM-DD)
      const formattedDate = registrationStartDate.toISOString().split("T")[0];

      // Definir horário às 18h
      const formattedTime = "18:00";

      // Atualizar os campos automaticamente
      setValue("dataInicioLista", formattedDate);
      setValue("horarioInicioLista", formattedTime);
    }
  }, [watchedDate, setValue]);

  // Opções de locais (pode ser dinâmico no futuro)
  const locations = [
    "Gardens",
    "Sitio Dudu",
    "Rodoviária",
    "Exposição",
    "Campo Balança",
  ];

  const onSubmit = async (data) => {
    setIsCreating(true);

    try {
      const matchData = {
        local: data.local,
        date: new Date(`${data.date}T${data.time}`),
        max_players: parseInt(data.vagasTotais),
        players_per_team: parseInt(data.jogadoresPorTime),
        registration_start_date: new Date(
          `${data.dataInicioLista}T${data.horarioInicioLista}`
        ),
        current_players: 0,
        created_at: new Date(),
      };

      await createMatch(matchData);

      toast({
        title: "Pelada criada com sucesso!",
        description: "A nova pelada foi adicionada à lista",
        status: "success",
        duration: 3000,
        position: "top",
        isClosable: true,
      });

      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao criar pelada",
        description: error.message || "Tente novamente",
        status: "error",
        position: "top",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsCreating(false);
    }
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
        <VStack spacing={{ base: 4, md: 6 }} align="stretch">
          {/* Header */}
          <HStack spacing={{ base: 3, md: 4 }} mb={{ base: 2, md: 4 }}>
            <IconButton
              icon={<FiArrowLeft size={18} />}
              variant="ghost"
              size={{ base: "md", md: "lg" }}
              aria-label="Voltar"
              onClick={() => navigate("/")}
              borderRadius="lg"
              color="primary.900"
              _hover={{ bg: "primary.50" }}
            />
            <Box>
              <Heading
                size={{ base: "md", md: "lg" }}
                color="primary.900"
                lineHeight="shorter"
              >
                Nova Pelada
              </Heading>
              <Text
                color="gray.600"
                fontSize={{ base: "sm", md: "md" }}
                lineHeight="base"
              >
                Configure os detalhes da nova partida
              </Text>
            </Box>
          </HStack>

          {/* Formulário */}
          <Card
            borderRadius="lg"
            boxShadow="sm"
            border="1px solid"
            borderColor="gray.200"
          >
            <CardBody p={{ base: 4, md: 6 }}>
              <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={{ base: 4, md: 6 }} align="stretch">
                    {/* Local */}
                    <FormControl isInvalid={errors.local}>
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Local
                      </FormLabel>
                      <Select
                        placeholder="Selecione o local"
                        size={{ base: "md", md: "lg" }}
                        bg="white"
                        border="1px solid"
                        borderColor="gray.200"
                        borderRadius="lg"
                        _hover={{ borderColor: "gray.300" }}
                        _focus={{
                          borderColor: "primary.900",
                          boxShadow: "0 0 0 1px primary.900",
                        }}
                        {...register("local", {
                          required: "Local é obrigatório",
                        })}
                      >
                        {locations.map((location) => (
                          <option key={location} value={location}>
                            {location}
                          </option>
                        ))}
                      </Select>
                      <FormErrorMessage>
                        {errors.local && errors.local.message}
                      </FormErrorMessage>
                    </FormControl>

                    {/* Data e Horário */}
                    <FormControl isInvalid={errors.date || errors.time}>
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Data e Horário da Pelada
                      </FormLabel>
                      <HStack spacing={{ base: 2, md: 3 }}>
                        <Input
                          type="date"
                          size={{ base: "md", md: "lg" }}
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                          {...register("date", {
                            required: "Data é obrigatória",
                          })}
                        />
                        <Input
                          type="time"
                          size={{ base: "md", md: "lg" }}
                          bg="white"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                          {...register("time", {
                            required: "Horário é obrigatório",
                          })}
                        />
                      </HStack>
                      <FormErrorMessage>
                        {(errors.date && errors.date.message) ||
                          (errors.time && errors.time.message)}
                      </FormErrorMessage>
                    </FormControl>

                    {/* Vagas Totais */}
                    <FormControl isInvalid={errors.vagasTotais}>
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Vagas Totais
                      </FormLabel>
                      <Controller
                        name="vagasTotais"
                        control={control}
                        defaultValue={14}
                        rules={{
                          required: "Número de vagas é obrigatório",
                          min: { value: 2, message: "Mínimo 2 jogadores" },
                          max: { value: 50, message: "Máximo 50 jogadores" },
                        }}
                        render={({ field }) => (
                          <NumberInput
                            {...field}
                            size={{ base: "md", md: "lg" }}
                            min={2}
                            max={50}
                            bg="white"
                          >
                            <NumberInputField
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="lg"
                              _hover={{ borderColor: "gray.300" }}
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
                      <FormErrorMessage>
                        {errors.vagasTotais && errors.vagasTotais.message}
                      </FormErrorMessage>
                    </FormControl>

                    {/* Jogadores por Time */}
                    <FormControl isInvalid={errors.jogadoresPorTime}>
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Jogadores por Time
                      </FormLabel>
                      <Controller
                        name="jogadoresPorTime"
                        control={control}
                        defaultValue={7}
                        rules={{
                          required:
                            "Número de jogadores por time é obrigatório",
                          min: {
                            value: 1,
                            message: "Mínimo 1 jogador por time",
                          },
                          max: {
                            value: 25,
                            message: "Máximo 25 jogadores por time",
                          },
                        }}
                        render={({ field }) => (
                          <NumberInput
                            {...field}
                            size={{ base: "md", md: "lg" }}
                            min={1}
                            max={25}
                            bg="white"
                          >
                            <NumberInputField
                              border="1px solid"
                              borderColor="gray.200"
                              borderRadius="lg"
                              _hover={{ borderColor: "gray.300" }}
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
                      <FormErrorMessage>
                        {errors.jogadoresPorTime &&
                          errors.jogadoresPorTime.message}
                      </FormErrorMessage>
                    </FormControl>

                    {/* Data e Horário de Início da Lista de Presença */}
                    <FormControl
                      isInvalid={
                        errors.dataInicioLista || errors.horarioInicioLista
                      }
                    >
                      <FormLabel
                        color="primary.900"
                        fontWeight="semibold"
                        fontSize={{ base: "sm", md: "md" }}
                      >
                        Data e Horário de Início da Lista de Presença
                      </FormLabel>
                      <Text
                        fontSize={{ base: "xs", md: "sm" }}
                        color="gray.500"
                        mb={2}
                      >
                        Automaticamente definido para 3 dias antes da pelada às
                        18h
                      </Text>
                      <HStack spacing={{ base: 2, md: 3 }}>
                        <Input
                          type="date"
                          size={{ base: "md", md: "lg" }}
                          bg="gray.100"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                          {...register("dataInicioLista", {
                            required: "Data de início é obrigatória",
                          })}
                        />
                        <Input
                          type="time"
                          size={{ base: "md", md: "lg" }}
                          bg="gray.100"
                          border="1px solid"
                          borderColor="gray.200"
                          borderRadius="lg"
                          _hover={{ borderColor: "gray.300" }}
                          _focus={{
                            borderColor: "primary.900",
                            boxShadow: "0 0 0 1px primary.900",
                          }}
                          {...register("horarioInicioLista", {
                            required: "Horário de início é obrigatório",
                          })}
                        />
                      </HStack>
                      <FormErrorMessage>
                        {(errors.dataInicioLista &&
                          errors.dataInicioLista.message) ||
                          (errors.horarioInicioLista &&
                            errors.horarioInicioLista.message)}
                      </FormErrorMessage>
                    </FormControl>

                    {/* Botão de Criar */}
                    <Button
                      type="submit"
                      size={{ base: "md", md: "lg" }}
                      bg="primary.900"
                      color="white"
                      _hover={{ bg: "primary.800" }}
                      _active={{ bg: "primary.800" }}
                      isLoading={isCreating || isSubmitting}
                      loadingText="Criando..."
                      borderRadius="lg"
                      fontWeight="semibold"
                      mt={{ base: 4, md: 6 }}
                    >
                      Criar Pelada
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
};

export default CreateMatch;
