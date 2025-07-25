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
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { createMatch } from "../api/matchService";

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
    <Box minH="100vh" bg="gray.50" pb="80px">
      <Container maxW="container.xl" px={4} py={6}>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack spacing={3} mb={4}>
            <IconButton
              icon={<FiArrowLeft />}
              variant="ghost"
              size="lg"
              aria-label="Voltar"
              onClick={() => navigate("/")}
            />
            <Box>
              <Heading size="lg" color="gray.800">
                Nova Pelada
              </Heading>
            </Box>
          </HStack>

          {/* Formulário */}
          <Card borderRadius="2xl" boxShadow="sm">
            <CardBody p={6}>
              <VStack spacing={6} align="stretch">
                <Box textAlign="center" mb={4}>
                  <Heading size="md" color="gray.800" mb={2}>
                    Criar Pelada
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Configure os detalhes da nova pelada
                  </Text>
                </Box>

                <form onSubmit={handleSubmit(onSubmit)}>
                  <VStack spacing={6} align="stretch">
                    {/* Local */}
                    <FormControl isInvalid={errors.local}>
                      <FormLabel color="gray.700" fontWeight="semibold">
                        Local
                      </FormLabel>
                      <Select
                        placeholder="Selecione o local"
                        size="lg"
                        bg="white"
                        border="1px"
                        borderColor="gray.300"
                        _hover={{ borderColor: "gray.400" }}
                        _focus={{
                          borderColor: "green.500",
                          boxShadow: "0 0 0 1px #38A169",
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
                      <FormLabel color="gray.700" fontWeight="semibold">
                        Data e Horário da Pelada
                      </FormLabel>
                      <HStack spacing={3}>
                        <Input
                          type="date"
                          size="lg"
                          bg="white"
                          border="1px"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "green.500",
                            boxShadow: "0 0 0 1px #38A169",
                          }}
                          {...register("date", {
                            required: "Data é obrigatória",
                          })}
                        />
                        <Input
                          type="time"
                          size="lg"
                          bg="white"
                          border="1px"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "green.500",
                            boxShadow: "0 0 0 1px #38A169",
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
                      <FormLabel color="gray.700" fontWeight="semibold">
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
                            size="lg"
                            min={2}
                            max={50}
                            bg="white"
                          >
                            <NumberInputField
                              border="1px"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{
                                borderColor: "green.500",
                                boxShadow: "0 0 0 1px #38A169",
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
                      <FormLabel color="gray.700" fontWeight="semibold">
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
                            size="lg"
                            min={1}
                            max={25}
                            bg="white"
                          >
                            <NumberInputField
                              border="1px"
                              borderColor="gray.300"
                              _hover={{ borderColor: "gray.400" }}
                              _focus={{
                                borderColor: "green.500",
                                boxShadow: "0 0 0 1px #38A169",
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
                      <FormLabel color="gray.700" fontWeight="semibold">
                        Data e Horário de Início da Lista de Presença
                      </FormLabel>
                      <Text fontSize="sm" color="gray.500" mb={2}>
                        Automaticamente definido para 3 dias antes da pelada às
                        18h
                      </Text>
                      <HStack spacing={3}>
                        <Input
                          type="date"
                          size="lg"
                          bg="gray.100"
                          border="1px"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "green.500",
                            boxShadow: "0 0 0 1px #38A169",
                          }}
                          {...register("dataInicioLista", {
                            required: "Data de início é obrigatória",
                          })}
                        />
                        <Input
                          type="time"
                          size="lg"
                          bg="gray.100"
                          border="1px"
                          borderColor="gray.300"
                          _hover={{ borderColor: "gray.400" }}
                          _focus={{
                            borderColor: "green.500",
                            boxShadow: "0 0 0 1px #38A169",
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
                      size="lg"
                      bg="black"
                      color="white"
                      _hover={{ bg: "gray.800" }}
                      _active={{ bg: "gray.900" }}
                      isLoading={isCreating || isSubmitting}
                      loadingText="Criando..."
                      borderRadius="lg"
                      fontWeight="semibold"
                      mt={6}
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
